const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Prescription = require('../models/Prescription');
const DoctorProfile = require('../models/DoctorProfile');
const Notification = require('../models/Notification');

// Helper to generate complaint ticket ID
const generateComplaintId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TCKT-${new Date().getFullYear()}-${random}`;
};

// @desc    Submit Doctor Review & Rating
// @route   POST /api/feedback/reviews
// @access  Private (Patient)
const submitReview = async (req, res, next) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    if (!doctorId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, rating (1-5), and review comment are required.',
      });
    }

    const review = await Review.create({
      patient: req.user._id,
      doctor: doctorId,
      appointment: appointmentId || null,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Recalculate doctor rating average
    const allDocReviews = await Review.find({ doctor: doctorId });
    const avgRating =
      allDocReviews.reduce((sum, r) => sum + r.rating, 0) / allDocReviews.length;

    await DoctorProfile.findOneAndUpdate(
      { user: doctorId },
      {
        ratingsAverage: Math.round(avgRating * 10) / 10,
        ratingsQuantity: allDocReviews.length,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lodge Patient Complaint or Service Grievance
// @route   POST /api/feedback/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { category, subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and detailed explanation are required to lodge a ticket.',
      });
    }

    const complaint = await Complaint.create({
      complaintId: generateComplaintId(),
      user: req.user._id,
      category: category || 'Other',
      subject: subject.trim(),
      description: description.trim(),
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: `Support ticket #${complaint.complaintId} logged. Our administrative team will review it.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Prescriptions for Current Patient
// @route   GET /api/feedback/prescriptions/my
// @access  Private (Patient)
const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name email phone')
      .populate('appointment', 'date slot consultationType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  createComplaint,
  getMyPrescriptions,
};
