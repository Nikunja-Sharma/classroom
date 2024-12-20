const router = require('express').Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { photoUploadMiddleware } = require('./upload');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);


router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, photoUploadMiddleware, updateProfile);



module.exports = router; 