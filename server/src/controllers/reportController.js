const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const TestBooking = require('../models/TestBooking');

// @desc    Get All Reports for Authenticated Patient
// @route   GET /api/reports/my
// @access  Private (Patient)
const getMyReports = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { patient: req.user._id };

    const reports = await Report.find(query)
      .populate({
        path: 'booking',
        select: 'bookingId scheduledDate slot collectionType tests packages',
        populate: [
          { path: 'tests', select: 'name code category' },
          { path: 'packages', select: 'title' },
        ],
      })
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 });

    const filtered = search
      ? reports.filter(
          (r) =>
            r.reportId.toLowerCase().includes(search.toLowerCase()) ||
            r.fileName.toLowerCase().includes(search.toLowerCase()) ||
            r.booking?.bookingId.toLowerCase().includes(search.toLowerCase()) ||
            r.booking?.tests?.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
        )
      : reports;

    res.status(200).json({
      success: true,
      count: filtered.length,
      reports: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Report with Strict Privacy Guard
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate({
        path: 'booking',
        populate: [{ path: 'tests' }, { path: 'packages' }],
      })
      .populate('uploadedBy', 'name');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report record not found.' });
    }

    // Role-based Access Rules
    const isOwner = report.patient._id.toString() === req.user._id.toString();
    const isAdminOrLab = ['admin', 'lab_staff'].includes(req.user.role);

    let isAuthorizedDoctor = false;
    if (req.user.role === 'doctor') {
      // Doctor privacy rule: Must have had an appointment or booking with this patient
      const hasConsultation = await Appointment.exists({
        doctor: req.user._id,
        patient: report.patient._id,
        status: { $in: ['Scheduled', 'Confirmed', 'Completed'] },
      });
      isAuthorizedDoctor = Boolean(hasConsultation);
    }

    if (!isOwner && !isAdminOrLab && !isAuthorizedDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have authorization to view this clinical report.',
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyReports,
  getReportById,
};
