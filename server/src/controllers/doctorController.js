const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Get Doctor Dashboard Stats & Metrics
// @route   GET /api/doctor/stats
// @access  Private (Doctor)
const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      todayAppointments,
      pendingRequests,
      completedTotal,
      uniquePatients,
      profile,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['Scheduled', 'Confirmed'] },
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        status: 'Scheduled',
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        status: 'Completed',
      }),
      Appointment.distinct('patient', { doctor: doctorId }),
      DoctorProfile.findOne({ user: doctorId }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        todayAppointments,
        pendingRequests,
        completedTotal,
        totalPatientsTreated: uniquePatients.length,
        ratingsAverage: profile?.ratingsAverage || 4.9,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor Appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    let query = { doctor: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .sort({ date: 1, createdAt: -1 });

    // Populate patient profiles
    const populated = await Promise.all(
      appointments.map(async (apt) => {
        const patientProfile = await PatientProfile.findOne({ user: apt.patient._id });
        const existingPrescription = await Prescription.findOne({ appointment: apt._id });
        return {
          ...apt.toObject(),
          patientProfile,
          prescription: existingPrescription,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populated.length,
      appointments: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Appointment Status (Accept, Complete, Cancel)
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    }).populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.status = status;
    appointment.statusHistory.push({
      status,
      changedAt: new Date(),
      notes: notes || `Appointment status set to ${status} by Dr. ${req.user.name}`,
    });
    await appointment.save();

    // Notify patient
    await Notification.create({
      user: appointment.patient._id,
      title: `Consultation ${status}`,
      message: `Dr. ${req.user.name} has marked your appointment for ${new Date(appointment.date).toLocaleDateString()} (${appointment.slot}) as '${status}'.`,
      type: 'appointment',
      link: '/patient/appointments',
    });

    res.status(200).json({
      success: true,
      message: `Appointment updated to '${status}'.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Patient Records (Strictly Guarded to Consulting Patients)
// @route   GET /api/doctor/patients/:patientId
// @access  Private (Doctor)
const getDoctorPatientRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    // Strict Privacy Verification: An appointment must exist between doctor and patient
    const hasBookingRelationship = await Appointment.exists({
      doctor: doctorId,
      patient: patientId,
    });

    if (!hasBookingRelationship) {
      return res.status(403).json({
        success: false,
        message: 'Privacy Guard: You may only access medical records for patients with an active or past consultation with you.',
      });
    }

    const patientUser = await User.findById(patientId).select('name email phone');
    const patientProfile = await PatientProfile.findOne({ user: patientId });

    // Prescriptions issued by this doctor to this patient
    const prescriptions = await Prescription.find({ doctor: doctorId, patient: patientId })
      .sort({ createdAt: -1 });

    // Diagnostic lab reports for this patient
    const reports = await Report.find({ patient: patientId })
      .populate({
        path: 'booking',
        populate: [{ path: 'tests' }, { path: 'packages' }],
      })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      patient: patientUser,
      profile: patientProfile,
      prescriptions,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue Digital Prescription
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor)
const issuePrescription = async (req, res, next) => {
  try {
    const {
      appointmentId,
      diagnosis,
      medicines = [],
      recommendedTests = [],
      doctorNotes = '',
      followUpDate = null,
    } = req.body;

    if (!appointmentId || !diagnosis || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, clinical diagnosis, and at least one medication are required.',
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Associated appointment not found.' });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: req.user._id,
      patient: appointment.patient,
      diagnosis,
      medicines,
      recommendedTests,
      doctorNotes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    });

    // Mark appointment as Completed
    appointment.status = 'Completed';
    appointment.statusHistory.push({
      status: 'Completed',
      changedAt: new Date(),
      notes: 'Consultation completed and digital prescription issued.',
    });
    await appointment.save();

    // Notify patient
    await Notification.create({
      user: appointment.patient,
      title: 'Digital Prescription Issued',
      message: `Dr. ${req.user.name} has issued your electronic prescription. View your dosage instructions and follow-up guidance.`,
      type: 'appointment',
      link: '/patient/prescriptions',
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctor', 'name');

    res.status(201).json({
      success: true,
      message: 'Prescription issued successfully and consultation marked as completed.',
      prescription: populatedPrescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Doctor Weekly Availability Schedule
// @route   PUT /api/doctor/availability
// @access  Private (Doctor)
const updateDoctorAvailability = async (req, res, next) => {
  try {
    const { availability, fee, bio } = req.body;

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          ...(availability && { availability }),
          ...(fee !== undefined && { fee: Number(fee) }),
          ...(bio !== undefined && { bio }),
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Consultation availability updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorDashboardStats,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorPatientRecord,
  issuePrescription,
  updateDoctorAvailability,
};
