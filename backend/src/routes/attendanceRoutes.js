const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  markLeave,
  getMyAttendance,
  getUserAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Employee routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/me', protect, getMyAttendance);

// Admin/HR/Manager routes
router.post('/:userId/leave', protect, authorize('admin', 'hr', 'manager'), markLeave);
router.get('/users/:userId', protect, authorize('admin', 'hr', 'manager'), getUserAttendance);

module.exports = router;
