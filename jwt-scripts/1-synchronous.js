const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.SESSION_SECRET || 'understory-jwt-secret';
const payload = {
  sub: 'user:admin',
  name: 'Understory Admin',
  role: 'admin'
};

// Signer token symmetrisk
const token = jwt.sign(payload, SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'understory-marketplace'
});

console.log('Generated token:\n', token);

// Verificer token symmetrisk
try {
  const decoded = jwt.verify(token, SECRET, {
    algorithms: ['HS256'],
    issuer: 'understory-marketplace'
  });
  console.log('\nVerified payload:\n', decoded);
} catch (err) {
  console.error('Token verification failed:', err.message);
}

// Eksempel på fejl ved verifikation
try {
  jwt.verify(token, 'wrong_secret');
} catch (err) {
  console.error('\nExpected failure (wrong secret):', err.message);
}

