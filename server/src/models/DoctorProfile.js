const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please specify doctor specialization'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please specify years of experience'],
      min: 0,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide medical registration/license number'],
      trim: true,
    },
    fee: {
      type: Number,
      required: [true, 'Please specify consultation fee in INR'],
      min: 0,
      default: 500,
    },
    bio: {
      type: String,
      default: '',
    },
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0: Sun, 1: Mon, ...
        dayName: { type: String },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        slotDuration: { type: Number, default: 30 }, // in minutes
        isAvailable: { type: Boolean, default: true },
      },
    ],
    leaves: {
      type: [Date],
      default: [],
    },
    ratingsAverage: {
      type: Number,
      default: 4.8,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating must be at most 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
