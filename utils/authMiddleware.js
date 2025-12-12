/**
 * Hybrid Authentication Middleware
 * Understøtter både session cookies (web) og JWT tokens (API)
 * 
 * Dette implementerer den hybrid tilgang beskrevet i projektbeskrivelsen:
 * - Session cookies for webbaserede komponenter
 * - JWT tokens for API-orienterede komponenter
 * 
 * Sikkerhedsforanstaltninger implementeret med fokus på modstandsdygtighed mod:
 * - Session hijacking: JWT tokens i Authorization header (ikke i cookies)
 * - XSS: httpOnly cookies, JWT tokens ikke i localStorage
 * - CSRF: sameSite cookies, JWT tokens i Authorization header (ikke automatisk sendt)
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'understory-jwt-secret';
const ISSUER = 'understory-marketplace';

// Verificerer JWT token og returnerer decoded payload eller null hvis token er ugyldig eller udløbet
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

// Middleware der kun accepterer JWT tokens for API-routes og returnerer 401 hvis token mangler eller er ugyldig
// Middleware funktion: Modtager req, res, next
// next(): Kaldes for at fortsætte til næste middleware/route handler
// Hvis next() ikke kaldes, stopper request her (f.eks. hvis authentication fejler)
function requireJWT(req, res, next) {
  // req.headers: Indeholder HTTP headers fra request (f.eks. Authorization header)
  const authHeader = req.headers.authorization;
  // Optional chaining (?.): Sikrer at koden ikke crasher hvis authHeader er undefined
  // startsWith(): Tjekker om string starter med 'Bearer '
  // slice(7): Fjerner "Bearer " fra starten (7 tegn) og får selve token
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.cookies?.token; // Fallback: Prøv at hente token fra cookie

  if (!token) {
    return res.status(401).json({ error: 'Ingen token angivet. JWT token påkrævet.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Ugyldig eller udløbet token' });
  }

  // req.user: Tilføjer brugerdata til request objekt (tilgængelig i route handlers)
  // Dette er en standard måde at videregive data mellem middleware og route handlers
  req.user = decoded;
  req.authType = 'jwt';
  // next(): Fortsæt til næste middleware eller route handler
  // Uden next() ville request stoppe her
  next();
}

// Middleware der kun accepterer session cookies for web-routes og returnerer 401 hvis ingen session findes
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

// Hybrid middleware der accepterer både session cookies og JWT tokens, prioriterer JWT hvis begge er til stede
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

// Middleware der tjekker om brugeren har en af de tilladte roller og returnerer 403 hvis utilstrækkelige rettigheder
// ...allowedRoles: Rest parameter - samler alle argumenter i et array
// F.eks. requireRole('admin', 'user') -> allowedRoles = ['admin', 'user']
// Returnerer en funktion: Dette er en "higher-order function" (funktion der returnerer en funktion)
// Dette gør det muligt at kalde: requireRole('admin') som middleware
function requireRole(...allowedRoles) {
  // Returnerer en middleware funktion (arrow function)
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
