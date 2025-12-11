const crypto = require('crypto');

// Lav public og private key med RSA krypteringsalgoritme
// RSA-nøglen genereres med en modulus som er 2048 bits lang
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Den hemmelige besked - Understory booking bekræftelse
const message = "Booking bekræftet: Keramikworkshop d. 15. december 2025 kl. 14:00";

// Lav en hash af beskeden
const hashedMessage = crypto.createHash('sha256').update(message).digest();

// Lav en signatur for hashen med private key
const signature = crypto.sign('RSA-SHA256', hashedMessage, privateKey);

// Verificer signaturen med public key
const isValid = crypto.verify('RSA-SHA256', hashedMessage, publicKey, signature);

// Output
console.log('=== Digital Signering (RSA-SHA256) ===');
console.log('Besked:', message);
console.log('Public Key:');
console.log(publicKey);
console.log('Private Key:');
console.log(privateKey);
console.log('Hashed besked:', hashedMessage.toString('hex'));
console.log('Signatur:', signature.toString('base64'));
console.log('Signatur gyldig:', isValid);

// Øvelse 4 - Kør 4-signature.js

