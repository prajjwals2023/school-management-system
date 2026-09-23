const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// @desc    Get System Admin Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPrincipals = await User.countDocuments({ role: 'principal' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClasses = await Class.countDocuments();
    const totalStudents = await Student.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalPrincipals,
        totalTeachers,
        totalClasses,
        totalStudents,
        systemStatus: 'Optimal',
        serverUptime: process.uptime(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats',
      error: error.message,
    });
  }
};

// @desc    Get All System Users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }

    const users = await User.find(filter)
      .populate('classId', 'className section')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// @desc    Create a New User (Admin, Principal, Teacher)
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, classId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      classId: role === 'teacher' && classId ? classId : null,
    });

    // If teacher is assigned to a class, synchronize the class's teacherId
    if (role === 'teacher' && classId) {
      await Class.findByIdAndUpdate(classId, { teacherId: user._id });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
};

// @desc    Update a User
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, email, role, classId, password } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;

    // Synchronize class assignment if changed
    if (role === 'teacher') {
      const oldClassId = user.classId ? user.classId.toString() : null;
      const newClassId = classId || null;

      if (oldClassId && oldClassId !== newClassId) {
        // Unassign old class
        await Class.findByIdAndUpdate(oldClassId, { teacherId: null });
      }

      if (newClassId) {
        // Assign new class
        await Class.findByIdAndUpdate(newClassId, { teacherId: user._id });
      }

      user.classId = newClassId;
    } else {
      user.classId = null;
    }

    // Reset password if provided
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

// @desc    Delete a User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own active administrator account',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If teacher, clear teacherId in assigned class
    if (user.classId) {
      await Class.findByIdAndUpdate(user.classId, { teacherId: null });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// @desc    Get All Classes for Admin
// @route   GET /api/admin/classes
// @access  Private (Admin)
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId', 'name email').sort({ className: 1 });

    const studentCountAgg = await Student.aggregate([
      { $group: { _id: '$classId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    studentCountAgg.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const result = classes.map((cls) => ({
      _id: cls._id,
      className: cls.className,
      section: cls.section,
      teacher: cls.teacherId
        ? {
            _id: cls.teacherId._id,
            name: cls.teacherId.name,
            email: cls.teacherId.email,
          }
        : null,
      studentCount: countMap[cls._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message,
    });
  }
};

// @desc    Create a New Class
// @route   POST /api/admin/classes
// @access  Private (Admin)
exports.createClass = async (req, res) => {
  try {
    const { className, section, teacherId } = req.body;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Please provide class name',
      });
    }

    const newClass = await Class.create({
      className: className.trim(),
      section: (section || 'A').trim().toUpperCase(),
      teacherId: teacherId || null,
    });

    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, { classId: newClass._id });
    }

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create class',
    });
  }
};

// @desc    Update a Class & Reassign Teacher
// @route   PUT /api/admin/classes/:id
// @access  Private (Admin)
exports.updateClass = async (req, res) => {
  try {
    const targetClass = await Class.findById(req.params.id);
    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const { className, section, teacherId } = req.body;

    if (className) targetClass.className = className.trim();
    if (section) targetClass.section = section.trim().toUpperCase();

    // Reassign teacher logic with synchronization
    const oldTeacherId = targetClass.teacherId ? targetClass.teacherId.toString() : null;
    const newTeacherId = teacherId || null;

    if (oldTeacherId && oldTeacherId !== newTeacherId) {
      await User.findByIdAndUpdate(oldTeacherId, { classId: null });
    }

    if (newTeacherId && newTeacherId !== oldTeacherId) {
      // If the new teacher already had another class, clear that class
      const newTeacher = await User.findById(newTeacherId);
      if (newTeacher && newTeacher.classId && newTeacher.classId.toString() !== targetClass._id.toString()) {
        await Class.findByIdAndUpdate(newTeacher.classId, { teacherId: null });
      }
      await User.findByIdAndUpdate(newTeacherId, { classId: targetClass._id });
    }

    targetClass.teacherId = newTeacherId;
    await targetClass.save();

    res.status(200).json({
      success: true,
      message: 'Class and teacher assignment updated successfully',
      data: targetClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update class',
    });
  }
};

// @desc    Delete a Class
// @route   DELETE /api/admin/classes/:id
// @access  Private (Admin)
exports.deleteClass = async (req, res) => {
  try {
    const targetClass = await Class.findById(req.params.id);
    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Unassign teacher
    if (targetClass.teacherId) {
      await User.findByIdAndUpdate(targetClass.teacherId, { classId: null });
    }

    await targetClass.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message,
    });
  }
};