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

// HR routes - full profile access
router.get('/users/:id', protect, authorize('hr'), getUserById);
router.put('/users/:id', protect, authorize('hr'), updateUserById);

module.exports = router;
