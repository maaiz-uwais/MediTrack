const TestBooking = require('../models/TestBooking');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to generate Report ID
const generateReportId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REP-${year}-${random}`;
};

// @desc    Get Lab Staff Dashboard Metrics
// @route   GET /api/lab/stats
// @access  Private (Lab Staff, Admin)
const getLabDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      pendingCollection,
      inProcessing,
      reportsReadyToday,
      homeCollectionsToday,
      totalAssigned,
    ] = await Promise.all([
      TestBooking.countDocuments({ status: 'Paid' }),
      TestBooking.countDocuments({ status: { $in: ['Sample Collected', 'Processing'] } }),
      Report.countDocuments({ uploadedAt: { $gte: startOfDay, $lte: endOfDay } }),
      TestBooking.countDocuments({
        collectionType: 'home_collection',
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['Cancelled'] },
      }),
      TestBooking.countDocuments({
        $or: [{ assignedStaff: req.user._id }, { assignedStaff: null }],
        status: { $nin: ['Cancelled'] },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        pendingCollection,
        inProcessing,
        reportsReadyToday,
        homeCollectionsToday,
        totalAssigned,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Diagnostic Bookings Queue for Lab Staff
// @route   GET /api/lab/bookings
// @access  Private (Lab Staff, Admin)
const getLabBookings = async (req, res, next) => {
  try {
    const { status, collectionType, search } = req.query;
    let query = { status: { $ne: 'Cancelled' } };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (collectionType && collectionType !== 'all') {
      query.collectionType = collectionType;
    }

    const bookings = await TestBooking.find(query)
      .populate('patient', 'name email phone')
      .populate('tests', 'name code sampleType tatHours fastingRequired')
      .populate('packages', 'title')
      .populate('assignedStaff', 'name phone')
      .populate('statusHistory.changedBy', 'name role')
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Sample Status (Paid -> Sample Collected -> Processing)
// @route   PUT /api/lab/bookings/:id/status
// @access  Private (Lab Staff, Admin)
const updateSampleStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowedTransitions = ['Sample Collected', 'Processing', 'Cancelled'];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition '${status}'. For 'Report Ready', upload the diagnostic report PDF.`,
      });
    }

    const booking = await TestBooking.findById(req.params.id).populate('patient', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Test booking not found.' });
    }

    // Auto-assign staff if unassigned
    if (!booking.assignedStaff) {
      booking.assignedStaff = req.user._id;
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      notes: notes || `Sample status updated to ${status} by lab staff`,
    });
    await booking.save();

    // Notify patient
    await Notification.create({
      user: booking.patient._id,
      title: `Diagnostic Status: ${status}`,
      message: `Your booking #${booking.bookingId} has progressed to '${status}'. ${notes ? `Note: ${notes}` : ''}`,
      type: 'booking',
      link: '/patient/tracker',
    });

    console.log(`[Email Alert Stub]: Dispatched update email to ${booking.patient.email} for booking #${booking.bookingId} -> ${status}`);

    res.status(200).json({
      success: true,
      message: `Sample status advanced to '${status}'.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Diagnostic Report PDF & Complete Booking
// @route   POST /api/lab/reports
// @access  Private (Lab Staff, Admin)
const uploadReport = async (req, res, next) => {
  try {
    const { bookingId, summary = 'Investigation complete. Verified by laboratory pathologist.', criticalFlag = false } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a verified diagnostic PDF report.' });
    }

    const booking = await TestBooking.findById(bookingId).populate('patient', 'name email phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated test booking not found.' });
    }

    // Construct accessible file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    const report = await Report.create({
      reportId: generateReportId(),
      booking: booking._id,
      patient: booking.patient._id,
      fileUrl,
      fileName: req.file.originalname || 'Diagnostic_Report.pdf',
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      summary,
      criticalFlag: Boolean(criticalFlag),
      uploadedAt: new Date(),
    });

    // Advance Booking Status to 'Report Ready'
    booking.status = 'Report Ready';
    booking.assignedStaff = req.user._id;
    booking.statusHistory.push({
      status: 'Report Ready',
      changedAt: new Date(),
      changedBy: req.user._id,
      notes: `Official PDF report (${report.reportId}) uploaded by ${req.user.name}`,
    });
    await booking.save();

    // Auto-notify patient in-app
    await Notification.create({
      user: booking.patient._id,
      title: 'Diagnostic Report Ready for Download',
      message: `Your clinical report #${report.reportId} for booking #${booking.bookingId} is ready. You can download and share it directly with your consulting doctor.`,
      type: 'report',
      link: '/patient/reports',
    });

    // Simulated Nodemailer email dispatch
    console.log(`[Email Dispatch Stub via Nodemailer]: To: ${booking.patient.email} | Subject: Your MediTrack Diagnostic Report #${report.reportId} is Ready | Download Link: ${fileUrl}`);

    res.status(201).json({
      success: true,
      message: 'Diagnostic report uploaded successfully. Booking marked as Report Ready and patient notified!',
      report,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabDashboardStats,
  getLabBookings,
  updateSampleStatus,
  uploadReport,
};
