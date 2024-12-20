const router = require('express').Router();
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');
const { getTeacherDashboard, getStudentDashboard } = require('../controllers/dashboardController');

router.get('/teacher', verifyToken, isTeacher, getTeacherDashboard);
router.get('/student', verifyToken, isStudent, getStudentDashboard);

module.exports = router; 