const jwt = require('jsonwebtoken');

const SECRET = 'understory-jwt-secret';
const payload = { sub: 'user:admin', name: 'Understory Admin', role: 'admin' };

// Sign token
const token = jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: '1h', issuer: 'understory-marketplace' });
console.log('Generated token:', token);

// Verify token
try {
  const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'], issuer: 'understory-marketplace' });
  console.log('✅ Token is valid:', decoded);
} catch (err) {
  console.error('❌ Token verification failed:', err.name, '-', err.message);
}

