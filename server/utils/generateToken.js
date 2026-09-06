const jwt = require('jsonwebtoken');

/**
 * Generate a JWT access token for a doctor
 */
const generateToken = (doctorId) => {
  return jwt.sign(
    { id: doctorId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
