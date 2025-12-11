const express = require("express");
const router = express.Router();
const experiencesController = require("../controllers/experiencesController");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

// Hent alle oplevelser
router.get("/", experiencesController.getAllExperiences);

// Opret en ny oplevelse (beskyttet - kræver affiliate rolle)
router.post("/", requireAuth, requireRole('affiliate'), experiencesController.createExperience);

module.exports = router;
