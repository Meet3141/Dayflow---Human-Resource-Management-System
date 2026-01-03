const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getUserById,
  updateUserById,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

// Admin routes
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUserById);

module.exports = router;
