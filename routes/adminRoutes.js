const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

// ENDPOINT: GET /api/admins
// Beskrivelse: Henter alle admin-brugere fra databasen
// Beskyttet: Ja (kræver authentication + admin rolle)
router.get("/", requireAuth, requireRole('admin'), adminController.getAllAdmins);

// ENDPOINT: GET /api/admins/:id
// Beskrivelse: Henter en specifik admin-bruger baseret på ID
// Beskyttet: Ja (kræver authentication + admin rolle)
router.get("/:id", requireAuth, requireRole('admin'), adminController.getAdminById);

// ENDPOINT: POST /api/admins
// Beskrivelse: Opretter en ny admin-bruger i systemet
// Beskyttet: Ja (kræver authentication + admin rolle)
router.post("/", requireAuth, requireRole('admin'), adminController.createAdmin);

// ENDPOINT: POST /api/admins/login
// Beskrivelse: Logger en admin-bruger ind og returnerer JWT token + opretter session
// Beskyttet: Nej (offentlig - login endpoint)
router.post("/login", adminController.loginAdmin);

// ENDPOINT: POST /api/admins/logout
// Beskrivelse: Logger admin-brugeren ud ved at destruere session
// Beskyttet: Nej (offentlig)
router.post("/logout", adminController.logoutAdmin);

// ENDPOINT: PUT /api/admins/:id/password
// Beskrivelse: Opdaterer password for en specifik admin-bruger
// Beskyttet: Ja (kræver authentication + admin rolle)
router.put("/:id/password", requireAuth, requireRole('admin'), adminController.updateAdminPassword);

module.exports = router;
