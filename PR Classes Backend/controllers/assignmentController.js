const Assignment = require('../models/Assignment');
const env = require('dotenv');
env.config();

// Helper function to convert file path to URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  return `${process.env.BASE_URL}/uploads/assignments/${filePath.split('\\').pop()}`;
};

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const { title, subject, description, dueDate } = req.body;
    // console.log(req.user);
    const assignment = new Assignment({
      title,
      subject,
      description,
      dueDate,
      createdBy: req.user._id
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments created by a teacher
const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate('submissions.student', 'fullName studentId email');
    
    // Convert file paths to URLs
    const assignmentsWithUrls = assignments.map(assignment => ({
      ...assignment._doc,
      submissions: assignment.submissions.map(sub => ({
        ...sub._doc,
        submissionFile: (sub.submissionFile)
      }))
    }));
    
    res.json(assignmentsWithUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments for a student with submission status
const getStudentAssignments = async (req, res) => {
  try {
    // Get all assignments and populate teacher details
    const assignments = await Assignment.find()
      .populate('createdBy', 'fullName teacherId department')
      .sort({ dueDate: 1 }); // Sort by due date ascending
    
    // Process assignments to add submission status
    const processedAssignments = assignments.map(assignment => {
      // Find this student's submission if it exists
      const studentSubmission = assignment.submissions.find(
        sub => sub.student.toString() === req.user._id.toString()
      );

      // Calculate status
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      let status = 'pending'; // default status

      if (studentSubmission) {
        status = 'submitted';
      } else if (now > dueDate) {
        status = 'overdue';
      }

      // Return processed assignment
      return {
        _id: assignment._id,
        title: assignment.title,
        subject: assignment.subject,
        description: assignment.description,
        dueDate: assignment.dueDate,
        createdAt: assignment.createdAt,
        teacher: assignment.createdBy,
        status,
        submission: studentSubmission ? {
          submittedAt: studentSubmission.submittedAt,
          fileUrl: studentSubmission.submissionFile
        } : null,
        isLate: studentSubmission ? 
          new Date(studentSubmission.submittedAt) > dueDate : 
          false
      };
    });

    // Separate assignments into categories
    const response = {
      submitted: processedAssignments.filter(a => a.status === 'submitted'),
      pending: processedAssignments.filter(a => a.status === 'pending'),
      overdue: processedAssignments.filter(a => a.status === 'overdue'),
      summary: {
        total: processedAssignments.length,
        submitted: processedAssignments.filter(a => a.status === 'submitted').length,
        pending: processedAssignments.filter(a => a.status === 'pending').length,
        overdue: processedAssignments.filter(a => a.status === 'overdue').length,
        lateSubmissions: processedAssignments.filter(a => a.isLate).length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if assignment is past due date
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    // Check if student has already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.submissionFile = getFileUrl(req.file.path);
      existingSubmission.submittedAt = Date.now();
    } else {
      // Add new submission
      assignment.submissions.push({
        student: req.user._id,
        submissionFile: getFileUrl(req.file.path)
      });
    }

    await assignment.save();

    res.json({ 
      message: 'Assignment submitted successfully',
      submission: {
        fileName: req.file.originalname,
        submittedAt: new Date(),
        fileUrl: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  submitAssignment,
}; 