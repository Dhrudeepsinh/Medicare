const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dose: { type: String, trim: true },
  route: { type: String, trim: true }, // Oral, IV, Topical, etc.
  frequency: { type: String, trim: true }, // Every 6 hours, Once daily, etc.
  duration: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  prescribedBy: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { _id: true });

const TestResultSchema = new mongoose.Schema({
  testName: { type: String, required: true, trim: true },
  result: { type: String, trim: true },
  unit: { type: String, trim: true },
  referenceRange: { type: String, trim: true },
  testDate: { type: Date },
  notes: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Normal', 'Abnormal', 'Borderline', 'Pending'],
    default: 'Pending'
  },
}, { _id: true });

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
      default: Date.now,
    },
    chiefComplaint: {
      type: String,
      trim: true,
      maxlength: [500, 'Chief complaint cannot exceed 500 characters'],
    },
    symptoms: [{ type: String, trim: true }],
    diagnosis: {
      type: String,
      trim: true,
    },
    disease: {
      type: String,
      trim: true,
    },
    diseaseStatus: {
      type: String,
      enum: ['Active', 'Resolved', 'Chronic', 'In Treatment', 'Monitoring'],
      default: 'Active',
    },
    infectionStatus: {
      type: String,
      enum: ['Yes', 'No', 'Unknown', 'Suspected'],
      default: 'Unknown',
    },
    infectionType: {
      type: String,
      trim: true,
    },
    medications: [MedicationSchema],
    tests: [TestResultSchema],
    doctorNotes: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
      trim: true,
    },
    followUpStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Missed', 'Cancelled'],
      default: 'Pending',
    },
    recordType: {
      type: String,
      enum: ['Visit', 'Lab Test', 'Follow-up', 'Emergency', 'Consultation'],
      default: 'Visit',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
MedicalRecordSchema.index({ patientId: 1, visitDate: -1 });
MedicalRecordSchema.index({ doctorId: 1, visitDate: -1 });
MedicalRecordSchema.index({ patientId: 1, doctorId: 1 });
MedicalRecordSchema.index({ disease: 1 });
MedicalRecordSchema.index(
  { diagnosis: 'text', disease: 'text', chiefComplaint: 'text' },
  { name: 'record_text_search' }
);

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
