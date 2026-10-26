const express = require('express');
const router = express.Router();
const {
  getLabDashboardStats,
  getLabBookings,
  updateSampleStatus,
  uploadReport,
} = require('../controllers/labController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All lab staff routes require auth and lab_staff or admin role
router.use(protect);
router.use(authorize('lab_staff', 'admin'));

router.get('/stats', getLabDashboardStats);
router.get('/bookings', getLabBookings);
router.put('/bookings/:id/status', updateSampleStatus);
router.post('/reports', upload.single('reportFile'), uploadReport);

module.exports = router;
