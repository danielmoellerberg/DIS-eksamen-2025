/**
 * Hybrid Authentication Middleware
 * Understøtter både session cookies (web) og JWT tokens (API)
 * 
 * Dette implementerer den hybrid tilgang beskrevet i projektbeskrivelsen:
 * - Session cookies for webbaserede komponenter
 * - JWT tokens for API-orienterede komponenter
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'understory-jwt-secret';
const ISSUER = 'understory-marketplace';

/**
 * Verificer JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload eller null hvis ugyldig
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: ISSUER,
    });
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return null;
  }
}

/**
 * Middleware til JWT authentication (kun API)
 * Bruges til API-routes der kun skal acceptere JWT tokens
 */
function requireJWT(req, res, next) {
  // Hent token fra Authorization header eller cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Ingen token angivet. JWT token påkrævet.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Ugyldig eller udløbet token' });
  }

  // Gem decoded token i req.user
  req.user = decoded;
  req.authType = 'jwt';
  next();
}

/**
 * Middleware til session authentication (kun web)
 * Bruges til web-routes der kun skal acceptere sessions
 */
function requireSession(req, res, next) {
  // Tjek for user session
  if (req.session.user) {
    req.user = req.session.user;
    req.authType = 'session';
    return next();
  }

  // Tjek for admin session
  if (req.session.admin) {
    req.user = req.session.admin;
    req.authType = 'session';
    return next();
  }

  // Tjek for affiliate partner session
  if (req.session.affiliatePartner) {
    req.user = req.session.affiliatePartner;
    req.authType = 'session';
    return next();
  }

  // Ingen session fundet
  return res.status(401).json({ error: 'Ingen session fundet. Login påkrævet.' });
}

/**
 * Hybrid middleware - accepterer både session OG JWT
 * Prioriterer JWT hvis begge er til stede (API-first approach)
 * Dette er den primære middleware for hybrid tilgangen
 */
function requireAuth(req, res, next) {
  // Først tjek for JWT token (API-orienteret)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.cookies?.token;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      req.authType = 'jwt';
      return next();
    }
  }

  // Hvis ingen gyldig JWT, tjek for session (web-baseret)
  if (req.session.user) {
    req.user = req.session.user;
    req.authType = 'session';
    return next();
  }

  if (req.session.admin) {
    req.user = req.session.admin;
    req.authType = 'session';
    return next();
  }

  if (req.session.affiliatePartner) {
    req.user = req.session.affiliatePartner;
    req.authType = 'session';
    return next();
  }

  // Ingen authentication fundet
  return res.status(401).json({ 
    error: 'Authentication påkrævet. Brug enten JWT token eller session cookie.' 
  });
}

/**
 * Middleware til at tjekke specifik rolle
 * Bruges sammen med requireAuth eller requireJWT
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication påkrævet' });
    }

    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Utilstrækkelige rettigheder',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,      // Hybrid: accepterer både session og JWT
  requireJWT,       // Kun JWT (API)
  requireSession,   // Kun session (web)
  requireRole,      // Rolle-baseret access control
  verifyToken,      // Utility til at verificere tokens
};
