const express = require('express');
const router = express.Router();
const {
  createTestBooking,
  getMyTestBookings,
  getBookingDetails,
  cancelTestBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('patient'), createTestBooking);
router.get('/my', authorize('patient'), getMyTestBookings);
router.get('/:id', getBookingDetails);
router.put('/:id/cancel', authorize('patient'), cancelTestBooking);

module.exports = router;
