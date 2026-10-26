const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Please provide clinical diagnosis'],
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500 mg"
        frequency: { type: String, required: true }, // e.g. "1-0-1 after meals"
        duration: { type: String, required: true }, // e.g. "5 days"
        instructions: { type: String, default: 'Take with plenty of water' },
      },
    ],
    recommendedTests: [
      {
        type: String,
        trim: true,
      },
    ],
    doctorNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
