const userModel = require("../models/userModels");
const { sendBookingConfirmationEmail } = require("../config/mail");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'understory-jwt-secret';

// Henter alle brugere fra databasen og returnerer dem som JSON
// async: Funktionen kan vente på asynkrone operationer (f.eks. database queries)
// req: Request objekt - indeholder data fra klienten (headers, body, params, etc.)
// res: Response objekt - bruges til at sende svar tilbage til klienten
async function getAllUsers(req, res) {
  try {
    // await: Vent på at database query er færdig før vi fortsætter
    const users = await userModel.getAllUsers();
    // res.status(200): Sæt HTTP status kode til 200 (OK)
    // res.json(): Send data som JSON til klienten
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opret en ny bruger (password hashes i modellen med bcrypt)
async function createUser(req, res) {
  try {
    // req.body: Indeholder data sendt fra klienten i request body (f.eks. fra form eller JSON)
    // Destructuring: Henter name, email og password fra req.body
    const { name, email, password } = req.body;

    // Validering: Tjek om påkrævede felter er udfyldt
    // res.status(400): Bad Request - klienten har sendt ugyldig data
    if (!name || !email) {
      return res.status(400).json({ error: "Navn og email skal udfyldes" });
    }

    // Password er valgfrit - valideres kun hvis angivet
    if (password && password.length < 8) {
      return res.status(400).json({ error: "Password skal være mindst 8 tegn" });
    }

    // Password hashes automatisk i userModel.createUser() (hvis angivet)
    // await: Vent på at database operation er færdig
    const result = await userModel.createUser({ name, email, password });

    // res.status(201): Created - ny ressource er oprettet
    res.status(201).json({ 
      message: "Bruger oprettet", 
      user: { id: result.id, name: result.name, email: result.email }
    });
  } catch (err) {
    // catch: Håndter fejl hvis noget går galt i try-blokken
    // res.status(500): Internal Server Error - server fejl
    res.status(500).json({ error: err.message });
  }
}

// Login bruger (password verificeres med bcrypt i modellen)
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email og password skal udfyldes" });
    }

    // Password verificeres med bcrypt i userModel.loginUser()
    const user = await userModel.loginUser(email, password);

    // req.session: Session objekt - gemmer data mellem requests (brugeren forbliver logget ind)
    // Session data gemmes i en cookie på klienten og serveren kan tilgå den ved hver request
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // Generer JWT token (for API-orienterede komponenter)
    const payload = {
      sub: `user:${user.id}`,
      email: user.email,
      name: user.name,
      role: 'user'
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '24h',
      issuer: 'understory-marketplace'
    });

    res.status(200).json({ 
      message: "Login succesfuldt", 
      user: { id: user.id, name: user.name, email: user.email },
      token // JWT token for API-brug
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// Logout bruger
async function logoutUser(req, res) {
  try {
    // req.session.destroy(): Sletter session data (brugeren logges ud)
    // Callback funktion: Køres når session er slettet (kan tage tid)
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

// Henter en specifik bruger fra databasen baseret på ID og returnerer brugerdata
async function getUserById(req, res) {
  try {
    // req.params: Indeholder route parametre (f.eks. /users/:id -> req.params.id)
    const { id } = req.params;
    // parseInt(): Konverterer string til integer (ID fra URL er altid string)
    const user = await userModel.getUserById(parseInt(id));

    // res.status(404): Not Found - ressource eksisterer ikke
    if (!user) {
      return res.status(404).json({ error: "Bruger ikke fundet" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Opdater bruger password
async function updateUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "Nyt password skal angives" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password skal være mindst 8 tegn" });
    }

    await userModel.updateUserPassword(parseInt(id), newPassword);
    res.status(200).json({ message: "Password opdateret" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Anmod om password reset (bruger crypto til token generation)
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email skal angives" });
    }

    // Opret reset token med crypto modul
    const resetData = await userModel.createPasswordResetToken(email);

    // Send email med reset link (token sendes i link)
    // I produktion: send email med link som https://projectdis.app/reset-password?token=xxxxx
    console.log(`🔑 Password reset token genereret for ${email}`);
    console.log(`   Token: ${resetData.token}`);
    console.log(`   Udløber: ${resetData.expiresAt}`);

    // For sikkerhed: fortæl ikke om email eksisterer
    res.status(200).json({ 
      message: "Hvis emailen eksisterer, vil du modtage en nulstillingsmail",
      // I produktion: fjern token fra response - send kun via email!
      debug: process.env.NODE_ENV !== "production" ? { token: resetData.token } : undefined
    });
  } catch (err) {
    // For sikkerhed: giv samme besked uanset om email findes
    console.error("Password reset fejl:", err.message);
    res.status(200).json({ 
      message: "Hvis emailen eksisterer, vil du modtage en nulstillingsmail" 
    });
  }
}

// Nulstil password med token (bruger crypto til verifikation)
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token og nyt password skal angives" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password skal være mindst 8 tegn" });
    }

    // Verificer token og opdater password
    const result = await userModel.resetPasswordWithToken(token, newPassword);

    res.status(200).json({ 
      message: "Password er blevet nulstillet",
      success: true
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  logoutUser,
  getUserById,
  updateUserPassword,
  requestPasswordReset,
  resetPassword,
};
