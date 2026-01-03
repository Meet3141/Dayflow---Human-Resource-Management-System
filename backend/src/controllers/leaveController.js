const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Apply for leave (Employee)
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res) => {
  try {
    let { leaveType, startDate, endDate, reason } = req.body;

    // Basic presence validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    // Normalize leaveType to values expected by the model
    const normalized = leaveType.toString().trim().toLowerCase();
    if (normalized === 'paid') leaveType = 'annual';
    else leaveType = normalized;

    const allowedTypes = ['sick', 'casual', 'annual', 'unpaid', 'maternity', 'paternity'];
    if (!allowedTypes.includes(leaveType)) {
      return res.status(400).json({ status: 'error', message: 'Invalid leave type' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ status: 'error', message: 'Invalid dates provided' });
    }

    if (start > end) {
      return res.status(400).json({ status: 'error', message: 'End date must be after start date' });
    }

    // Calculate number of days (inclusive)
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Create leave application
    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'employeeId name email department position');

    res.status(201).json({
      status: 'success',
      data: populatedLeave,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all leaves for logged-in employee
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.json({
      status: 'success',
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get all leaves (HR)
// @route   GET /api/leaves
// @access  Private/HR
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'employeeId name email department position')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.json({
      status: 'success',
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Get single leave by ID
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'employeeId name email department position')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave not found',
      });
    }

    // Check if user is authorized to view this leave
    if (
      req.user.role !== 'hr' &&
      leave.employee._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this leave',
      });
    }

    res.json({
      status: 'success',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Approve or reject leave (HR)
// @route   PUT /api/leaves/:id/review
// @access  Private/HR
exports.reviewLeave = async (req, res) => {
  try {
    const { status, comments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either Approved or Rejected',
      });
    }

    const leave = await Leave.findById(req.params.id).populate(
      'employee',
      'employeeId name email'
    );

    if (!leave) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: `Leave has already been ${leave.status}`,
      });
    }

    // Update leave status
    leave.status = status;
    leave.comments = comments || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = Date.now();

    await leave.save();

    // If approved, update attendance
    if (status === 'Approved') {
      await updateAttendanceForLeave(leave);

      // Create notification for approved leave
      await createNotification(
        leave.employee._id,
        'Leave Approved',
        `Your ${leave.leaveType} leave from ${new Date(leave.startDate).toDateString()} to ${new Date(leave.endDate).toDateString()} has been approved.`,
        'leave_approval',
        leave._id,
        'Leave',
        {
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          numberOfDays: leave.numberOfDays,
        }
      );
    } else if (status === 'Rejected') {
      // Create notification for rejected leave
      await createNotification(
        leave.employee._id,
        'Leave Rejected',
        `Your ${leave.leaveType} leave request has been rejected. Reason: ${comments || 'No reason provided'}`,
        'leave_rejection',
        leave._id,
        'Leave',
        {
          leaveType: leave.leaveType,
          rejectionReason: comments,
        }
      );
    }

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'employeeId name email department position')
      .populate('reviewedBy', 'name email');

    res.json({
      status: 'success',
      message: `Leave ${status.toLowerCase()} successfully`,
      data: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update leave application (Employee - only if pending)
// @route   PUT /api/leaves/:id
// @access  Private
exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave not found',
      });
    }

    // Check if user owns this leave
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this leave',
      });
    }

    // Can only update if status is Pending
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update leave with status: ${leave.status}`,
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (leaveType) leave.leaveType = leaveType;
    if (startDate) leave.startDate = startDate;
    if (endDate) leave.endDate = endDate;
    if (reason) leave.reason = reason;

    // Validate dates
    if (new Date(leave.startDate) > new Date(leave.endDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'End date must be after start date',
      });
    }

    // Recalculate number of days if dates changed
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    leave.numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id).populate(
      'employee',
      'employeeId name email department position'
    );

    res.json({
      status: 'success',
      data: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Cancel leave (Employee - only if pending)
// @route   DELETE /api/leaves/:id
// @access  Private
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave not found',
      });
    }

    // Check if user owns this leave
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this leave',
      });
    }

    // Can only cancel if status is Pending
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot cancel leave with status: ${leave.status}`,
      });
    }

    await leave.deleteOne();

    res.json({
      status: 'success',
      message: 'Leave cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Helper function to update attendance when leave is approved
async function updateAttendanceForLeave(leave) {
  try {
    const attendanceRecords = [];
    const currentDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    while (currentDate <= endDate) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if attendance record already exists
        const existingAttendance = await Attendance.findOne({
          user: leave.employee._id,
          date: new Date(currentDate.setHours(0, 0, 0, 0)),
        });

        if (!existingAttendance) {
          attendanceRecords.push({
            user: leave.employee._id,
            date: new Date(currentDate.setHours(0, 0, 0, 0)),
            status: 'Leave',
            leaveReference: leave._id,
            notes: `${leave.leaveType} leave`,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
}
