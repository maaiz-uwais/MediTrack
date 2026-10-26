const express = require('express');
const router = express.Router();
const {
  getPatientDashboardData,
  getHealthHistory,
  updatePatientMedicalProfile,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('patient'));

router.get('/dashboard', getPatientDashboardData);
router.get('/health-history', getHealthHistory);
router.put('/profile', updatePatientMedicalProfile);

module.exports = router;
