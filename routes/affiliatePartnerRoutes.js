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

