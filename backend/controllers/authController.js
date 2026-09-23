const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Class = require('../models/Class');

// Helper to sign JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      classId: user.classId || null,
    },
    process.env.JWT_SECRET || 'supersecret_school_management_jwt_key_2025',
    { expiresIn: '7d' }
  );
};

// @desc    User Login (Principal / Teacher)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (include password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('classId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Prepare user response (hide password)
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      classId: user.classId ? user.classId._id : null,
      assignedClass: user.classId
        ? {
            _id: user.classId._id,
            className: user.classId.className,
            section: user.classId.section,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('classId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId ? user.classId._id : null,
        assignedClass: user.classId
          ? {
              _id: user.classId._id,
              className: user.classId.className,
              section: user.classId.section,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
      error: error.message,
    });
  }
};
