const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true,
  },
  department: {
    type: String,
    // required: true,
  },
  phoneNumber: {
    type: String,
    // required: true,
  },
  // Student-specific fields
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  yearOfStudy: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  // Teacher-specific fields
  teacherId: {
    type: String,
    required: function() { return this.role === 'teacher'; }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 