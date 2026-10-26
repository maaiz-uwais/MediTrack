const TestBooking = require('../models/TestBooking');
const Test = require('../models/Test');
const Package = require('../models/Package');
const Notification = require('../models/Notification');

// Generate unique booking ID
const generateBookingId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MT-TEST-${year}-${random}`;
};

// @desc    Create Diagnostic Test Booking
// @route   POST /api/bookings
// @access  Private (Patient)
const createTestBooking = async (req, res, next) => {
  try {
    const {
      testIds = [],
      packageIds = [],
      collectionType = 'lab_visit',
      scheduledDate,
      slot,
      address,
    } = req.body;

    if (!scheduledDate || !slot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both scheduled date and time slot.',
      });
    }

    if (testIds.length === 0 && packageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one diagnostic test or health package.',
      });
    }

    if (collectionType === 'home_collection') {
      if (!address || !address.street || !address.city || !address.postalCode) {
        return res.status(400).json({
          success: false,
          message: 'Complete residential address is required for home sample collection.',
        });
      }
    }

    // Capacity & Double-booking check
    // Max 10 per slot for lab_visit, max 4 per slot for home_collection
    const bookingDate = new Date(scheduledDate);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    const existingBookingsCount = await TestBooking.countDocuments({
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      slot,
      collectionType,
      status: { $nin: ['Cancelled'] },
    });

    const maxCapacity = collectionType === 'home_collection' ? 4 : 10;
    if (existingBookingsCount >= maxCapacity) {
      return res.status(409).json({
        success: false,
        message: `Slot '${slot}' for ${collectionType.replace('_', ' ')} is fully booked on this date. Please choose an alternate time.`,
      });
    }

    // Calculate total price
    let subtotal = 0;
    if (testIds.length > 0) {
      const tests = await Test.find({ _id: { $in: testIds } });
      tests.forEach((t) => {
        subtotal += t.discountPrice && t.discountPrice > 0 ? t.discountPrice : t.price;
      });
    }

    if (packageIds.length > 0) {
      const pkgs = await Package.find({ _id: { $in: packageIds } });
      pkgs.forEach((p) => {
        subtotal += p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
      });
    }

    const homeCollectionFee = collectionType === 'home_collection' ? 150 : 0;
    const totalAmount = subtotal + homeCollectionFee;

    const booking = await TestBooking.create({
      bookingId: generateBookingId(),
      patient: req.user._id,
      tests: testIds,
      packages: packageIds,
      collectionType,
      scheduledDate: new Date(scheduledDate),
      slot,
      address: address || {},
      status: 'Booked',
      statusHistory: [
        {
          status: 'Booked',
          changedAt: new Date(),
          changedBy: req.user._id,
          notes: `Diagnostic test booking created (${collectionType.replace('_', ' ')})`,
        },
      ],
      paymentStatus: 'Pending',
      totalAmount,
      homeCollectionFee,
    });

    const populatedBooking = await TestBooking.findById(booking._id)
      .populate('tests', 'name code category price discountPrice sampleType tatHours fastingRequired')
      .populate('packages', 'title price discountPrice description');

    // Notify patient
    await Notification.create({
      user: req.user._id,
      title: 'Booking Created Successfully',
      message: `Your diagnostic test booking #${booking.bookingId} is scheduled for ${new Date(scheduledDate).toLocaleDateString()} (${slot}). Complete payment to confirm sample collection.`,
      type: 'booking',
      link: '/patient/tracker',
    });

    res.status(201).json({
      success: true,
      message: 'Diagnostic test booking scheduled successfully.',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Test Bookings for Authenticated Patient
// @route   GET /api/bookings/my
// @access  Private (Patient)
const getMyTestBookings = async (req, res, next) => {
  try {
    const bookings = await TestBooking.find({ patient: req.user._id })
      .populate('tests', 'name code category price discountPrice sampleType tatHours fastingRequired')
      .populate('packages', 'title price discountPrice')
      .populate('assignedStaff', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Test Booking Details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingDetails = async (req, res, next) => {
  try {
    const booking = await TestBooking.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('tests')
      .populate('packages')
      .populate('assignedStaff', 'name phone email')
      .populate('statusHistory.changedBy', 'name role');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Role check: Only the booking patient, assigned lab staff, or admin can inspect
    const isOwner = booking.patient._id.toString() === req.user._id.toString();
    const isStaffOrAdmin = ['lab_staff', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Test Booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Patient)
const cancelTestBooking = async (req, res, next) => {
  try {
    const booking = await TestBooking.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Test booking record not found.',
      });
    }

    if (['Sample Collected', 'Processing', 'Report Ready'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled because the sample has already progressed to '${booking.status}'.`,
      });
    }

    booking.status = 'Cancelled';
    booking.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      changedBy: req.user._id,
      notes: 'Booking cancelled by patient request',
    });
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Test booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTestBooking,
  getMyTestBookings,
  getBookingDetails,
  cancelTestBooking,
};
