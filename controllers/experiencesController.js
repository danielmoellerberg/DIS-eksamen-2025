const experienceModel = require("../models/experienceModels");

// Hent alle oplevelser
async function getAllExperiences(req, res) {
  try {
    const experiences = await experienceModel.getAllExperiences();
    res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opret en ny oplevelse
async function createExperience(req, res) {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ error: "Alle felter skal udfyldes" });
    }
    const result = await experienceModel.createExperience({ name, description, price });
    res.status(201).json({ message: "Oplevelse oprettet", rowsAffected: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllExperiences,
  createExperience,
};
