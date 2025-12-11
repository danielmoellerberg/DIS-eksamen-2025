const crypto = require('crypto');

// Hashing af password med SHA-256
const password = "UnderstoryAdmin2025!";
const hash = crypto.createHash('sha256').update(password).digest('hex');

// Output
console.log('=== Hashing (SHA-256) ===');
console.log('Password:', password);
console.log('Hash:', hash);

// Øvelse 3 - Kør 3-hashing.js, skift passwordet og kør igen

