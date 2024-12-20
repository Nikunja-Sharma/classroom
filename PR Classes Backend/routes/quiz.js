const router = require('express').Router();
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');
const {
  createQuiz,
  getTeacherQuizzes,
  getAvailableQuizzes,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getStudentQuizzes,
  getQuizById
} = require('../controllers/quizController');

// Create a new quiz (teachers only)
router.post('/', verifyToken, isTeacher, createQuiz);

// Get all quizzes for a teacher
router.get('/teacher/quizzes', verifyToken, isTeacher, getTeacherQuizzes);

// Get all available quizzes for a student
router.get('/student/available-quizzes', verifyToken, isStudent, getAvailableQuizzes);
router.get('/student/quizzes', verifyToken, isStudent, getStudentQuizzes);

// Get a quiz by ID
router.get('/:quizId', verifyToken, isTeacher, getQuizById);

// Get a quiz by ID for a student
router.get('/student/:quizId', verifyToken, isStudent, getQuizById);

// Update a quiz (teachers only)
router.put('/:quizId', verifyToken, isTeacher, updateQuiz);

// Delete a quiz (teachers only)
router.delete('/:quizId', verifyToken, isTeacher, deleteQuiz);

// Submit a quiz (students only)
router.post('/:quizId/submit', verifyToken, isStudent, submitQuiz);

module.exports = router; 