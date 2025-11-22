const adminModel = require("../models/adminModels");
const bcrypt = require("bcrypt"); // Tilføjet

// Hent alle admin-brugere
async function getAllAdmins(req, res) {
  try {
    const admins = await adminModel.getAllAdmins();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opret en ny admin-bruger
async function createAdmin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Alle felter skal udfyldes" });
    }

    // Hasher adgangskoden før den gemmes
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await adminModel.createAdmin({ username, password: hashedPassword });

    res.status(201).json({ message: "Admin-bruger oprettet", rowsAffected: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAdmins,
  createAdmin,
};




