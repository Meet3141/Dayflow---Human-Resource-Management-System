const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  markLeave,
  getMyAttendance,
  getUserAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Employee routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/me', protect, getMyAttendance);

// Admin/HR/Manager routes
router.post('/:userId/leave', protect, authorize('admin', 'hr', 'manager'), markLeave);
router.get('/users/:userId', protect, authorize('admin', 'hr', 'manager'), getUserAttendance);

// Admin/HR/Manager: get all attendance in a date range
router.get('/', protect, authorize('admin', 'hr', 'manager'), getAllAttendance);

module.exports = router;
