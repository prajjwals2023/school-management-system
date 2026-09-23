require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create 10 Classes
    const classNames = [
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
    ];

    const createdClasses = [];
    for (const name of classNames) {
      const cls = await Class.create({
        className: name,
        section: 'A',
      });
      createdClasses.push(cls);
    }
    console.log(`Created ${createdClasses.length} classes.`);

    // Find Class 5 and Class 10
    const class5 = createdClasses.find((c) => c.className === 'Class 5');
    const class10 = createdClasses.find((c) => c.className === 'Class 10');

    // 2. Create Super Admin & Principal
    const admin = await User.create({
      name: 'System Administrator (Admin)',
      email: 'admin@school.com',
      password: 'password123',
      role: 'admin',
      classId: null,
    });
    console.log('Created Super Admin account: admin@school.com');

    const principal = await User.create({
      name: 'Mr. Sharma (Principal)',
      email: 'principal@school.com',
      password: 'password123',
      role: 'principal',
      classId: null,
    });
    console.log('Created Principal account: principal@school.com');

    // 3. Create Teachers
    const teacherConfigs = [
      { name: 'Anita Desai', email: 'anita@school.com', classIndex: 0 },
      { name: 'Vikram Singh', email: 'vikram@school.com', classIndex: 1 },
      { name: 'Sunita Rao', email: 'sunita@school.com', classIndex: 2 },
      { name: 'Manoj Joshi', email: 'manoj@school.com', classIndex: 3 },
      { name: 'Rahul Kumar', email: 'rahul@school.com', classIndex: 4 }, // Class 5 Teacher
      { name: 'Sneha Roy', email: 'sneha@school.com', classIndex: 5 },
      { name: 'Amitabh Sen', email: 'amitabh@school.com', classIndex: 6 },
      { name: 'Kavita Nair', email: 'kavita@school.com', classIndex: 7 },
      { name: 'Deepak Verma', email: 'deepak@school.com', classIndex: 8 },
      { name: 'Priya Patel', email: 'priya@school.com', classIndex: 9 }, // Class 10 Teacher
    ];

    const teachers = [];
    for (const config of teacherConfigs) {
      const assignedClass = createdClasses[config.classIndex];
      const teacher = await User.create({
        name: config.name,
        email: config.email,
        password: 'password123',
        role: 'teacher',
        classId: assignedClass._id,
      });

      // Update class with teacherId
      assignedClass.teacherId = teacher._id;
      await assignedClass.save();
      teachers.push(teacher);
    }
    console.log(`Created ${teachers.length} teachers and linked to classes.`);

    // 4. Create Students across all classes
    const sampleNames = [
      { name: 'Aarav Sharma', father: 'Rajesh Sharma', mother: 'Sunita Sharma', gender: 'Male' },
      { name: 'Ananya Iyer', father: 'Karthik Iyer', mother: 'Lakshmi Iyer', gender: 'Female' },
      { name: 'Rohan Verma', father: 'Suresh Verma', mother: 'Pooja Verma', gender: 'Male' },
      { name: 'Diya Mehra', father: 'Alok Mehra', mother: 'Reena Mehra', gender: 'Female' },
      { name: 'Kabir Das', father: 'Harish Das', mother: 'Anita Das', gender: 'Male' },
      { name: 'Ishita Roy', father: 'Subir Roy', mother: 'Monika Roy', gender: 'Female' },
      { name: 'Vihaan Gupta', father: 'Naveen Gupta', mother: 'Sarita Gupta', gender: 'Male' },
      { name: 'Meera Nair', father: 'Radhakrishnan Nair', mother: 'Geetha Nair', gender: 'Female' },
    ];

    const allStudents = [];
    let studentCounter = 1000;

    for (let c = 0; c < createdClasses.length; c++) {
      const cls = createdClasses[c];
      const classNum = c + 1;
      const birthYear = 2020 - classNum; // rough birth year

      // Create 5 to 8 students per class
      const countForClass = c === 4 ? 8 : 5; // Class 5 has 8 students
      for (let i = 0; i < countForClass; i++) {
        studentCounter++;
        const sample = sampleNames[i % sampleNames.length];
        const student = await Student.create({
          studentId: `STU-${classNum}0${i + 1}`,
          name: sample.name,
          fatherName: sample.father,
          motherName: sample.mother,
          dateOfBirth: `${birthYear}-0${(i % 9) + 1}-15`,
          gender: sample.gender,
          classId: cls._id,
          section: 'A',
          rollNumber: i + 1,
          phone: `98765${studentCounter}`,
          address: `${10 + i * 5} School Road, Block ${String.fromCharCode(65 + (i % 5))}`,
        });
        allStudents.push(student);
      }
    }
    console.log(`Created ${allStudents.length} students across 10 classes.`);

    // 5. Seed Attendance for past 5 days + Today
    const dates = [];
    const now = new Date();
    for (let d = 4; d >= 0; d--) {
      const pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - d);
      dates.push(pastDate.toISOString().split('T')[0]);
    }

    let attendanceCount = 0;
    for (const student of allStudents) {
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        // 90% chance present, 10% absent
        const isAbsent = (student.rollNumber + i) % 7 === 0;
        await Attendance.create({
          studentId: student._id,
          classId: student.classId,
          date,
          status: isAbsent ? 'Absent' : 'Present',
        });
        attendanceCount++;
      }
    }
    console.log(`Created ${attendanceCount} attendance records.`);

    // 6. Seed Marks for Class 5 (and sample for others)
    const subjects = ['Mathematics', 'Science', 'English', 'Computer Science', 'Social Studies'];
    const exams = ['Unit Test 1', 'Midterm Examination'];

    let marksCount = 0;
    for (const student of allStudents) {
      for (const exam of exams) {
        for (const subject of subjects) {
          // Base score 75-95 based on roll number and subject
          const baseScore = 70 + ((student.rollNumber * 7 + subject.length * 3) % 28);
          await Marks.create({
            studentId: student._id,
            classId: student.classId,
            subject,
            exam,
            marks: baseScore,
            maxMarks: 100,
          });
          marksCount++;
        }
      }
    }
    console.log(`Created ${marksCount} marks records across exams & subjects.`);

    console.log('\n======================================================');
    console.log('DATABASE SEEDING COMPLETE!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('Principal:');
    console.log('  Email:    principal@school.com');
    console.log('  Password: password123');
    console.log('Teacher (Class 5-A):');
    console.log('  Email:    rahul@school.com');
    console.log('  Password: password123');
    console.log('Teacher (Class 10-A):');
    console.log('  Email:    priya@school.com');
    console.log('  Password: password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
};

seedData();
