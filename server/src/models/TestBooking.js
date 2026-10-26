const mongoose = require('mongoose');

const testBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
      },
    ],
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      },
    ],
    collectionType: {
      type: String,
      enum: ['lab_visit', 'home_collection'],
      required: true,
      default: 'lab_visit',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Booked', 'Paid', 'Sample Collected', 'Processing', 'Report Ready', 'Cancelled'],
      default: 'Booked',
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: {
          type: String,
          default: '',
        },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    homeCollectionFee: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to auto-add first status in statusHistory if empty
testBookingSchema.pre('save', function (next) {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.patient,
      notes: 'Initial test booking created',
    });
  }
  next();
});

module.exports = mongoose.model('TestBooking', testBookingSchema);
