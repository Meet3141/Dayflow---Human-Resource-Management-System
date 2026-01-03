const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms_db';

const listUsers = async () => {
  console.log('Starting listUsers script');
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find().select('-password');
    console.log('Users:', users);
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
};

listUsers();
