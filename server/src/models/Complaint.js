const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Billing',
        'Payment Issue',
        'Lab Delay',
        'Report Delay',
        'Phlebotomist Issue',
        'Doctor Conduct',
        'Doctor Consultation',
        'App Issue',
        'Report Discrepancy',
        'General Support',
        'Other',
      ],
      default: 'Other',
    },
    subject: {
      type: String,
      required: [true, 'Please provide complaint subject'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please explain your concern'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
