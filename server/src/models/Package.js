const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide package title'],
      trim: true,
      unique: true,
    },
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
      },
    ],
    price: {
      type: Number,
      required: [true, 'Please provide standard package price'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: [true, 'Please provide discounted package price'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide package description'],
    },
    recommendedFor: {
      type: String,
      default: 'Adults of all ages seeking preventive health checkups',
    },
    fastingRequired: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model('Package', packageSchema);
