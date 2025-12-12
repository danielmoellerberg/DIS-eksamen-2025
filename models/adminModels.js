const { pool, sql, ensureConnection } = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10; // Antal bcrypt salt rounds (10 er standard)

// Henter alle admin-brugere fra databasen uden password information
async function getAllAdmins() {
  try {
    await ensureConnection();
    const result = await pool
      .request()
      .query("SELECT id, username, created_at FROM Admins");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af admin-brugere: " + err.message);
  }
}

// Opret en ny admin-bruger med bcrypt-hashet password
async function createAdmin(data) {
  try {
    await ensureConnection();

    // Tjek om username allerede eksisterer
    const existingAdmin = await pool
      .request()
      .input("username", sql.NVarChar, data.username)
      .query("SELECT id FROM Admins WHERE username = @username");

    if (existingAdmin.recordset.length > 0) {
      throw new Error("Brugernavn er allerede i brug");
    }

    // Hash password med bcrypt
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const result = await pool
      .request()
      .input("username", sql.NVarChar, data.username)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Admins (username, password) 
        VALUES (@username, @password);
        SELECT SCOPE_IDENTITY() as id;
      `);

    return {
      id: result.recordset[0]?.id,
      username: data.username,
    };
  } catch (err) {
    throw new Error("Fejl ved oprettelse af admin-bruger: " + err.message);
  }
}

// Login admin-bruger (verificerer password med bcrypt)
async function loginAdmin(username, password) {
  try {
    await ensureConnection();

    // Hent admin fra database
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Admins WHERE username = @username");

    const admin = result.recordset[0];

    if (!admin) {
      throw new Error("Forkert brugernavn eller adgangskode");
    }

    // Verificer password med bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new Error("Forkert brugernavn eller adgangskode");
    }

    // Returner admin uden password
    return {
      id: admin.id,
      username: admin.username,
      created_at: admin.created_at,
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

// Henter en admin-bruger fra databasen baseret på ID uden password information
async function getAdminById(id) {
  try {
    await ensureConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT id, username, created_at FROM Admins WHERE id = @id");

    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af admin: " + err.message);
  }
}

// Opdater admin password (med bcrypt hashing)
async function updateAdminPassword(id, newPassword) {
  try {
    await ensureConnection();

    // Hash nyt password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("password", sql.NVarChar, hashedPassword)
      .query("UPDATE Admins SET password = @password WHERE id = @id");

    return { success: true };
  } catch (err) {
    throw new Error("Fejl ved opdatering af password: " + err.message);
  }
}

module.exports = {
  getAllAdmins,
  createAdmin,
  loginAdmin,
  getAdminById,
  updateAdminPassword,
};
