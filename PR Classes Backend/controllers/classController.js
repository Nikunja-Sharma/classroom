const Class = require('../models/classes');

// Create a new class (teacher only)
const createClass = async (req, res) => {
  try {
    const { 
      className, 
      courseCode, 
      department, 
      schedule, 
      semester,
      academicYear,
      description,
      maxStudents 
    } = req.body;

    const newClass = new Class({
      className,
      courseCode,
      department,
      teacher: req.user._id,
      schedule,
      semester,
      academicYear,
      description,
      maxStudents
    });

    await newClass.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A class with this course code already exists for this semester' 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all classes for a teacher
const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('teacher', 'fullName teacherId department')
      .populate('students', 'fullName studentId email')
      .sort({ createdAt: -1 });

    res.json({
      classes,
      summary: {
        totalClasses: classes.length,
        totalStudents: classes.reduce((sum, cls) => sum + cls.students.length, 0),
        activeClasses: classes.filter(cls => cls.isActive).length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available classes for students
const getStudentClasses = async (req, res) => {
  try {
    // Get all classes where the student is enrolled
    const enrolledClasses = await Class.find({
    })
    .populate('teacher', 'fullName teacherId department email phoneNumber')
    .sort({ createdAt: -1 });

    // const enrolledClasses = await Class.find({
    //   students: req.user._id,
    //   isActive: true
    // })
    // .populate('teacher', 'fullName teacherId department email phoneNumber')
    // .sort({ createdAt: -1 });

    // Get all active classes
    const allActiveClasses = await Class.find({ 
      isActive: true 
    })
    .populate('teacher', 'fullName teacherId department email phoneNumber');

    // Separate available classes (where student is not enrolled)
    const availableClasses = allActiveClasses.filter(cls => 
      !cls.students.includes(req.user._id) && !cls.isFull()
    );
    res.json({
      enrolled: enrolledClasses,
      available: allActiveClasses,
      summary: {
        totalEnrolled: enrolledClasses.length,
        totalAvailable: availableClasses.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const classDetails = await Class.findById(req.params.classId)
      .populate('teacher', 'fullName teacherId department email phoneNumber')
      .populate('students', 'fullName studentId email');

    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  getClassById
}; 