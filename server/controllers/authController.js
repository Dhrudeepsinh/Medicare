const crypto = require('crypto');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Register a new doctor
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, licenseNumber, specialization, clinicName } = req.body;

    // Basic validation
    if (!name || !email || !password || !licenseNumber || !specialization) {
      return sendError(res, 'Please provide all required fields.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters.', 400);
    }

    // Check existing
    const existing = await Doctor.findOne({ $or: [{ email }, { licenseNumber }] });
    if (existing) {
      if (existing.email === email) return sendError(res, 'Email already registered.', 409);
      if (existing.licenseNumber === licenseNumber) return sendError(res, 'License number already registered.', 409);
    }

    const doctor = await Doctor.create({
      name,
      email,
      phone,
      password,
      licenseNumber,
      specialization,
      clinicName,
    });

    const token = generateToken(doctor._id);

    return sendSuccess(res, 'Registration successful.', {
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        clinicName: doctor.clinicName,
        licenseNumber: doctor.licenseNumber,
      },
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login doctor
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password.', 400);
    }

    // Find doctor with password field
    const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select('+password');

    if (!doctor) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!doctor.isActive) {
      return sendError(res, 'Account has been deactivated. Contact support.', 403);
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken(doctor._id);

    return sendSuccess(res, 'Login successful.', {
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        clinicName: doctor.clinicName,
        licenseNumber: doctor.licenseNumber,
        profileImage: doctor.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout (client-side token removal; this endpoint confirms it)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  return sendSuccess(res, 'Logged out successfully.');
};

// @desc    Get current logged-in doctor
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  return sendSuccess(res, 'Doctor profile fetched.', { doctor: req.doctor });
};

// @desc    Forgot password — generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Please provide your email address.', 400);

    const doctor = await Doctor.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!doctor) {
      return sendSuccess(res, 'If that email is registered, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    doctor.resetPasswordToken = hashed;
    doctor.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await doctor.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // In production, send email. For demo, log to console.
    console.log(`\n🔑 [DEV] Password reset URL for ${email}:\n${resetUrl}\n`);

    return sendSuccess(res, 'If that email is registered, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return sendError(res, 'Token and new password are required.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters.', 400);
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const doctor = await Doctor.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpire');

    if (!doctor) {
      return sendError(res, 'Invalid or expired reset token.', 400);
    }

    doctor.password = password;
    doctor.resetPasswordToken = undefined;
    doctor.resetPasswordExpire = undefined;
    await doctor.save();

    const jwtToken = generateToken(doctor._id);
    return sendSuccess(res, 'Password reset successful.', { token: jwtToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
