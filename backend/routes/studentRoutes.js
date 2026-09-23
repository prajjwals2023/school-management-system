const express = require('express');
const router = express.Router();
const { getStudentProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Student profile is accessible by authenticated users (RBAC enforced in controller)
router.use(protect);
router.get('/:id', getStudentProfile);

module.exports = router;
