const express = require('express');
const router = express.Router();
const { getMyPayroll, getUserPayroll, updateSalaryStructure } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Employee: view own payroll
router.get('/me', protect, getMyPayroll);

// Admin/HR/Manager: view user payroll
router.get('/users/:userId', protect, authorize('admin', 'hr', 'manager'), getUserPayroll);

// Admin: update/create salary for a user
router.put('/users/:userId', protect, authorize('admin'), updateSalaryStructure);

module.exports = router;
