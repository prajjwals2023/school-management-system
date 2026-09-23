const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllClasses,
  getClassStudents,
  getAllStudents,
  getAllTeachers,
} = require('../controllers/principalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All principal routes require valid JWT and principal role
router.use(protect);
router.use(authorizeRoles('principal'));

router.get('/stats', getDashboardStats);
router.get('/classes', getAllClasses);
router.get('/classes/:classId/students', getClassStudents);
router.get('/students', getAllStudents);
router.get('/teachers', getAllTeachers);

module.exports = router;
