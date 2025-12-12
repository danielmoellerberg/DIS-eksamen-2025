const express = require("express");
const router = express.Router();
const experiencesController = require("../controllers/experiencesController");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

// ENDPOINT: GET /api/experiences
// Beskrivelse: Henter alle oplevelser fra databasen
// Beskyttet: Nej (offentlig - bruges af forside)
router.get("/", experiencesController.getAllExperiences);

// ENDPOINT: POST /api/experiences
// Beskrivelse: Opretter en ny oplevelse i databasen
// Beskyttet: Ja (kræver authentication + affiliate rolle)
router.post("/", requireAuth, requireRole('affiliate'), experiencesController.createExperience);

module.exports = router;
