const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Notification = require('../models/Notification');

// Generate unique appointment ID
const generateAppointmentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MT-APT-${year}-${random}`;
};

// @desc    Get Directory of Verified Doctors
// @route   GET /api/appointments/doctors
// @access  Public
const getDoctorsDirectory = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    const query = {
      role: 'doctor',
      isApproved: true,
      isBlocked: false,
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const doctors = await User.find(query).select('name email phone');

    const doctorsWithProfiles = await Promise.all(
      doctors.map(async (doc) => {
        let profileQuery = { user: doc._id };
        if (specialization && specialization !== 'All') {
          profileQuery.specialization = specialization;
        }

        const profile = await DoctorProfile.findOne(profileQuery);
        if (!profile && specialization && specialization !== 'All') {
          return null;
        }

        return {
          _id: doc._id,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          profile: profile || {},
        };
      })
    );

    const filtered = doctorsWithProfiles.filter(Boolean);

    res.status(200).json({
      success: true,
      count: filtered.length,
      doctors: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor Real-time Slots for a Selected Date
// @route   GET /api/appointments/doctors/:id/availability
// @access  Public
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.id;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter date (YYYY-MM-DD) is required.',
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isApproved: true });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not approved for clinical practice.',
      });
    }

    const profile = await DoctorProfile.findOne({ user: doctorId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile record not found.',
      });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Check if doctor is on leave
    const isLeave = profile.leaves?.some(
      (leaveDate) => new Date(leaveDate).toDateString() === targetDate.toDateString()
    );

    if (isLeave) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: `Dr. ${doctor.name} is on scheduled leave on this date.`,
        slots: [],
      });
    }

    // Find availability for this day of week
    const daySchedule = profile.availability?.find((a) => a.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: `Dr. ${doctor.name} does not hold consultations on ${['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][dayOfWeek]}.`,
        slots: [],
      });
    }

    // Generate time slots based on schedule
    // e.g. startTime: '09:00', endTime: '15:00', slotDuration: 30
    const startParts = daySchedule.startTime.split(':').map(Number);
    const endParts = daySchedule.endTime.split(':').map(Number);
    const duration = daySchedule.slotDuration || 30;

    let currentMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    const generatedSlots = [];

    const formatTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 === 0 ? 12 : h % 12;
      const formattedM = m < 10 ? `0${m}` : m;
      return `${formattedH}:${formattedM} ${period}`;
    };

    while (currentMinutes + duration <= endMinutes) {
      const slotStart = formatTime(currentMinutes);
      const slotEnd = formatTime(currentMinutes + duration);
      generatedSlots.push(`${slotStart} - ${slotEnd}`);
      currentMinutes += duration;
    }

    // Query existing booked appointments on this date
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'Confirmed'] },
    }).select('slot');

    const bookedSlotSet = new Set(bookedAppointments.map((a) => a.slot));

    const evaluatedSlots = generatedSlots.map((slotString) => ({
      slot: slotString,
      isAvailable: !bookedSlotSet.has(slotString),
    }));

    res.status(200).json({
      success: true,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialization: profile.specialization,
        fee: profile.fee,
      },
      date: date,
      isAvailable: true,
      slots: evaluatedSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule Doctor Appointment with Double-Booking Prevention
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, slot, consultationType = 'In-Person', symptoms = '' } = req.body;

    if (!doctorId || !date || !slot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, consultation date, and time slot are required.',
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isApproved: true });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Selected doctor is not available for appointments.',
      });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    const fee = doctorProfile?.fee || 500;

    // Strict Double-Booking Prevention Rule
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      slot: slot,
      status: { $in: ['Scheduled', 'Confirmed'] },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: `Conflict: The time slot '${slot}' on ${new Date(date).toLocaleDateString()} has already been booked with Dr. ${doctor.name}. Please select an alternate slot.`,
      });
    }

    const appointment = await Appointment.create({
      appointmentId: generateAppointmentId(),
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      slot,
      consultationType,
      symptoms,
      fee,
      status: 'Scheduled',
      statusHistory: [
        {
          status: 'Scheduled',
          changedAt: new Date(),
          notes: `Appointment scheduled (${consultationType})`,
        },
      ],
      paymentStatus: 'Pending',
    });

    const populatedApt = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email phone');

    // Notify Patient
    await Notification.create({
      user: req.user._id,
      title: 'Appointment Scheduled',
      message: `Your appointment with Dr. ${doctor.name} is booked for ${new Date(date).toLocaleDateString()} (${slot}). Complete payment to confirm consultation.`,
      type: 'appointment',
      link: '/patient/appointments',
    });

    // Notify Doctor
    await Notification.create({
      user: doctorId,
      title: 'New Consultation Request',
      message: `${req.user.name} has scheduled a ${consultationType} consultation on ${new Date(date).toLocaleDateString()} at ${slot}.`,
      type: 'appointment',
      link: '/doctor/appointments',
    });

    res.status(201).json({
      success: true,
      message: 'Doctor appointment scheduled successfully.',
      appointment: populatedApt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Appointments for Current Patient
// @route   GET /api/appointments/my
// @access  Private (Patient)
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email phone')
      .sort({ date: 1, createdAt: -1 });

    // Fetch doctor profiles
    const populatedWithProfiles = await Promise.all(
      appointments.map(async (apt) => {
        const profile = await DoctorProfile.findOne({ user: apt.doctor._id });
        return {
          ...apt.toObject(),
          doctorProfile: profile,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedWithProfiles.length,
      appointments: populatedWithProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient)
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled.',
      });
    }

    appointment.status = 'Cancelled';
    appointment.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      notes: 'Appointment cancelled by patient request',
    });
    await appointment.save();

    // Alert Doctor
    await Notification.create({
      user: appointment.doctor,
      title: 'Appointment Cancelled',
      message: `The consultation on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.slot} was cancelled by the patient.`,
      type: 'appointment',
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorsDirectory,
  getDoctorAvailability,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
};
