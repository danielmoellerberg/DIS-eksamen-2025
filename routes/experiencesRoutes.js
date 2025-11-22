const express = require("express");
const router = express.Router();
const experiencesController = require("../controllers/experiencesController");

// Hent alle oplevelser
router.get("/", experiencesController.getAllExperiences);

// Opret en ny oplevelse
router.post("/", experiencesController.createExperience);

module.exports = router;
