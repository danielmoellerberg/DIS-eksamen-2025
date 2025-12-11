/**
 * JWT Authentication Utility til Understory Marketplace
 * Kan bruges til at generere og verificere tokens i projektet
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.SESSION_SECRET || 'understory-jwt-secret';
const ISSUER = 'understory-marketplace';

/**
 * Generer JWT token for en bruger
 * @param {Object} user - Bruger objekt med id, email, role
 * @param {string} expiresIn - Udløbstid (default: '24h')
 * @returns {string} JWT token
 */
function generateToken(user, expiresIn = '24h') {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role || 'user',
  };

  return jwt.sign(payload, SECRET, {
    algorithm: 'HS256',
    expiresIn,
    issuer: ISSUER,
  });
}

/**
 * Verificer JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload eller null hvis ugyldig
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      issuer: ISSUER,
    });
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return null;
  }
}

/**
 * Express middleware til JWT authentication
 * Gemmer decoded token i req.user
 */
function authMiddleware(req, res, next) {
  // Hent token fra Authorization header eller cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Ingen token angivet' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Ugyldig eller udløbet token' });
  }

  req.user = decoded;
  next();
}

// Demo
if (require.main === module) {
  console.log('=== JWT Auth Demo ===\n');
  
  // Simuler en bruger
  const user = {
    id: 42,
    email: 'admin@understory.dk',
    role: 'admin'
  };

  // Generer token
  const token = generateToken(user);
  console.log('Generated token:', token);

  // Verificer token
  const decoded = verifyToken(token);
  console.log('\nVerified payload:', decoded);

  // Test med ugyldig token
  const invalid = verifyToken('invalid.token.here');
  console.log('\nInvalid token result:', invalid);
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
};

