const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorizeRoles('admin'));

// System Stats
router.get('/stats', getStats);

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Class Management
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

module.exports = router;