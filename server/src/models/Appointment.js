const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
      },
    ],
    consultationType: {
      type: String,
      enum: ['In-Person', 'Video'],
      default: 'In-Person',
    },
    symptoms: {
      type: String,
      default: '',
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.pre('save', function (next) {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      notes: 'Appointment initially scheduled',
    });
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
