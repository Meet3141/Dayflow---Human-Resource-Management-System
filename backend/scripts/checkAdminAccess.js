const http = require('http');

const token = process.argv[2];
if (!token) {
  console.error('Usage: node checkAdminAccess.js <token>');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/users',
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
    try {
      console.log('Response:', JSON.parse(body));
    } catch (e) {
      console.log('Response:', body);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.end();
