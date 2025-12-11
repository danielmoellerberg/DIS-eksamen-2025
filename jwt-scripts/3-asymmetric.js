const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generér et nøglepar i hukommelsen. I produktion brug sikrede PEM-filer
// Se Øvelsstime 10 for at generere nøgler med OpenSSL
const { publicKey, wrongPublicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Generér en forkert public key til test
const { publicKey: wrongKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Hvis du i stedet vil læse nøgler fra filer:
// const fs = require('fs');
// const privateKey = fs.readFileSync('./private.pem', 'utf8');
// const publicKey = fs.readFileSync('./public.pem', 'utf8');

const payload = {
  sub: 'user:partner',
  name: 'Understory Partner',
};

// Signér token med private key (RS256)
const signOptions = {
  algorithm: 'RS256',
  expiresIn: '1h',
  issuer: 'understory-marketplace',
};

const token = jwt.sign(payload, privateKey, signOptions);
console.log('Signed JWT:\n', token);

// Verificér token med public key
try {
  const verifyOptions = {
    algorithms: ['RS256'],
    issuer: 'understory-marketplace',
  };
  const decoded = jwt.verify(token, publicKey, verifyOptions);
  console.log('\nDecoded / Verified payload:\n', decoded);
} catch (err) {
  console.error('Verification failed:', err.message);
}

console.log('\n---------------------------------');

// Eksempel på fejl ved verifikation med forkert public key
try {
  const verifyOptions = {
    algorithms: ['RS256'],
    issuer: 'understory-marketplace',
  };
  const decoded = jwt.verify(token, wrongKey, verifyOptions);
  console.log('\nDecoded / Verified payload:\n', decoded);
} catch (err) {
  console.error('\nVerification failed:', err.message);
}

