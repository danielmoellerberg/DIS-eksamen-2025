const crypto = require('crypto');

// En salt er en tilfældig værdi som tilføjes til passwordet ved hashing
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

// Her kombineres en salt med en hash ad flere gange ved hashing af et password
function hashWithSaltRounds(password, salt, rounds) {
  let hash = password + salt;
  for (let i = 0; i < rounds; i++) {
    hash = crypto.createHash('sha256').update(hash).digest('hex');
  }
  return hash;
}

// Eksempel med Understory admin password
const password = "UnderstoryMarketplace2025!";
const salt = generateSalt();
const rounds = 10;
const hashedPassword = hashWithSaltRounds(password, salt, rounds);

// Output
console.log('=== Salt + Hashing ===');
console.log('Password:', password);
console.log('Salt:', salt);
console.log('Rounds:', rounds);
console.log('Hashed password:', hashedPassword);

// Øvelse 5 - Kør 5-salt.js flere gange og observer forskellen i hash for samme password

