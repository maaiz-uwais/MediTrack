const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'meditrack_super_secure_jwt_secret_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      // Patient specifics
      dob,
      gender,
      bloodGroup,
      address,
      // Doctor specifics
      specialization,
      experience,
      licenseNumber,
      fee,
      qualifications,
      bio,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered.',
      });
    }

    // Determine initial approval status
    // Doctors require explicit Admin approval before they can log in
    const isApproved = role !== 'doctor';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      isApproved,
    });

    // Create corresponding profile
    if (role === 'patient') {
      await PatientProfile.create({
        user: user._id,
        dob: dob || null,
        gender: gender || 'Prefer not to say',
        bloodGroup: bloodGroup || 'Unknown',
        address: address || {},
      });
    } else if (role === 'doctor') {
      // Default standard weekly availability: Monday to Friday 9 AM to 5 PM
      const defaultAvailability = [1, 2, 3, 4, 5].map((dayIndex) => ({
        dayOfWeek: dayIndex,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex],
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        isAvailable: true,
      }));

      await DoctorProfile.create({
        user: user._id,
        specialization: specialization || 'General Physician',
        experience: Number(experience) || 1,
        licenseNumber: licenseNumber || `MCI-${Date.now().toString().slice(-6)}`,
        fee: Number(fee) || 500,
        qualifications: qualifications
          ? (Array.isArray(qualifications) ? qualifications : qualifications.split(','))
          : ['MBBS'],
        bio: bio || '',
        availability: defaultAvailability,
      });
    }

    // If doctor is registered, they cannot log in immediately
    if (role === 'doctor' && !isApproved) {
      return res.status(201).json({
        success: true,
        message:
          'Doctor registration successful. Your profile has been submitted for Medical Admin approval. You will be able to log in once approved.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: false,
        },
      });
    }

    // For approved users (patients, lab_staff, admin)
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is suspended/blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact clinic support.',
      });
    }

    // Check doctor admin approval
    if (user.role === 'doctor' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          'Doctor account approval pending. An administrator must verify your medical credentials before login is granted.',
      });
    }

    // Fetch related profile
    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isApproved: user.isApproved,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isApproved: user.isApproved,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & specifics
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, ...profileData } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    let updatedProfile = null;
    if (user.role === 'patient') {
      updatedProfile = await PatientProfile.findOneAndUpdate(
        { user: user._id },
        { $set: profileData },
        { new: true, runValidators: true, upsert: true }
      );
    } else if (user.role === 'doctor') {
      updatedProfile = await DoctorProfile.findOneAndUpdate(
        { user: user._id },
        { $set: profileData },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
