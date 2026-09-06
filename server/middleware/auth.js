const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookie as fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh doctor data (excluding password)
    const doctor = await Doctor.findById(decoded.id).select('-password -passwordResetToken -passwordResetExpires');

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'The doctor associated with this token no longer exists.',
      });
    }

    if (!doctor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

// Role-based authorization (for future use)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.doctor.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.doctor.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
