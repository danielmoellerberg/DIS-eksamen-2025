const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Hent alle admin-brugere
router.get("/", adminController.getAllAdmins);

// Hent admin ved ID
router.get("/:id", adminController.getAdminById);

// Opret en ny admin-bruger
router.post("/", adminController.createAdmin);

// Login admin-bruger
router.post("/login", adminController.loginAdmin);

// Logout admin-bruger
router.post("/logout", adminController.logoutAdmin);

// Opdater admin password
router.put("/:id/password", adminController.updateAdminPassword);

module.exports = router;
