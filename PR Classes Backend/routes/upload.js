const multer = require('multer');
const fs = require('fs');

// Create uploads directory for profile photos
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  }
});

const uploadPhoto = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Error handling middleware for photo upload
const photoUploadMiddleware = (req, res, next) => {
  uploadPhoto.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'File size is too large. Max size is 2MB'
          : 'Error uploading file'
      });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = { photoUploadMiddleware }; 