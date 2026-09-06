const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id).select('-password');

    if (!doctor) {
      return sendError(res, 'Not authorized. Doctor not found.', 401);
    }

    if (!doctor.isActive) {
      return sendError(res, 'Account has been deactivated.', 403);
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please log in again.', 401);
    }
    return sendError(res, 'Not authorized.', 401);
  }
};

module.exports = { protect };
