const Doctor = require('../models/Doctor');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private
const getProfile = async (req, res) => {
  return sendSuccess(res, 'Profile fetched.', { doctor: req.doctor });
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'clinicName', 'specialization', 'profileImage', 'notificationPreferences'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const doctor = await Doctor.findByIdAndUpdate(req.doctor._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, 'Profile updated.', { doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/doctors/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required.', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters.', 400);
    }

    const doctor = await Doctor.findById(req.doctor._id).select('+password');

    const isMatch = await doctor.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    doctor.password = newPassword;
    await doctor.save();

    return sendSuccess(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
