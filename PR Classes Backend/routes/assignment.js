const router = require('express').Router();
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createAssignment, getTeacherAssignments, getStudentAssignments, submitAssignment, getAvailableAssignments } = require('../controllers/assignmentController');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/assignments';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Sanitize filename and add timestamp
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
const uploadMiddleware = (req, res, next) => {
  upload.single('submission')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during upload
      return res.status(400).json({ 
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'File size is too large. Max size is 5MB'
          : 'Error uploading file'
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine
    next();
  });
};

// Routes
router.post('/', verifyToken, isTeacher, createAssignment);
router.get('/teacher', verifyToken, isTeacher, getTeacherAssignments);
router.get('/student', verifyToken, isStudent, getStudentAssignments);
router.post('/:assignmentId/submit', verifyToken, isStudent, uploadMiddleware, submitAssignment);
// router.get('/student/available-assignments', verifyToken, isStudent, getStudentAssignments);

module.exports = router; 