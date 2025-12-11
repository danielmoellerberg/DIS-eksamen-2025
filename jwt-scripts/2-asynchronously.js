const jwt = require('jsonwebtoken');
const util = require('util');
require('dotenv').config();

const SECRET = process.env.SESSION_SECRET || 'understory-jwt-secret';
const signAsync = util.promisify(jwt.sign);
const verifyAsync = util.promisify(jwt.verify);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    const payload = { sub: 'user:kunde', role: 'customer' };
    const signOptions = { expiresIn: '1s', issuer: 'understory-marketplace' };

    // opret token asynkront
    const token = await signAsync(payload, SECRET, signOptions);
    console.log('Signed token:', token);

    // verificer med det samme
    const decoded = await verifyAsync(token, SECRET);
    console.log('Verified payload:', decoded);

    // demonstrer håndtering af udløb
    await delay(2000); // vent på at token udløber (expiresIn: 1s)
    try {
      await verifyAsync(token, SECRET);
    } catch (err) {
      console.error('Expected verification error (token expired):', err.message);
    }
  } catch (err) {
    console.error('Unexpected JWT error:', err);
  }
})();

