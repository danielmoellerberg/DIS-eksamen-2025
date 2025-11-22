const sql = require("mssql");

// Hent alle oplevelser
async function getAllExperiences() {
  try {
    const pool = await sql.connect(process.env.DB_CONNECTION);
    const result = await pool.request().query("SELECT * FROM Experiences");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af oplevelser: " + err.message);
  }
}

// Opret en ny oplevelse
async function createExperience(data) {
  try {
    const pool = await sql.connect(process.env.DB_CONNECTION);
    const result = await pool.request()
      .input("name", sql.NVarChar, data.name)
      .input("description", sql.NVarChar, data.description)
      .input("price", sql.Decimal, data.price)
      .query(
        "INSERT INTO Experiences (name, description, price) VALUES (@name, @description, @price)"
      );
    return result.rowsAffected;
  } catch (err) {
    throw new Error("Fejl ved oprettelse af oplevelse: " + err.message);
  }
}

module.exports = {
  getAllExperiences,
  createExperience,
};



