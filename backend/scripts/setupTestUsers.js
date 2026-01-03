const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_db';

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: String,
  department: String,
  position: String,
});

const User = mongoose.model('User', userSchema);

const createTestUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ MongoDB Connected');

    // Admin User
    const adminExists = await User.findOne({ email: 'admin@dayflow.com' });
    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      await User.create({
        employeeId: 'ADMIN001',
        name: 'Administrator',
        email: 'admin@dayflow.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
        position: 'Administrator',
      });
      console.log('✓ Admin created: admin@dayflow.com / admin123');
    } else {
      console.log('✓ Admin already exists: admin@dayflow.com');
    }

    // HR User
    const hrExists = await User.findOne({ email: 'hr@dayflow.com' });
    if (!hrExists) {
      const hashedPassword = await bcryptjs.hash('hr123', 10);
      await User.create({
        employeeId: 'HR001',
        name: 'HR Manager',
        email: 'hr@dayflow.com',
        password: hashedPassword,
        role: 'hr',
        department: 'Human Resources',
        position: 'HR Manager',
      });
      console.log('✓ HR user created: hr@dayflow.com / hr123');
    } else {
      console.log('✓ HR user already exists: hr@dayflow.com');
    }

    // Employee User
    const empExists = await User.findOne({ email: 'employee@dayflow.com' });
    if (!empExists) {
      const hashedPassword = await bcryptjs.hash('emp123', 10);
      await User.create({
        employeeId: 'EMP001',
        name: 'John Employee',
        email: 'employee@dayflow.com',
        password: hashedPassword,
        role: 'employee',
        department: 'IT',
        position: 'Software Developer',
      });
      console.log('✓ Employee created: employee@dayflow.com / emp123');
    } else {
      console.log('✓ Employee already exists: employee@dayflow.com');
    }

    console.log('\n✓ Test users setup completed!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createTestUsers();
