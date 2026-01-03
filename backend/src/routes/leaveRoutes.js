const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  reviewLeave,
  updateLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Employee routes
router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/:id', protect, getLeaveById);
router.put('/:id', protect, updateLeave);
router.delete('/:id', protect, cancelLeave);

// HR routes
router.get('/', protect, authorize('hr'), getAllLeaves);
router.put('/:id/review', protect, authorize('hr'), reviewLeave);

module.exports = router;
