const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

// Hent alle admin-brugere (beskyttet - kræver admin rolle)
router.get("/", requireAuth, requireRole('admin'), adminController.getAllAdmins);

// Hent admin ved ID (beskyttet - kræver admin rolle)
router.get("/:id", requireAuth, requireRole('admin'), adminController.getAdminById);

// Opret en ny admin-bruger (beskyttet - kræver admin rolle)
router.post("/", requireAuth, requireRole('admin'), adminController.createAdmin);

// Login admin-bruger
router.post("/login", adminController.loginAdmin);

// Logout admin-bruger
router.post("/logout", adminController.logoutAdmin);

// Opdater admin password (beskyttet - kræver admin rolle)
router.put("/:id/password", requireAuth, requireRole('admin'), adminController.updateAdminPassword);

module.exports = router;
