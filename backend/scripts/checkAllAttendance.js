const http = require('http');

const token = process.argv[2];
const start = process.argv[3];
const end = process.argv[4];

if (!token || !start || !end) {
  console.error('Usage: node checkAllAttendance.js <token> <start> <end>');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/attendance?start=${start}&end=${end}`,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log('Response:', JSON.parse(body)); } catch (e) { console.log('Response:', body); }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.end();
