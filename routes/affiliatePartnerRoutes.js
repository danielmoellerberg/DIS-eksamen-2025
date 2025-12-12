const express = require("express");
const router = express.Router();
const affiliatePartnerController = require("../controllers/affiliatePartnerController");
const { requireAuth: requireAuthHybrid, verifyToken } = require("../utils/authMiddleware");

// Middleware der tjekker om affiliate partner er logget ind via session eller JWT token (hybrid approach)
function requireAuth(req, res, next) {
  // Tjek først for JWT token (API requests)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.cookies?.token;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.role === 'affiliate') {
      req.user = decoded;
      req.authType = 'jwt';
      return next();
    }
  }

  // Hvis ingen gyldig JWT, tjek for session (web requests)
  if (req.session.affiliatePartner) {
    req.user = req.session.affiliatePartner;
    req.authType = 'session';
    return next();
  }

  // Ingen authentication fundet
  // For API requests (JSON), returner 401
  if (req.headers['content-type']?.includes('application/json') || 
      req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'Authentication påkrævet' });
  }

  // For web requests (HTML), redirect til login
  return res.redirect("/affiliate/login");
}

// ENDPOINT: GET /affiliate/register
// Beskrivelse: Viser registrerings-siden for affiliate partners
// Beskyttet: Nej (offentlig)
router.get("/register", affiliatePartnerController.getRegisterPage);

// ENDPOINT: POST /affiliate/register
// Beskrivelse: Håndterer registrering af ny affiliate partner og logger dem automatisk ind
// Beskyttet: Nej (offentlig)
router.post("/register", affiliatePartnerController.register);

// ENDPOINT: GET /affiliate/login
// Beskrivelse: Viser login-siden for affiliate partners
// Beskyttet: Nej (offentlig)
router.get("/login", affiliatePartnerController.getLoginPage);

// ENDPOINT: POST /affiliate/login
// Beskrivelse: Håndterer login for affiliate partners (understøtter både form submit og JSON API)
// Beskyttet: Nej (offentlig - login endpoint)
router.post("/login", affiliatePartnerController.login);

// ENDPOINT: GET /affiliate/logout
// Beskrivelse: Logger affiliate partner ud ved at destruere session
// Beskyttet: Nej (offentlig)
router.get("/logout", affiliatePartnerController.logout);

// ENDPOINT: GET /affiliate/dashboard
// Beskrivelse: Viser affiliate partner dashboard med experiences, bookings og statistik
// Beskyttet: Ja (kræver authentication)
router.get("/dashboard", requireAuth, affiliatePartnerController.getDashboard);

// ENDPOINT: GET /affiliate/experiences
// Beskrivelse: Redirecter til dashboard (da alle experiences nu vises der)
// Beskyttet: Ja (kræver authentication)
router.get("/experiences", requireAuth, (req, res) => {
  res.redirect("/affiliate/dashboard");
});

// ENDPOINT: GET /affiliate/experiences/create
// Beskrivelse: Viser formularen til at oprette en ny experience
// Beskyttet: Ja (kræver authentication)
router.get("/experiences/create", requireAuth, affiliatePartnerController.getCreateExperiencePage);

// ENDPOINT: POST /affiliate/experiences/create
// Beskrivelse: Opretter en ny experience i databasen
// Beskyttet: Ja (kræver authentication)
router.post("/experiences/create", requireAuth, affiliatePartnerController.createExperience);

// ENDPOINT: GET /affiliate/experiences/edit/:id
// Beskrivelse: Viser edit-siden for en specifik experience med eksisterende data
// Beskyttet: Ja (kræver authentication)
router.get("/experiences/edit/:id", requireAuth, affiliatePartnerController.getEditExperiencePage);

// ENDPOINT: POST /affiliate/experiences/edit/:id
// Beskrivelse: Opdaterer en eksisterende experience i databasen
// Beskyttet: Ja (kræver authentication)
router.post("/experiences/edit/:id", requireAuth, affiliatePartnerController.updateExperience);

// ENDPOINT: POST /affiliate/experiences/delete/:id
// Beskrivelse: Sletter en experience fra databasen
// Beskyttet: Ja (kræver authentication)
router.post("/experiences/delete/:id", requireAuth, affiliatePartnerController.deleteExperience);

module.exports = router;

