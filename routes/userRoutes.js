const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth, requireJWT } = require("../utils/authMiddleware");

// Hent alle brugere (beskyttet - kræver authentication)
router.get("/", requireAuth, userController.getAllUsers);

// Hent bruger ved ID (beskyttet - kræver authentication)
router.get("/:id", requireAuth, userController.getUserById);

// Opret en ny bruger
router.post("/", userController.createUser);

// Login bruger
router.post("/login", userController.loginUser);

// Logout bruger
router.post("/logout", userController.logoutUser);

// Opdater bruger password (beskyttet - kræver authentication)
router.put("/:id/password", requireAuth, userController.updateUserPassword);

// Password reset med crypto token
router.post("/forgot-password", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
