const express = require('express');
const router = express.Router();
const {
  submitReview,
  createComplaint,
  getMyPrescriptions,
} = require('../controllers/reviewComplaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/reviews', authorize('patient'), submitReview);
router.post('/complaints', createComplaint);
router.get('/prescriptions/my', authorize('patient'), getMyPrescriptions);

module.exports = router;
