const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: [true, 'Please provide subject'],
    trim: true,
  },
  exam: {
    type: String,
    required: [true, 'Please provide exam name'], // e.g., 'Unit Test 1', 'Midterm', 'Final'
    trim: true,
  },
  marks: {
    type: Number,
    required: [true, 'Please provide marks obtained'],
    min: 0,
  },
  maxMarks: {
    type: Number,
    default: 100,
  }
}, { timestamps: true });

// Prevent duplicate mark entry for same student, exam, and subject
marksSchema.index({ studentId: 1, exam: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
