const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  getMyPayments,
  getInvoiceData,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/create-order', authorize('patient'), createRazorpayOrder);
router.post('/verify', authorize('patient'), verifyPaymentSignature);
router.get('/my', authorize('patient'), getMyPayments);
router.get('/invoice/:id', getInvoiceData);

module.exports = router;
