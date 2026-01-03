const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, position } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      position,
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        status: 'success',
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user profile (employee - limited fields)
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (user) {
      // Only allow employees to edit limited fields
      const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'password'];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      const updatedUser = await user.save();

      res.json({
        status: 'success',
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          position: updatedUser.position,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get user by ID (admin)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json({
        status: 'success',
        data: user,
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user by ID (admin - full profile)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+password');

    if (user) {
      // Admins can edit all profile fields
      const updatableFields = [
        'firstName',
        'lastName',
        'email',
        'role',
        'department',
        'position',
        'phoneNumber',
        'dateOfBirth',
        'hireDate',
        'isActive',
        'password',
      ];

      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      const updatedUser = await user.save();

      res.json({
        status: 'success',
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          position: updatedUser.position,
          phoneNumber: updatedUser.phoneNumber,
          dateOfBirth: updatedUser.dateOfBirth,
          hireDate: updatedUser.hireDate,
          isActive: updatedUser.isActive,
        },
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
