const express = require('express');
const router = express.Router();
const {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/', getAllTests);
router.get('/packages/all', getAllPackages);
router.get('/:id', getTestById);

// Admin-only endpoints for Test CRUD
router.post('/', protect, authorize('admin'), createTest);
router.put('/:id', protect, authorize('admin'), updateTest);
router.delete('/:id', protect, authorize('admin'), deleteTest);

// Admin-only endpoints for Package CRUD
router.post('/packages', protect, authorize('admin'), createPackage);
router.put('/packages/:id', protect, authorize('admin'), updatePackage);
router.delete('/packages/:id', protect, authorize('admin'), deletePackage);

module.exports = router;
