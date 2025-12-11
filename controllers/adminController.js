const adminModel = require("../models/adminModels");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'understory-jwt-secret';

// Hent alle admin-brugere
async function getAllAdmins(req, res) {
  try {
    const admins = await adminModel.getAllAdmins();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opret en ny admin-bruger (password hashes i modellen med bcrypt)
async function createAdmin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Alle felter skal udfyldes" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password skal være mindst 8 tegn" });
    }

    // Password hashes automatisk i adminModel.createAdmin()
    const result = await adminModel.createAdmin({ username, password });

    res.status(201).json({ 
      message: "Admin-bruger oprettet", 
      admin: { id: result.id, username: result.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Login admin-bruger
async function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Brugernavn og password skal udfyldes" });
    }

    // Password verificeres med bcrypt i adminModel.loginAdmin()
    const admin = await adminModel.loginAdmin(username, password); // rettet fra loginAdimage.pngmin

    // Gem admin i session
    req.session.admin = {
      id: admin.id,
      username: admin.username,
    };

    // --- Tilføj JWT ---
    const payload = {
      sub: `user:${admin.id}`,
      username: admin.username,
      role: 'admin'
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',            // sæt efter behov
      issuer: 'understory-marketplace'
    });

    res.status(200).json({ 
      message: "Login succesfuldt", 
      admin: { id: admin.id, username: admin.username },
      token // <-- JWT sendt til klienten
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// Logout admin-bruger
async function logoutAdmin(req, res) {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Kunne ikke logge ud" });
      }
      res.status(200).json({ message: "Logget ud" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Hent admin ved ID
async function getAdminById(req, res) {
  try {
    const { id } = req.params;
    const admin = await adminModel.getAdminById(parseInt(id));

    if (!admin) {
      return res.status(404).json({ error: "Admin ikke fundet" });
    }

    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opdater admin password
async function updateAdminPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "Nyt password skal angives" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password skal være mindst 8 tegn" });
    }

    await adminModel.updateAdminPassword(parseInt(id), newPassword);
    res.status(200).json({ message: "Password opdateret" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAdmins,
  createAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminById,
  updateAdminPassword,
};
