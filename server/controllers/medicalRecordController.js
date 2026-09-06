const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper: verify patient belongs to doctor
const verifyPatientOwnership = async (patientId, doctorId) => {
  const patient = await Patient.findOne({ _id: patientId, doctorId });
  return !!patient;
};

// @desc    Get all medical records for a patient
// @route   GET /api/medical-records/:patientId
// @access  Private
const getRecordsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.doctor._id;

    const owned = await verifyPatientOwnership(patientId, doctorId);
    if (!owned) return sendError(res, 'Patient not found or access denied.', 404);

    const records = await MedicalRecord.find({ patientId, doctorId })
      .sort({ visitDate: -1 })
      .lean();

    return sendSuccess(res, 'Medical records fetched.', { records });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new medical record
// @route   POST /api/medical-records
// @access  Private
const createRecord = async (req, res, next) => {
  try {
    const doctorId = req.doctor._id;
    const { patientId, ...rest } = req.body;

    if (!patientId) return sendError(res, 'Patient ID is required.', 400);

    const owned = await verifyPatientOwnership(patientId, doctorId);
    if (!owned) return sendError(res, 'Patient not found or access denied.', 404);

    const record = await MedicalRecord.create({ patientId, doctorId, ...rest });

    // Update patient lastVisit
    await Patient.findByIdAndUpdate(patientId, { lastVisit: record.visitDate });

    return sendSuccess(res, 'Medical record created.', { record }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/detail/:id
// @access  Private
const getRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      doctorId: req.doctor._id,
    }).lean();

    if (!record) return sendError(res, 'Medical record not found or access denied.', 404);

    return sendSuccess(res, 'Medical record fetched.', { record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private
const updateRecord = async (req, res, next) => {
  try {
    delete req.body.patientId;
    delete req.body.doctorId;

    const record = await MedicalRecord.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.doctor._id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!record) return sendError(res, 'Medical record not found or access denied.', 404);

    return sendSuccess(res, 'Medical record updated.', { record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical record
// @route   DELETE /api/medical-records/:id
// @access  Private
const deleteRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.doctor._id,
    });

    if (!record) return sendError(res, 'Medical record not found or access denied.', 404);

    return sendSuccess(res, 'Medical record deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecordsByPatient, createRecord, getRecord, updateRecord, deleteRecord };
