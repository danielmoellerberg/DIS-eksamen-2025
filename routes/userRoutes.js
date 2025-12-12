// require(): Importerer moduler/filer (CommonJS syntax - Node.js standard)
const express = require("express");
// express.Router(): Opretter en router til at gruppere relaterede routes
// Router gør det nemt at organisere routes i separate filer
const router = express.Router();
const userController = require("../controllers/userController");
// Destructuring: Henter requireAuth og requireJWT fra authMiddleware modulet
const { requireAuth, requireJWT } = require("../utils/authMiddleware");

// ENDPOINT: GET /api/users
// Beskrivelse: Henter alle brugere fra databasen
// Beskyttet: Ja (kræver authentication)
router.get("/", requireAuth, userController.getAllUsers);

// ENDPOINT: GET /api/users/:id
// Beskrivelse: Henter en specifik bruger baseret på ID
// Beskyttet: Ja (kræver authentication)
router.get("/:id", requireAuth, userController.getUserById);

// ENDPOINT: POST /api/users
// Beskrivelse: Opretter en ny bruger i systemet
// Beskyttet: Nej (offentlig - alle kan oprette bruger)
router.post("/", userController.createUser);

// ENDPOINT: POST /api/users/login
// Beskrivelse: Logger en bruger ind og returnerer JWT token + opretter session
// Beskyttet: Nej (offentlig - login endpoint)
router.post("/login", userController.loginUser);

// ENDPOINT: POST /api/users/logout
// Beskrivelse: Logger brugeren ud ved at destruere session
// Beskyttet: Nej (offentlig)
router.post("/logout", userController.logoutUser);

// ENDPOINT: PUT /api/users/:id/password
// Beskrivelse: Opdaterer password for en specifik bruger
// Beskyttet: Ja (kræver authentication)
router.put("/:id/password", requireAuth, userController.updateUserPassword);

// ENDPOINT: POST /api/users/forgot-password
// Beskrivelse: Anmoder om password reset - genererer token og sender email (hvis konfigureret)
// Beskyttet: Nej (offentlig)
router.post("/forgot-password", userController.requestPasswordReset);

// ENDPOINT: POST /api/users/reset-password
// Beskrivelse: Nulstiller password med et gyldigt reset token
// Beskyttet: Nej (offentlig - token giver adgang)
router.post("/reset-password", userController.resetPassword);

// module.exports: Eksporterer router så den kan importeres i andre filer (f.eks. server.js)
// Dette gør det muligt at organisere routes i separate filer
module.exports = router;
