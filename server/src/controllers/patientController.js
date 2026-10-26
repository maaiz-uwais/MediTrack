const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const TestBooking = require('../models/TestBooking');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const Prescription = require('../models/Prescription');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Get Comprehensive Patient Dashboard Data
// @route   GET /api/patient/dashboard
// @access  Private (Patient)
const getPatientDashboardData = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const [
      profile,
      activeBookings,
      upcomingAppointments,
      recentReports,
      pendingBookings,
      pendingAppointments,
    ] = await Promise.all([
      PatientProfile.findOne({ user: patientId }),
      // Active test bookings in progress
      TestBooking.find({
        patient: patientId,
        status: { $in: ['Booked', 'Paid', 'Sample Collected', 'Processing'] },
      })
        .populate('tests', 'name category price')
        .populate('packages', 'title price')
        .sort({ scheduledDate: -1 })
        .limit(3),
      // Upcoming doctor appointments
      Appointment.find({
        patient: patientId,
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: { $in: ['Scheduled', 'Confirmed'] },
      })
        .populate('doctor', 'name email phone')
        .sort({ date: 1 })
        .limit(3),
      // Recent Reports
      Report.find({ patient: patientId })
        .populate('booking', 'bookingId scheduledDate')
        .sort({ uploadedAt: -1 })
        .limit(3),
      // Pending payments for tests
      TestBooking.find({ patient: patientId, paymentStatus: 'Pending', status: { $ne: 'Cancelled' } }),
      // Pending payments for appointments
      Appointment.find({ patient: patientId, paymentStatus: 'Pending', status: { $ne: 'Cancelled' } }),
    ]);

    // Populate doctor profiles for upcoming appointments
    const appointmentsWithProfile = await Promise.all(
      upcomingAppointments.map(async (apt) => {
        const docProfile = await DoctorProfile.findOne({ user: apt.doctor._id });
        return {
          ...apt.toObject(),
          doctorProfile: docProfile,
        };
      })
    );

    res.status(200).json({
      success: true,
      profile,
      activeBookings,
      upcomingAppointments: appointmentsWithProfile,
      recentReports,
      pendingPaymentsCount: pendingBookings.length + pendingAppointments.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Unified Health Timeline History
// @route   GET /api/patient/health-history
// @access  Private (Patient)
const getHealthHistory = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const [bookings, appointments, prescriptions, reports] = await Promise.all([
      TestBooking.find({ patient: patientId })
        .populate('tests', 'name category')
        .populate('packages', 'title')
        .sort({ scheduledDate: -1 }),
      Appointment.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ date: -1 }),
      Prescription.find({ patient: patientId })
        .populate('doctor', 'name')
        .populate('recommendedTests', 'name')
        .sort({ createdAt: -1 }),
      Report.find({ patient: patientId }).sort({ uploadedAt: -1 }),
    ]);

    // Format all events into a unified chronological array
    const timeline = [];

    bookings.forEach((b) => {
      timeline.push({
        id: b._id,
        type: 'test_booking',
        title: `Diagnostic Test: ${b.bookingId}`,
        subtitle: `${b.tests.map((t) => t.name).join(', ') || b.packages.map((p) => p.title).join(', ')}`,
        status: b.status,
        date: b.scheduledDate || b.createdAt,
        details: `${b.collectionType.replace('_', ' ')} • Status: ${b.status}`,
      });
    });

    appointments.forEach((a) => {
      timeline.push({
        id: a._id,
        type: 'doctor_visit',
        title: `Consultation: Dr. ${a.doctor?.name || 'Practitioner'}`,
        subtitle: `${a.consultationType} visit • ${a.symptoms || 'General clinical consult'}`,
        status: a.status,
        date: a.date,
        details: `Slot: ${a.slot} • Status: ${a.status}`,
      });
    });

    prescriptions.forEach((p) => {
      timeline.push({
        id: p._id,
        type: 'prescription',
        title: `Prescription from Dr. ${p.doctor?.name}`,
        subtitle: `Diagnosis: ${p.diagnosis}`,
        status: 'Active',
        date: p.createdAt,
        details: `${p.medicines?.length || 0} medications prescribed`,
      });
    });

    // Sort descending by date
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: timeline.length,
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Patient Clinical Profile
// @route   PUT /api/patient/profile
// @access  Private (Patient)
const updatePatientMedicalProfile = async (req, res, next) => {
  try {
    const { bloodGroup, gender, dob, address, emergencyContact, medicalHistory, allergies } =
      req.body;

    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          bloodGroup,
          gender,
          dob,
          address,
          emergencyContact,
          medicalHistory,
          allergies,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Medical profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientDashboardData,
  getHealthHistory,
  updatePatientMedicalProfile,
};
