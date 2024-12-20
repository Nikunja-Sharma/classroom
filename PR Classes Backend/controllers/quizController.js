const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');

// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { title, subject, duration, dueDate, questions } = req.body;

    const quiz = new Quiz({
      title,
      subject,
      duration,
      dueDate,
      questions,
      createdBy: req.user._id,
      totalQuestions: questions.length
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all quizzes for a teacher
const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available quizzes for students
const getAvailableQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      status: 'published',
      dueDate: { $gt: new Date() }
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quizzes for a student with submission status
const getStudentQuizzes = async (req, res) => {
  try {
    // Get all published quizzes with complete teacher info
    const quizzes = await Quiz.find({ status: 'published' })
      .populate('createdBy', 'fullName teacherId department email phoneNumber')
      .sort({ dueDate: 1 });

    // Get all submissions for this student
    const submissions = await QuizSubmission.find({
      student: req.user._id
    });

    // Process quizzes to add submission status
    const processedQuizzes = quizzes.map(quiz => {
      const submission = submissions.find(
        sub => sub.quiz.toString() === quiz._id.toString()
      );

      // Calculate status
      const now = new Date();
      const dueDate = new Date(quiz.dueDate);
      let status = 'pending'; // default status

      if (submission) {
        status = 'submitted';
      } else if (now > dueDate) {
        status = 'overdue';
      }

      // Return processed quiz with complete teacher details
      return {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        duration: quiz.duration,
        dueDate: quiz.dueDate,
        totalQuestions: quiz.totalQuestions,
        createdAt: quiz.createdAt,
        teacher: {
          _id: quiz.createdBy._id,
          fullName: quiz.createdBy.fullName,
          teacherId: quiz.createdBy.teacherId,
          department: quiz.createdBy.department,
          email: quiz.createdBy.email,
          phoneNumber: quiz.createdBy.phoneNumber
        },
        status,
        submission: submission ? {
          submittedAt: submission.submittedAt,
          score: submission.score,
          totalScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
          percentage: (submission.score / quiz.questions.reduce((sum, q) => sum + q.points, 0) * 100).toFixed(2)
        } : null,
        isLate: submission ? 
          new Date(submission.submittedAt) > dueDate : 
          false
      };
    });

    // Separate quizzes into categories
    const response = {
      submitted: processedQuizzes.filter(q => q.status === 'submitted'),
      pending: processedQuizzes.filter(q => q.status === 'pending'),
      overdue: processedQuizzes.filter(q => q.status === 'overdue'),
      summary: {
        total: processedQuizzes.length,
        submitted: processedQuizzes.filter(q => q.status === 'submitted').length,
        pending: processedQuizzes.filter(q => q.status === 'pending').length,
        overdue: processedQuizzes.filter(q => q.status === 'overdue').length,
        lateSubmissions: processedQuizzes.filter(q => q.isLate).length,
        averageScore: processedQuizzes
          .filter(q => q.submission)
          .reduce((avg, q, _, arr) => {
            return avg + (parseFloat(q.submission.percentage) / arr.length);
          }, 0)
          .toFixed(2)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get student quizzes error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a quiz
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      quiz[key] = updates[key];
    });

    if (updates.questions) {
      quiz.totalQuestions = updates.questions.length;
    }

    await quiz.save();
    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.quizId,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit a quiz
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const submission = new QuizSubmission({
      quiz: quiz._id,
      student: req.user._id,
      answers: req.body.answers,
      status: 'completed',
      submittedAt: new Date()
    });

    // Calculate score
    let score = 0;
    submission.answers.forEach(answer => {
      const question = quiz.questions.id(answer.questionId);
      const selectedOption = question.options.id(answer.selectedOption);
      if (selectedOption && selectedOption.isCorrect) {
        score += question.points;
      }
    });

    submission.score = score;
    await submission.save();

    res.json({ message: 'Quiz submitted successfully', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    // Populate complete teacher details
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('createdBy', 'fullName teacherId department email phoneNumber');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // If student is requesting, check if they've already submitted
    if (req.user.role === 'student') {
      const submission = await QuizSubmission.findOne({
        quiz: quiz._id,
        student: req.user._id
      });

      const now = new Date();
      const dueDate = new Date(quiz.dueDate);
      let status = 'pending';

      if (submission) {
        status = 'submitted';
      } else if (now > dueDate) {
        status = 'overdue';
      }

      // Return quiz with submission status and complete teacher details for students
      return res.json({
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        duration: quiz.duration,
        dueDate: quiz.dueDate,
        totalQuestions: quiz.totalQuestions,
        createdAt: quiz.createdAt,
        teacher: {
          _id: quiz.createdBy._id,
          fullName: quiz.createdBy.fullName,
          teacherId: quiz.createdBy.teacherId,
          department: quiz.createdBy.department,
          email: quiz.createdBy.email,
          phoneNumber: quiz.createdBy.phoneNumber
        },
        status,
        submission: submission ? {
          submittedAt: submission.submittedAt,
          score: submission.score,
          totalScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
          percentage: (submission.score / quiz.questions.reduce((sum, q) => sum + q.points, 0) * 100).toFixed(2)
        } : null,
        isLate: submission ? 
          new Date(submission.submittedAt) > dueDate : 
          false,
        // Only send questions if not submitted and not overdue
        questions: (!submission && now <= dueDate) ? quiz.questions : undefined
      });
    }

    // If teacher is requesting, return full quiz details with all submissions
    if (req.user.role === 'teacher') {
      // Verify if the teacher owns this quiz
      if (quiz.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. Not your quiz.' });
      }

      const submissions = await QuizSubmission.find({ quiz: quiz._id })
        .populate('student', 'fullName studentId email');

      return res.json({
        ...quiz._doc,
        submissions: submissions.map(sub => ({
          student: sub.student,
          submittedAt: sub.submittedAt,
          score: sub.score,
          totalScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
          percentage: (sub.score / quiz.questions.reduce((sum, q) => sum + q.points, 0) * 100).toFixed(2),
          answers: sub.answers
        }))
      });
    }

    res.status(403).json({ message: 'Invalid role' });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuiz,
  getTeacherQuizzes,
  getAvailableQuizzes,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getStudentQuizzes,
  getQuizById
}; 