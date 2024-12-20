const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Class = require('../models/classes');
const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');

const getTeacherDashboard = async (req, res) => {
  try {
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisWeek = new Date(now.setDate(now.getDate() - 7));
    const thisMonth = new Date(now.setMonth(now.getMonth() - 1));

    // Parallel fetch all required data
    const [
      classes,
      assignments,
      quizzes,
      students,
      quizSubmissions
    ] = await Promise.all([
      // Get teacher's classes
      Class.find({ teacher: req.user._id })
        .populate('students', 'fullName studentId email'),

      // Get teacher's assignments
      Assignment.find({ createdBy: req.user._id })
        .populate('submissions.student', 'fullName studentId'),

      // Get teacher's quizzes
      Quiz.find({ createdBy: req.user._id })
        .select('_id title dueDate'),

      // Get all students (for department statistics)
      User.find({ role: 'student', department: req.user.department }),

      // Fix quiz submissions query - use quizzes from the same Promise.all
      QuizSubmission.find({
        quiz: { $in: (await Quiz.find({ createdBy: req.user._id })).map(q => q._id) }
      }).populate('student', 'fullName studentId')
        .populate('quiz', 'title')
    ]);

    // Process and compile dashboard data
    const dashboardData = {
      overview: {
        totalClasses: classes.length,
        totalStudents: [...new Set(classes.flatMap(c => c.students))].length,
        totalAssignments: assignments.length,
        totalQuizzes: quizzes.length,
        departmentStudents: students.length
      },

      recentActivity: {
        newSubmissions: {
          assignments: assignments.reduce((count, assignment) => 
            count + assignment.submissions.filter(sub => 
              new Date(sub.submittedAt) > thisWeek
            ).length, 0),
          quizzes: quizSubmissions.filter(sub => 
            new Date(sub.submittedAt) > thisWeek
          ).length
        },
        upcomingDeadlines: {
          assignments: assignments.filter(a => 
            new Date(a.dueDate) > today
          ).length,
          quizzes: quizzes.filter(q => 
            new Date(q.dueDate) > today
          ).length
        }
      },

      classesOverview: classes.map(cls => ({
        _id: cls._id,
        className: cls.className,
        courseCode: cls.courseCode,
        studentCount: cls.students.length,
        schedule: cls.schedule
      })),

      performanceMetrics: {
        assignments: {
          total: assignments.length,
          submissionRate: calculateSubmissionRate(assignments),
          onTimeSubmissionRate: calculateOnTimeRate(assignments)
        },
        quizzes: {
          total: quizzes.length,
          averageScore: calculateAverageQuizScore(quizSubmissions),
          participationRate: calculateQuizParticipationRate(quizzes, quizSubmissions)
        }
      },

      recentSubmissions: {
        assignments: getRecentSubmissions(assignments, 5),
        quizzes: getRecentQuizSubmissions(quizSubmissions, 5)
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisWeek = new Date(now.setDate(now.getDate() - 7));

    // Parallel fetch all required data
    const [
      enrolledClasses,
      assignments,
      quizzes,
      quizSubmissions,
      assignmentSubmissions
    ] = await Promise.all([
      // Get student's enrolled classes
      Class.find({ })
        .populate('teacher', 'fullName teacherId department'),

      // Get all assignments
      Assignment.find()
        .populate('createdBy', 'fullName teacherId'),

      // Get all quizzes
      Quiz.find({ status: 'published' })
        .select('_id title dueDate createdBy'),

      // Get student's quiz submissions
      QuizSubmission.find({ student: req.user._id })
        .populate('quiz', 'title dueDate'),

      // Get student's assignment submissions from all assignments
      Assignment.find({
        'submissions.student': req.user._id
      }).select('title dueDate submissions')
    ]);

    // Process and compile dashboard data
    const dashboardData = {
      overview: {
        totalClasses: enrolledClasses.length,
        totalTeachers: [...new Set(enrolledClasses.map(c => c.teacher._id.toString()))].length,
        totalAssignments: assignments.length,
        totalQuizzes: quizzes.length
      },

      academicProgress: {
        assignments: {
          total: assignments.length,
          submitted: assignmentSubmissions.length,
          pending: assignments.length - assignmentSubmissions.length,
          overdue: assignments.filter(a => 
            !assignmentSubmissions.find(s => s._id.equals(a._id)) && 
            new Date(a.dueDate) < today
          ).length
        },
        quizzes: {
          total: quizzes.length,
          completed: quizSubmissions.length,
          pending: quizzes.length - quizSubmissions.length,
          averageScore: calculateAverageQuizScore(quizSubmissions)
        }
      },

      recentActivity: {
        submissions: {
          assignments: assignmentSubmissions.filter(sub => 
            new Date(sub.submissions.find(s => 
              s.student.toString() === req.user._id.toString()
            ).submittedAt) > thisWeek
          ).length,
          quizzes: quizSubmissions.filter(sub => 
            new Date(sub.submittedAt) > thisWeek
          ).length
        },
        upcomingDeadlines: {
          assignments: assignments.filter(a => 
            new Date(a.dueDate) > today && 
            !assignmentSubmissions.find(s => s._id.equals(a._id))
          ).length,
          quizzes: quizzes.filter(q => 
            new Date(q.dueDate) > today && 
            !quizSubmissions.find(s => s.quiz._id.equals(q._id))
          ).length
        }
      },

      enrolledClasses: enrolledClasses.map(cls => ({
        _id: cls._id,
        className: cls.className,
        courseCode: cls.courseCode,
        teacher: {
          name: cls.teacher.fullName,
          department: cls.teacher.department
        },
        schedule: cls.schedule
      })),

      upcomingDeadlines: [
        ...assignments
          .filter(a => new Date(a.dueDate) > today)
          .map(a => ({
            type: 'assignment',
            title: a.title,
            dueDate: a.dueDate,
            teacher: a.createdBy.fullName,
            submitted: assignmentSubmissions.some(s => s._id.equals(a._id))
          })),
        ...quizzes
          .filter(q => new Date(q.dueDate) > today)
          .map(q => ({
            type: 'quiz',
            title: q.title,
            dueDate: q.dueDate,
            submitted: quizSubmissions.some(s => s.quiz._id.equals(q._id))
          }))
      ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
const calculateSubmissionRate = (assignments) => {
  const totalPossibleSubmissions = assignments.reduce((sum, a) => 
    sum + a.submissions.length, 0);
  const actualSubmissions = assignments.reduce((sum, a) => 
    sum + a.submissions.length, 0);
  return totalPossibleSubmissions ? 
    ((actualSubmissions / totalPossibleSubmissions) * 100).toFixed(2) : 0;
};

const calculateOnTimeRate = (assignments) => {
  const onTimeSubmissions = assignments.reduce((sum, a) => {
    return sum + a.submissions.filter(sub => 
      new Date(sub.submittedAt) <= new Date(a.dueDate)
    ).length;
  }, 0);
  const totalSubmissions = assignments.reduce((sum, a) => 
    sum + a.submissions.length, 0);
  return totalSubmissions ? 
    ((onTimeSubmissions / totalSubmissions) * 100).toFixed(2) : 0;
};

const calculateAverageQuizScore = (submissions) => {
  if (!submissions.length) return 0;
  const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
  return (totalScore / submissions.length).toFixed(2);
};

const calculateQuizParticipationRate = (quizzes, submissions) => {
  const totalPossibleSubmissions = quizzes.length;
  return totalPossibleSubmissions ? 
    ((submissions.length / totalPossibleSubmissions) * 100).toFixed(2) : 0;
};

const getRecentSubmissions = (assignments, limit) => {
  return assignments
    .flatMap(a => a.submissions.map(sub => ({
      assignmentTitle: a.title,
      studentName: sub.student.fullName,
      studentId: sub.student.studentId,
      submittedAt: sub.submittedAt
    })))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, limit);
};

const getRecentQuizSubmissions = (submissions, limit) => {
  return submissions
    .map(sub => ({
      quizTitle: sub.quiz.title,
      studentName: sub.student.fullName,
      studentId: sub.student.studentId,
      score: sub.score,
      submittedAt: sub.submittedAt
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, limit);
};

module.exports = {
  getTeacherDashboard,
  getStudentDashboard
}; 