const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    bookingRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'bookingType',
    },
    bookingType: {
      type: String,
      required: true,
      enum: ['TestBooking', 'Appointment'],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Created', 'Captured', 'Failed', 'Refunded'],
      default: 'Created',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceDate: {
      type: Date,
      default: null,
    },
    receiptDetails: {
      billingName: String,
      billingEmail: String,
      billingPhone: String,
      description: String,
      taxAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
