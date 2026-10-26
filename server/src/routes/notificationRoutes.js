const express = require('express');
const router = express.Router();
const { getMyNotifications, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllRead);

module.exports = router;
