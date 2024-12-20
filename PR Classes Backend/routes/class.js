const router = require('express').Router();
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');
const {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  getClassById
} = require('../controllers/classController');

// Teacher routes
router.post('/', verifyToken, isTeacher, createClass);
router.get('/teacher', verifyToken, isTeacher, getTeacherClasses);

// Student routes
router.get('/student', verifyToken, isStudent, getStudentClasses);

// Common routes
router.get('/:classId', verifyToken, getClassById);

module.exports = router; 