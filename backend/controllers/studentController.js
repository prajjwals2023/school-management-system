const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const { canAccessClass } = require('../middleware/roleMiddleware');

// @desc    Get Detailed Student Profile (with attendance history and marks report)
// @route   GET /api/students/:id
// @access  Private (Principal OR assigned Class Teacher)
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('classId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // STRICT RBAC CHECK:
    // Principal can view any student.
    // Teacher can ONLY view students belonging to their assigned class.
    if (!canAccessClass(req.user, student.classId._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view students from other classes',
      });
    }

    // Fetch Attendance History
    const attendanceRecords = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a) => a.status === 'Present').length;
    const absentCount = totalAttendance - presentCount;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Fetch Marks History
    const marksRecords = await Marks.find({ studentId: student._id }).sort({ exam: 1, subject: 1 });

    // Group marks by Exam
    const marksByExam = {};
    let totalMarksEarned = 0;
    let totalMaxMarks = 0;

    marksRecords.forEach((m) => {
      if (!marksByExam[m.exam]) {
        marksByExam[m.exam] = [];
      }
      marksByExam[m.exam].push(m);
      totalMarksEarned += m.marks;
      totalMaxMarks += m.maxMarks;
    });

    const overallMarksPercentage =
      totalMaxMarks > 0 ? Math.round((totalMarksEarned / totalMaxMarks) * 100) : null;

    res.status(200).json({
      success: true,
      data: {
        student,
        attendance: {
          totalDays: totalAttendance,
          presentDays: presentCount,
          absentDays: absentCount,
          rate: attendanceRate,
          recentRecords: attendanceRecords.slice(0, 30), // Latest 30 entries
        },
        academics: {
          overallPercentage: overallMarksPercentage,
          totalEarned: totalMarksEarned,
          totalMax: totalMaxMarks,
          marksByExam,
          allMarks: marksRecords,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile',
      error: error.message,
    });
  }
};
