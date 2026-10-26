const express = require('express');
const router = express.Router();
const {
  getDoctorsDirectory,
  getDoctorAvailability,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public lookup endpoints
router.get('/doctors', getDoctorsDirectory);
router.get('/doctors/:id/availability', getDoctorAvailability);

// Patient protected appointment actions
router.post('/', protect, authorize('patient'), createAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.put('/:id/cancel', protect, authorize('patient'), cancelAppointment);

module.exports = router;
