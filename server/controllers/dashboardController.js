const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;

    // Date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const [
      totalPatients,
      newPatientsThisMonth,
      activeRecords,
      todayFollowUps,
      todayAppointments,
    ] = await Promise.all([
      Patient.countDocuments({ doctorId, status: { $ne: 'Archived' } }),
      Patient.countDocuments({ doctorId, createdAt: { $gte: startOfMonth } }),
      MedicalRecord.countDocuments({ doctorId, diseaseStatus: { $in: ['Active', 'In Treatment'] } }),
      MedicalRecord.countDocuments({
        doctorId,
        followUpDate: { $gte: startOfToday, $lt: endOfToday },
        followUpStatus: 'Pending',
      }),
      Appointment.countDocuments({
        doctorId,
        appointmentDate: { $gte: startOfToday, $lt: endOfToday },
        status: 'Scheduled',
      }),
    ]);

    return sendSuccess(res, 'Dashboard stats fetched.', {
      totalPatients,
      newPatientsThisMonth,
      activeRecords,
      todayFollowUps,
      todayAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent patients
// @route   GET /api/dashboard/recent-patients
// @access  Private
const getRecentPatients = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const limit = parseInt(req.query.limit) || 5;

    const patients = await Patient.find({ doctorId, status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    return sendSuccess(res, 'Recent patients fetched.', { patients });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/dashboard/upcoming-appointments
// @access  Private
const getUpcomingAppointments = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const limit = parseInt(req.query.limit) || 5;
    const now = new Date();

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: now },
      status: 'Scheduled',
    })
      .populate('patientId', 'firstName lastName patientId phone')
      .sort({ appointmentDate: 1 })
      .limit(limit)
      .lean();

    return sendSuccess(res, 'Upcoming appointments fetched.', { appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient visits over time (last 6 months)
// @route   GET /api/dashboard/visits-chart
// @access  Private
const getVisitsChart = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const records = await MedicalRecord.aggregate([
      {
        $match: {
          doctorId: doctorId,
          visitDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitDate' },
            month: { $month: '$visitDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = records.map((r) => ({
      month: months[r._id.month - 1],
      year: r._id.year,
      visits: r.count,
    }));

    return sendSuccess(res, 'Visit chart data.', { chartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get diagnosis statistics
// @route   GET /api/dashboard/diagnosis-chart
// @access  Private
const getDiagnosisChart = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const { days = 30 } = req.query;
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const records = await MedicalRecord.aggregate([
      {
        $match: {
          doctorId: doctorId,
          visitDate: { $gte: from },
          disease: { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$disease',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const chartData = records.map((r) => ({ name: r._id, value: r.count }));
    return sendSuccess(res, 'Diagnosis chart data.', { chartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get infection statistics
// @route   GET /api/dashboard/infection-chart
// @access  Private
const getInfectionChart = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const { days = 30 } = req.query;
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const records = await MedicalRecord.aggregate([
      {
        $match: {
          doctorId: doctorId,
          visitDate: { $gte: from },
        },
      },
      {
        $group: {
          _id: '$infectionStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const chartData = records.map((r) => ({ name: r._id, value: r.count }));
    return sendSuccess(res, 'Infection chart data.', { chartData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentPatients,
  getUpcomingAppointments,
  getVisitsChart,
  getDiagnosisChart,
  getInfectionChart,
};
