const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get start of day (UTC)
const startOfDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

// Helper to compute hours between two dates
const hoursBetween = (start, end) => {
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100; // two decimals
};

// @desc Check-in for today
// @route POST /api/attendance/checkin
// @access Private (employee and above)
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = startOfDay(new Date());

    // find or create attendance record for today
    let attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
      attendance = new Attendance({ user: userId, date: today });
    }

    if (attendance.checkIn) {
      return res.status(400).json({ status: 'error', message: 'Already checked in for today' });
    }

    attendance.checkIn = new Date();
    attendance.status = 'Present';

    await attendance.save();

    res.status(200).json({ status: 'success', data: attendance });
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key, try fetching again
      const userId = req.user._id;
      const today = startOfDay(new Date());
      const attendance = await Attendance.findOne({ user: userId, date: today });
      return res.status(200).json({ status: 'success', data: attendance });
    }

    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Check-out for today
// @route POST /api/attendance/checkout
// @access Private (employee and above)
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = startOfDay(new Date());

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ status: 'error', message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ status: 'error', message: 'Already checked out for today' });
    }

    attendance.checkOut = new Date();
    attendance.durationHours = hoursBetween(attendance.checkIn, attendance.checkOut);

    // Set status based on duration
    if (attendance.durationHours >= 8) {
      attendance.status = 'Present';
    } else if (attendance.durationHours >= 4) {
      attendance.status = 'Half-day';
    } else {
      attendance.status = 'Half-day';
    }

    await attendance.save();

    res.status(200).json({ status: 'success', data: attendance });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Mark leave for a date (admin/hr)
// @route POST /api/attendance/:userId/leave
// @access Private/Admin/HR
exports.markLeave = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, notes } = req.body;

    if (!date) {
      return res.status(400).json({ status: 'error', message: 'Date is required' });
    }

    const day = startOfDay(new Date(date));

    let attendance = await Attendance.findOne({ user: userId, date: day });

    if (!attendance) {
      attendance = new Attendance({ user: userId, date: day });
    }

    attendance.status = 'Leave';
    attendance.notes = notes;

    await attendance.save();

    res.status(200).json({ status: 'success', data: attendance });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Get my attendance (daily or weekly)
// @route GET /api/attendance/me
// @access Private
// Query parameters:
// - date=YYYY-MM-DD (daily)
// - start=YYYY-MM-DD & end=YYYY-MM-DD (range/weekly)
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, start, end } = req.query;

    if (date) {
      const day = startOfDay(new Date(date));
      const attendance = await Attendance.findOne({ user: userId, date: day }).select('-__v');
      return res.json({ status: 'success', data: attendance });
    }

    // Range (weekly)
    if (start && end) {
      const startDay = startOfDay(new Date(start));
      const endDay = startOfDay(new Date(end));

      const records = await Attendance.find({
        user: userId,
        date: { $gte: startDay, $lte: endDay },
      }).sort({ date: 1 });

      return res.json({ status: 'success', data: records });
    }

    // default: today's record
    const today = startOfDay(new Date());
    const attendance = await Attendance.findOne({ user: userId, date: today });
    res.json({ status: 'success', data: attendance });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Get attendance for a user (admin/manager/hr)
// @route GET /api/attendance/users/:userId
// @access Private/Admin/HR/Manager
// Query: start & end
exports.getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    // verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (!start || !end) {
      return res.status(400).json({ status: 'error', message: 'start and end dates are required' });
    }

    const startDay = startOfDay(new Date(start));
    const endDay = startOfDay(new Date(end));

    const records = await Attendance.find({
      user: userId,
      date: { $gte: startDay, $lte: endDay },
    }).sort({ date: 1 });

    res.json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Get all attendance within a date range (admin/hr/manager)
// @route GET /api/attendance?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access Private/Admin/HR/Manager
exports.getAllAttendance = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ status: 'error', message: 'start and end dates are required' });
    }

    const startDay = startOfDay(new Date(start));
    const endDay = startOfDay(new Date(end));

    const records = await Attendance.find({
      date: { $gte: startDay, $lte: endDay },
    })
      .sort({ date: 1 })
      .populate('user', 'employeeId name email role');

    res.json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
