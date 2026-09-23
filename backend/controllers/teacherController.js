const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// Helper to get formatted date string YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// @desc    Get Teacher Dashboard Stats
// @route   GET /api/teacher/dashboard
// @access  Private (Teacher)
exports.getDashboardStats = async (req, res) => {
  try {
    const classId = req.user.classId;
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'No class assigned to this teacher',
      });
    }

    const assignedClass = await Class.findById(classId);
    const totalStudents = await Student.countDocuments({ classId });

    const todayDate = req.query.date || getTodayDateString();

    const attendanceRecords = await Attendance.find({
      classId,
      date: todayDate,
    });

    const presentToday = attendanceRecords.filter((r) => r.status === 'Present').length;
    const absentToday = attendanceRecords.filter((r) => r.status === 'Absent').length;
    const totalMarked = attendanceRecords.length;

    const attendancePercentage =
      totalStudents > 0 && totalMarked > 0
        ? Math.round((presentToday / totalMarked) * 100)
        : null;

    res.status(200).json({
      success: true,
      data: {
        teacherName: req.user.name,
        classInfo: assignedClass,
        totalStudents,
        todayDate,
        totalMarked,
        presentToday,
        absentToday,
        attendancePercentage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

// @desc    Get All Students for Teacher's Assigned Class
// @route   GET /api/teacher/students
// @access  Private (Teacher)
exports.getMyClassStudents = async (req, res) => {
  try {
    const classId = req.user.classId;

    // Strict Scope: find students having same classId only
    const students = await Student.find({ classId }).sort({ rollNumber: 1 });

    // Compute attendance percentage for each student in this class
    const studentIds = students.map((s) => s._id);
    const attendanceStats = await Attendance.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$studentId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    attendanceStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        totalDays: stat.totalDays,
        presentDays: stat.presentDays,
        percentage:
          stat.totalDays > 0
            ? Math.round((stat.presentDays / stat.totalDays) * 100)
            : 0,
      };
    });

    const studentsWithStats = students.map((student) => {
      const stat = statsMap[student._id.toString()] || {
        totalDays: 0,
        presentDays: 0,
        percentage: 0,
      };
      return {
        ...student.toObject(),
        attendanceRate: stat.percentage,
        totalAttendanceDays: stat.totalDays,
        presentDays: stat.presentDays,
      };
    });

    res.status(200).json({
      success: true,
      count: studentsWithStats.length,
      data: studentsWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class students',
      error: error.message,
    });
  }
};

// @desc    Add a Student to Teacher's Assigned Class
// @route   POST /api/teacher/students
// @access  Private (Teacher)
exports.addStudent = async (req, res) => {
  try {
    const classId = req.user.classId;
    const assignedClass = await Class.findById(classId);

    const {
      studentId,
      name,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      rollNumber,
      phone,
      address,
    } = req.body;

    // Check if studentId or rollNumber already exists in this class
    const existingStudent = await Student.findOne({
      $or: [
        { studentId: studentId.trim() },
        { classId, section: assignedClass.section, rollNumber: Number(rollNumber) },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Student ID or Roll Number already exists in this class',
      });
    }

    const student = await Student.create({
      studentId: studentId.trim(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      dateOfBirth,
      gender,
      classId,
      section: assignedClass.section,
      rollNumber: Number(rollNumber),
      phone: phone.trim(),
      address: address.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add student',
    });
  }
};

// @desc    Update a Student in Teacher's Assigned Class
// @route   PUT /api/teacher/students/:id
// @access  Private (Teacher)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // STRICT RBAC CHECK: Teacher cannot edit student of another class
    if (String(student.classId) !== String(req.user.classId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit students belonging to your assigned class',
      });
    }

    const allowedUpdates = [
      'name',
      'fatherName',
      'motherName',
      'dateOfBirth',
      'gender',
      'rollNumber',
      'phone',
      'address',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update student',
    });
  }
};

// @desc    Get Class Attendance for a Date
// @route   GET /api/teacher/attendance
// @access  Private (Teacher)
exports.getClassAttendance = async (req, res) => {
  try {
    const classId = req.user.classId;
    const date = req.query.date || getTodayDateString();

    const students = await Student.find({ classId }).sort({ rollNumber: 1 });
    const attendanceRecords = await Attendance.find({ classId, date });

    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    const result = students.map((student) => ({
      studentId: student._id,
      customStudentId: student.studentId,
      name: student.name,
      rollNumber: student.rollNumber,
      status: attendanceMap[student._id.toString()] || 'Present', // Default to present if unmarked
      isMarked: Boolean(attendanceMap[student._id.toString()]),
    }));

    res.status(200).json({
      success: true,
      date,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message,
    });
  }
};

// @desc    Batch Submit/Update Attendance for Class
// @route   POST /api/teacher/attendance
// @access  Private (Teacher)
exports.saveClassAttendance = async (req, res) => {
  try {
    const classId = req.user.classId;
    const { date, records } = req.body;

    if (!date || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: date and records array required',
      });
    }

    // STRICT RBAC CHECK: Verify all students in records belong to teacher's class
    const studentIds = records.map((r) => r.studentId);
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      classId,
    });

    if (validStudents.length !== records.length) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: One or more students do not belong to your assigned class',
      });
    }

    // Bulk upsert attendance records
    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: { studentId: record.studentId, date },
        update: {
          $set: {
            studentId: record.studentId,
            classId,
            date,
            status: record.status === 'Absent' ? 'Absent' : 'Present',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save attendance',
      error: error.message,
    });
  }
};

// @desc    Get Class Marks
// @route   GET /api/teacher/marks
// @access  Private (Teacher)
exports.getClassMarks = async (req, res) => {
  try {
    const classId = req.user.classId;
    const { exam, subject } = req.query;

    const query = { classId };
    if (exam) query.exam = exam;
    if (subject) query.subject = subject;

    const marks = await Marks.find(query)
      .populate('studentId', 'name studentId rollNumber')
      .sort({ 'studentId.rollNumber': 1 });

    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marks',
      error: error.message,
    });
  }
};

// @desc    Save/Update Student Marks for Teacher's Class
// @route   POST /api/teacher/marks
// @access  Private (Teacher)
exports.saveClassMarks = async (req, res) => {
  try {
    const classId = req.user.classId;
    const { studentId, subject, exam, marks, maxMarks } = req.body;

    if (!studentId || !subject || !exam || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, subject, exam, and marks',
      });
    }

    // STRICT RBAC CHECK: Student must belong to teacher's class
    const student = await Student.findOne({ _id: studentId, classId });
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only record marks for students in your assigned class',
      });
    }

    const updatedMarks = await Marks.findOneAndUpdate(
      { studentId, subject, exam },
      {
        studentId,
        classId,
        subject,
        exam,
        marks: Number(marks),
        maxMarks: Number(maxMarks) || 100,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Marks recorded successfully',
      data: updatedMarks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record marks',
      error: error.message,
    });
  }
};
