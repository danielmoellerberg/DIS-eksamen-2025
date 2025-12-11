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

// Eksempel med Understory bruger login
const password = "UnderstoryKunde123!";
const input = "UnderstoryKunde123!";
const salt1 = generateSalt();
const salt2 = generateSalt();
const rounds = 10;
const hashedPassword = hashWithSaltRounds(password, salt1, rounds);
const inputPassword = hashWithSaltRounds(input, salt1, rounds);

// Output
console.log('=== Password Verification ===');
console.log('Password:', password);
console.log('Input:', input);
console.log('Salt1 (brugt til begge):', salt1);
console.log('Salt2 (ikke brugt):', salt2);
console.log('Hashed password:', hashedPassword);
console.log('Hashed input:', inputPassword);

// Check om password matcher input
if (hashedPassword === inputPassword) {
  console.log("✅ Korrekt password - Login succesfuldt!");
} else {
  console.log("❌ Forkert password - Adgang nægtet!");
}

// Øvelse 6 - Kør 6-password.js med rigtig og forkert salt
