const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    }
  }],
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for efficient querying
classSchema.index({ courseCode: 1, semester: 1, academicYear: 1 }, { unique: true });

// Virtual field for current enrollment count
classSchema.virtual('enrollmentCount').get(function() {
  return this.students.length;
});

// Method to check if class is full
classSchema.methods.isFull = function() {
  return this.students.length >= this.maxStudents;
};

// Method to check if a student is enrolled
classSchema.methods.isStudentEnrolled = function(studentId) {
  return this.students.includes(studentId);
};

module.exports = mongoose.model('Class', classSchema);
