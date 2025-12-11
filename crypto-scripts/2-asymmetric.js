const crypto = require('crypto');

// Lav public og private key med RSA krypteringsalgoritme
// RSA-nøglen genereres med en modulus som er 2048 bits lang
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Krypter med public key - Understory sensitiv booking data
const encrypted = crypto.publicEncrypt(publicKey, Buffer.from('Booking betaling: 299 DKK - Stripe ID: pi_1234'));

// Dekrypter med private key
const decrypted = crypto.privateDecrypt(privateKey, encrypted);

// Output
console.log('=== Asymmetrisk Kryptering (RSA) ===');
console.log('Public Key:');
console.log(publicKey);
console.log('Private Key:');
console.log(privateKey);
console.log('Krypteret:', encrypted.toString('base64'));
console.log('Dekrypteret:', decrypted.toString('utf-8'));

// Øvelse 2 - Kør 2-asymmetric.js

