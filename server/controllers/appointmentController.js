const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// @desc    Get appointments for logged-in doctor
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      patientId,
      sortOrder = 'asc',
    } = req.query;

    const query = { doctorId };

    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    if (dateFrom || dateTo) {
      query.appointmentDate = {};
      if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.appointmentDate.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId', 'firstName lastName patientId phone')
        .sort({ appointmentDate: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return sendPaginated(res, appointments, page, limit, total, 'Appointments fetched.');
  } catch (error) {
    next(error);
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const { patientId } = req.body;

    // Verify patient belongs to this doctor
    const patient = await Patient.findOne({ _id: patientId, doctorId });
    if (!patient) return sendError(res, 'Patient not found or access denied.', 404);

    const appointment = await Appointment.create({ ...req.body, doctorId });
    const populated = await appointment.populate('patientId', 'firstName lastName patientId phone');

    return sendSuccess(res, 'Appointment created.', { appointment: populated }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    delete req.body.doctorId;
    delete req.body.patientId;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName patientId phone').lean();

    if (!appointment) return sendError(res, 'Appointment not found or access denied.', 404);

    return sendSuccess(res, 'Appointment updated.', { appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.doctor._id,
    });

    if (!appointment) return sendError(res, 'Appointment not found or access denied.', 404);

    return sendSuccess(res, 'Appointment deleted.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private
const getTodayAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId: req.doctor._id,
      appointmentDate: { $gte: today, $lt: tomorrow },
    })
      .populate('patientId', 'firstName lastName patientId phone')
      .sort({ appointmentTime: 1 })
      .lean();

    return sendSuccess(res, "Today's appointments.", { appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment, getTodayAppointments };
