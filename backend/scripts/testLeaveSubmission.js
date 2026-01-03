const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leave = require('../src/models/Leave');
require('dotenv').config();

async function testLeaveSubmission() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find a test employee
    const employee = await User.findOne({ role: 'employee' });
    
    if (!employee) {
      console.log('No employee found in database');
      process.exit(1);
    }

    console.log(`Found employee: ${employee.name} (${employee._id})`);

    // Try to create a leave record
    const startDate = new Date('2026-01-05');
    const endDate = new Date('2026-01-08');
    const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const leaveData = {
      employee: employee._id,
      leaveType: 'sick',
      startDate,
      endDate,
      numberOfDays,
      reason: 'fever',
    };

    console.log('Attempting to create leave with data:', leaveData);

    const leave = await Leave.create(leaveData);
    console.log('Leave created successfully:', leave);

    // Check the database
    const allLeaves = await Leave.find({ employee: employee._id });
    console.log(`Total leaves for this employee: ${allLeaves.length}`);
    console.log('Leaves:', allLeaves);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
}

testLeaveSubmission();
