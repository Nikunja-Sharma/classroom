const router = require('express').Router();
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');

// Route accessible only to teachers
router.get('/teacher-dashboard', verifyToken, isTeacher, (req, res) => {
  res.json({ 
    message: 'Teacher dashboard accessed successfully',
    user: req.user
  });
});

// Route accessible only to students
router.get('/student-dashboard', verifyToken, isStudent, (req, res) => {
  res.json({ 
    message: 'Student dashboard accessed successfully',
    user: req.user
  });
});

module.exports = router; 