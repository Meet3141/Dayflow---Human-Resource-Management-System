const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testLeaveFlow() {
  try {
    console.log('=== Testing Leave Application Flow ===\n');

    // Step 1: Login
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'yug@example.com',
      password: 'password123',
    });
    
    const token = loginRes.data.data.token;
    const user = loginRes.data.data;
    console.log(`   ✓ Logged in as: ${user.name} (ID: ${user._id})`);

    // Step 2: Prepare leave form data
    console.log('\n2. Preparing leave application...');
    const leaveData = {
      leaveType: 'sick',
      startDate: '2026-01-05',
      endDate: '2026-01-08',
      reason: 'fever',
    };
    console.log('   Form data:', leaveData);

    // Step 3: Submit leave application
    console.log('\n3. Submitting leave application...');
    const leaveRes = await axios.post(`${API_URL}/leaves`, leaveData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('   ✓ Leave created successfully!');
    console.log('   Response:', JSON.stringify(leaveRes.data.data, null, 2));

    // Step 4: Retrieve leaves
    console.log('\n4. Retrieving my leaves...');
    const myLeavesRes = await axios.get(`${API_URL}/leaves/my-leaves`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`   ✓ Found ${myLeavesRes.data.count} leave(s)`);
    myLeavesRes.data.data.forEach((leave) => {
      console.log(`     - ${leave.leaveType} from ${leave.startDate} to ${leave.endDate} (${leave.numberOfDays} days)`);
    });

    console.log('\n=== All tests passed! ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.error('   Backend message:', error.response.data.message);
    }
    process.exit(1);
  }
}

testLeaveFlow();
