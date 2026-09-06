const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [300, 'Reason cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // minutes
      default: 30,
    },
    type: {
      type: String,
      enum: ['Regular', 'Follow-up', 'Emergency', 'Consultation', 'Lab'],
      default: 'Regular',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
AppointmentSchema.index({ patientId: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctorId: 1, status: 1 });
AppointmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
