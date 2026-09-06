const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// Helper: generate unique patientId
function generatePatientId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PT';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// @desc    Get all patients for logged-in doctor
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const {
      page = 1,
      limit = 10,
      search = '',
      gender,
      bloodGroup,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { doctorId };

    // Search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { patientId: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Patient.countDocuments(query),
    ]);

    // Attach last record info
    const patientIds = patients.map((p) => p._id);
    const lastRecords = await MedicalRecord.find({
      patientId: { $in: patientIds },
      doctorId,
    })
      .sort({ visitDate: -1 })
      .select('patientId visitDate disease infectionStatus')
      .lean();

    const lastRecordMap = {};
    lastRecords.forEach((r) => {
      if (!lastRecordMap[r.patientId.toString()]) {
        lastRecordMap[r.patientId.toString()] = r;
      }
    });

    const enriched = patients.map((p) => ({
      ...p,
      lastRecord: lastRecordMap[p._id.toString()] || null,
    }));

    return sendPaginated(res, enriched, page, limit, total, 'Patients fetched.');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;

    // Generate unique patientId with retry
    let patientId;
    let retries = 0;
    while (retries < 5) {
      patientId = generatePatientId();
      const exists = await Patient.findOne({ patientId });
      if (!exists) break;
      retries++;
    }

    const patient = await Patient.create({
      ...req.body,
      doctorId,
      patientId,
    });

    return sendSuccess(res, 'Patient created successfully.', { patient }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID (with auth check)
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctorId: req.doctor._id,
    }).lean({ virtuals: true });

    if (!patient) {
      return sendError(res, 'Patient not found or access denied.', 404);
    }

    // Get medical records
    const records = await MedicalRecord.find({
      patientId: patient._id,
      doctorId: req.doctor._id,
    }).sort({ visitDate: -1 }).lean();

    return sendSuccess(res, 'Patient fetched.', { patient, medicalRecords: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
  try {
    // Prevent overwriting security fields
    delete req.body.doctorId;
    delete req.body.patientId;

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      req.body,
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!patient) {
      return sendError(res, 'Patient not found or access denied.', 404);
    }

    return sendSuccess(res, 'Patient updated successfully.', { patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive (soft-delete) patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      { status: 'Archived' },
      { new: true }
    );

    if (!patient) {
      return sendError(res, 'Patient not found or access denied.', 404);
    }

    return sendSuccess(res, 'Patient archived successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Global search patients
// @route   GET /api/patients/search?q=...
// @access  Private
const searchPatients = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return sendSuccess(res, 'No query.', { patients: [] });

    const searchRegex = new RegExp(q.trim(), 'i');

    const patients = await Patient.find({
      doctorId: req.doctor._id,
      status: { $ne: 'Archived' },
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { patientId: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ],
    })
      .limit(10)
      .lean({ virtuals: true });

    return sendSuccess(res, 'Search results.', { patients });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, createPatient, getPatient, updatePatient, deletePatient, searchPatients };
