const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_db';

const createAdmin = async () => {
  console.log('Starting createAdmin script');
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for seeding admin user');

    const adminEmail = 'admin@dayflow.com';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log('Admin user already exists:', adminEmail);
      process.exit(0);
    }

    const admin = await User.create({
      employeeId: 'ADMIN001',
      name: 'Administrator',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      position: 'Administrator',
    });

    console.log('Admin user created:', { email: admin.email, password: 'Admin@123' });
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

createAdmin();
