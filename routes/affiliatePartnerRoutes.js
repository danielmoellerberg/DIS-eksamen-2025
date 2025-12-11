const express = require("express");
const router = express.Router();
const affiliatePartnerController = require("../controllers/affiliatePartnerController");
const { requireAuth: requireAuthHybrid, verifyToken } = require("../utils/authMiddleware");

// Middleware til at tjekke om bruger er logget ind
// Hybrid approach: accepterer både session (web) og JWT (API)
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

// Vis registrerings-side
router.get("/register", affiliatePartnerController.getRegisterPage);

// Håndter registrering
router.post("/register", affiliatePartnerController.register);

// Vis login-side
router.get("/login", affiliatePartnerController.getLoginPage);

// Håndter login
router.post("/login", affiliatePartnerController.login);

// Logout
router.get("/logout", affiliatePartnerController.logout);

// Dashboard (beskyttet route)
router.get("/dashboard", requireAuth, affiliatePartnerController.getDashboard);

// Experience management routes (beskyttede)
// Redirect /experiences til dashboard (da oplevelser nu vises der)
router.get("/experiences", requireAuth, (req, res) => {
  res.redirect("/affiliate/dashboard");
});
router.get("/experiences/create", requireAuth, affiliatePartnerController.getCreateExperiencePage);
router.post("/experiences/create", requireAuth, affiliatePartnerController.createExperience);
router.get("/experiences/edit/:id", requireAuth, affiliatePartnerController.getEditExperiencePage);
router.post("/experiences/edit/:id", requireAuth, affiliatePartnerController.updateExperience);
router.post("/experiences/delete/:id", requireAuth, affiliatePartnerController.deleteExperience);

module.exports = router;

