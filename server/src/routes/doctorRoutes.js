const express = require('express');
const router = express.Router();
const {
  getDoctorDashboardStats,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorPatientRecord,
  issuePrescription,
  updateDoctorAvailability,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All doctor routes require authentication and doctor role
router.use(protect);
router.use(authorize('doctor', 'admin'));

router.get('/stats', getDoctorDashboardStats);
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/patients/:patientId', getDoctorPatientRecord);
router.post('/prescriptions', issuePrescription);
router.put('/availability', updateDoctorAvailability);

module.exports = router;
