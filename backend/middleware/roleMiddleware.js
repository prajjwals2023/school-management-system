// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Ensure teacher has an assigned class
const ensureTeacherClass = (req, res, next) => {
  if (req.user.role === 'teacher') {
    if (!req.user.classId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher has not been assigned to any class yet',
      });
    }
  }
  next();
};

// Check if current user is allowed to access/modify a specific class
const canAccessClass = (user, classId) => {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'principal') return true;
  if (user.role === 'teacher' && user.classId) {
    return String(user.classId) === String(classId);
  }
  return false;
};

module.exports = {
  authorizeRoles,
  ensureTeacherClass,
  canAccessClass,
};