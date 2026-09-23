const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getMyClassStudents,
  addStudent,
  updateStudent,
  getClassAttendance,
  saveClassAttendance,
  getClassMarks,
  saveClassMarks,
} = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles, ensureTeacherClass } = require('../middleware/roleMiddleware');

// All teacher routes require valid JWT, teacher role, and assigned class
router.use(protect);
router.use(authorizeRoles('teacher'));
router.use(ensureTeacherClass);

router.get('/dashboard', getDashboardStats);
router.get('/students', getMyClassStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.get('/attendance', getClassAttendance);
router.post('/attendance', saveClassAttendance);
router.get('/marks', getClassMarks);
router.post('/marks', saveClassMarks);

module.exports = router;
