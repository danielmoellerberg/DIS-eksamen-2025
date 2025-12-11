const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Hent alle brugere
router.get("/", userController.getAllUsers);

// Hent bruger ved ID
router.get("/:id", userController.getUserById);

// Opret en ny bruger
router.post("/", userController.createUser);

// Login bruger
router.post("/login", userController.loginUser);

// Logout bruger
router.post("/logout", userController.logoutUser);

// Opdater bruger password
router.put("/:id/password", userController.updateUserPassword);

// Password reset med crypto token
router.post("/forgot-password", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
