const sql = require("mssql");

// Hent alle admin-brugere
async function getAllAdmins() {
  try {
    const pool = await sql.connect(process.env.DB_CONNECTION);
    const result = await pool.request().query("SELECT * FROM Admins");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af admin-brugere: " + err.message);
  }
}

// Opret en ny admin-bruger
async function createAdmin(data) {
  try {
    const pool = await sql.connect(process.env.DB_CONNECTION);
    const result = await pool.request()
      .input("username", sql.NVarChar, data.username)
      .input("password", sql.NVarChar, data.password)
      .query("INSERT INTO Admins (username, password) VALUES (@username, @password)");
    return result.rowsAffected;
  } catch (err) {
    throw new Error("Fejl ved oprettelse af admin-bruger: " + err.message);
  }
}

module.exports = {
  getAllAdmins,
  createAdmin,
};
