const sql = require("mssql");

// Hent alle brugere
async function getAllUsers() {
  try {
    const pool = await sql.connect(process.env.DB_CONNECTION);
    const result = await pool.request().query("SELECT * FROM Users");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af brugere: " + err.message);
  }
}

// Opret en ny bruger
async function createUser(data) {
  try {
    const pool = await sql.connect(process.env.DB_CONNECTION);
    const result = await pool.request()
      .input("name", sql.NVarChar, data.name)
      .input("email", sql.NVarChar, data.email)
      .query("INSERT INTO Users (name, email) VALUES (@name, @email)");
    return result.rowsAffected;
  } catch (err) {
    throw new Error("Fejl ved oprettelse af bruger: " + err.message);
  }
}

module.exports = {
  getAllUsers,
  createUser,
};






