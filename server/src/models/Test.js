const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a test name'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide a test code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a test category'],
      enum: [
        'Pathology',
        'Biochemistry',
        'Hematology',
        'Microbiology',
        'Radiology',
        'Cardiology',
        'Endocrinology',
        'Immunology',
        'General Health',
      ],
      default: 'Pathology',
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide standard price'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    sampleType: {
      type: String,
      enum: ['Blood', 'Urine', 'Swab', 'Stool', 'Serum', 'Biopsy', 'None'],
      default: 'Blood',
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    fastingDurationHours: {
      type: Number,
      default: 0,
    },
    tatHours: {
      type: Number,
      required: [true, 'Please specify turnaround time in hours'],
      default: 24,
    },
    precautions: {
      type: String,
      default: 'No special precautions required.',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', testSchema);
