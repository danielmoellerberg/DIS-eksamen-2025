const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Hent alle admin-brugere
router.get("/", adminController.getAllAdmins);

// Opret en ny admin-bruger
router.post("/", adminController.createAdmin);

module.exports = router;

