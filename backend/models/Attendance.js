const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide student ID'],
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide class ID'],
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Please provide date'],
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present',
    required: true,
  }
}, { timestamps: true });

// Prevent duplicate attendance for same student on same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
