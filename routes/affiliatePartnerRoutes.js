const express = require("express");
const router = express.Router();
const affiliatePartnerController = require("../controllers/affiliatePartnerController");

// Middleware til at tjekke om bruger er logget ind
function requireAuth(req, res, next) {
  if (!req.session.affiliatePartner) {
    return res.redirect("/affiliate/login");
  }
  next();
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

module.exports = router;

