const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Please provide student ID'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide student name'],
    trim: true,
  },
  fatherName: {
    type: String,
    required: [true, 'Please provide father name'],
    trim: true,
  },
  motherName: {
    type: String,
    required: [true, 'Please provide mother name'],
    trim: true,
  },
  dateOfBirth: {
    type: String,
    required: [true, 'Please provide date of birth'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please provide gender'],
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide class ID'],
  },
  section: {
    type: String,
    default: 'A',
  },
  rollNumber: {
    type: Number,
    required: [true, 'Please provide roll number'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide contact number'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide residential address'],
    trim: true,
  }
}, { timestamps: true });

// Compound index to ensure rollNumber is unique per class & section
studentSchema.index({ classId: 1, section: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
