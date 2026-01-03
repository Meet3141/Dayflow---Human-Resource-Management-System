const Payroll = require('../models/Payroll');
const User = require('../models/User');

// @desc Get my payroll for a period or latest
// @route GET /api/payroll/me
// @access Private (employee)
// Query: period=YYYY-MM (optional)
exports.getMyPayroll = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period } = req.query;

    if (period) {
      const record = await Payroll.findOne({ user: userId, payPeriod: period }).select('-__v');
      return res.json({ status: 'success', data: record });
    }

    // if no period, return latest payroll (by payPeriod desc)
    const record = await Payroll.findOne({ user: userId }).sort({ payPeriod: -1 }).select('-__v');
    res.json({ status: 'success', data: record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Get user payroll (admin/hr)
// @route GET /api/payroll/users/:userId
// @access Private/Admin/HR/Manager
// Query: period=YYYY-MM (optional), start & end ranges not implemented yet
exports.getUserPayroll = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    if (period) {
      const record = await Payroll.findOne({ user: userId, payPeriod: period }).select('-__v');
      return res.json({ status: 'success', data: record });
    }

    const records = await Payroll.find({ user: userId }).sort({ payPeriod: -1 });
    res.json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc Update or create salary structure for a user (admin)
// @route PUT /api/payroll/users/:userId
// @access Private/Admin
// Body: payPeriod(YYYY-MM), baseSalary, allowances, deductions, notes
exports.updateSalaryStructure = async (req, res) => {
  try {
    const { userId } = req.params;
    const { payPeriod, baseSalary, allowances, deductions, notes, effectiveDate } = req.body;

    if (!payPeriod || baseSalary === undefined) {
      return res.status(400).json({ status: 'error', message: 'payPeriod and baseSalary are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const payload = {
      user: userId,
      payPeriod,
      baseSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      notes: notes || '',
    };

    if (effectiveDate) payload.effectiveDate = effectiveDate;

    // upsert: create or update existing record for period
    const record = await Payroll.findOneAndUpdate(
      { user: userId, payPeriod },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // ensure save hook runs to compute gross/net
    await record.save();

    res.json({ status: 'success', data: record });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Payroll record already exists' });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};
