const express = require('express');
const router = express.Router();
const { getMyReports, getReportById } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', getMyReports);
router.get('/:id', getReportById);

module.exports = router;
