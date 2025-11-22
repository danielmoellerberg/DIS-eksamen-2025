const userModel = require("../models/userModels");

// Hent alle brugere
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opret en ny bruger
async function createUser(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Alle felter skal udfyldes" });
    }
    const result = await userModel.createUser({ name, email });
    res.status(201).json({ message: "Bruger oprettet", rowsAffected: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllUsers,
  createUser,
};
