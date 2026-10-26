const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getDoctorApprovals,
  approveDoctor,
  rejectDoctor,
  getComplaints,
  resolveComplaint,
  getSlotSettings,
  getAllPayments,
  refundPayment,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/doctor-approvals', getDoctorApprovals);
router.put('/doctor-approvals/:id/approve', approveDoctor);
router.put('/doctor-approvals/:id/reject', rejectDoctor);

router.get('/complaints', getComplaints);
router.put('/complaints/:id/resolve', resolveComplaint);

router.get('/slots', getSlotSettings);

router.get('/payments', getAllPayments);
router.put('/payments/:id/refund', refundPayment);

module.exports = router;
