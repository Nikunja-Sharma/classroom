const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      fullName,
      department,
      phoneNumber,
      studentId,
      teacherId,
      yearOfStudy
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role-specific required fields
    if (role === 'student' && (!studentId || !yearOfStudy)) {
      return res.status(400).json({ message: 'Student ID and Year of Study are required for students' });
    }

    if (role === 'teacher' && !teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required for teachers' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      fullName,
      department,
      phoneNumber,
      ...(role === 'student' && { studentId, yearOfStudy }),
      ...(role === 'teacher' && { teacherId })
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and assign token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        phoneNumber: user.phoneNumber,
        ...(user.role === 'student' && { 
          studentId: user.studentId,
          yearOfStudy: user.yearOfStudy 
        }),
        ...(user.role === 'teacher' && { 
          teacherId: user.teacherId 
        })
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







const getProfile = async (req, res) => {    
  try {
    // Fetch fresh user data from database
    const user = await User.findById(req.user._id)
      .select('-password') // Exclude password field
      .lean(); // Convert to plain JavaScript object

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add role-specific data
    let profileData = {
      ...user,
      roleInfo: {}
    };

    if (user.role === 'student') {
      profileData.roleInfo = {
        type: 'Student',
        studentId: user.studentId,
        yearOfStudy: user.yearOfStudy
      };
    } else if (user.role === 'teacher') {
      profileData.roleInfo = {
        type: 'Teacher',
        teacherId: user.teacherId
      };
    }

    // Add timestamps in a more readable format
    profileData.joinedAt = user.createdAt;
    profileData.lastUpdated = user.updatedAt;

    res.json({
      message: 'Profile retrieved successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to convert file path to URL
const getPhotoUrl = (filePath) => {
  if (!filePath) return null;
  return `${process.env.BASE_URL}/uploads/profiles/${filePath.split('\\').pop()}`;
};

// Update the updateProfile function
const updateProfile = async (req, res) => {
  try {
    const { 
      fullName, 
      department, 
      phoneNumber,
      yearOfStudy,
      studentId,
      teacherId
    } = req.body;

    // Fields that can be updated
    const updates = {
      fullName,
      department,
      phoneNumber
    };

    // Add photo if uploaded
    if (req.file) {
      updates.photo = getPhotoUrl(req.file.path);
    }

    // Add role-specific fields
    if (req.user.role === 'student') {
      updates.yearOfStudy = yearOfStudy;
      updates.studentId = studentId;
    } else if (req.user.role === 'teacher') {
      updates.teacherId = teacherId;
    }

    // Remove undefined fields
    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    // Update user with new values
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Remove password from response
    const user = updatedUser.toObject();
    delete user.password;

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  register,
  login,
  getProfile,
  updateProfile
}; 