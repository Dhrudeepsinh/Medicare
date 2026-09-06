const mongoose = require('mongoose');

// Generate unique patient ID
function generatePatientId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PT';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  relationship: { type: String, trim: true },
  phone: { type: String, trim: true },
}, { _id: false });

const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      default: generatePatientId,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    allergies: [{ type: String, trim: true }],
    existingConditions: [{ type: String, trim: true }],
    emergencyContact: EmergencyContactSchema,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
    lastVisit: {
      type: Date,
      default: null,
    },
    profileNotes: {
      type: String,
      maxlength: [500, 'Profile notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: age
PatientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

// Virtual: full name
PatientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for commonly searched fields
// Note: patientId has unique:true and doctorId has index:true in schema — no need to re-declare
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ doctorId: 1, status: 1 });
PatientSchema.index(
  { firstName: 'text', lastName: 'text', phone: 'text' },
  { name: 'patient_text_search' }
);

module.exports = mongoose.model('Patient', PatientSchema);
