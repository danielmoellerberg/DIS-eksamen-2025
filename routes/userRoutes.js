const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Hent alle brugere
router.get("/", userController.getAllUsers);

// Opret en ny bruger
router.post("/", userController.createUser);

module.exports = router;

