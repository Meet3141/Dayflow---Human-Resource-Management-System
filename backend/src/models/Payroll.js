const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payPeriod: {
      // format: YYYY-MM
      type: String,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    grossPay: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
      default: 0,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// compute gross and net before save
payrollSchema.pre('save', function (next) {
  this.grossPay = (this.baseSalary || 0) + (this.allowances || 0);
  this.netPay = this.grossPay - (this.deductions || 0);
  next();
});

// unique per user per period
payrollSchema.index({ user: 1, payPeriod: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
