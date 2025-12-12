const { poolConnect, pool, sql, ensureConnection } = require("../config/db");

// Henter alle oplevelser fra databasen uanset status eller partner
async function getAllExperiences() {
  try {
    await ensureConnection();
    const result = await pool.request().query("SELECT * FROM experiences");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af oplevelser: " + err.message);
  }
}

// Henter alle oplevelser for en specifik affiliate partner sorteret efter oprettelsesdato
async function getExperiencesByPartnerId(partnerId) {
  try {
    await ensureConnection();
    const result = await pool
      .request()
      .input("partnerId", sql.Int, partnerId)
      .query("SELECT * FROM experiences WHERE affiliate_partner_id = @partnerId ORDER BY created_at DESC");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af partner oplevelser: " + err.message);
  }
}

// Henter en specifik oplevelse fra databasen baseret på ID
async function getExperienceById(id) {
  try {
    await ensureConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM experiences WHERE id = @id");
    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af oplevelse: " + err.message);
  }
}

// Opretter en ny oplevelse i databasen med alle nødvendige felter og returnerer oprettet ID
async function createExperience(data) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("title", sql.NVarChar, data.title)
      .input("description", sql.NVarChar, data.description)
      .input("location", sql.NVarChar, data.location)
      .input("duration_hours", sql.Decimal(4, 1), data.duration_hours)
      .input("price_from", sql.Decimal(10, 2), data.price_from)
      .input("category", sql.NVarChar, data.category)
      .input("image_url", sql.NVarChar, data.image_url || null)
      .input("affiliate_partner_id", sql.Int, data.affiliate_partner_id)
      .input("available_dates", sql.NVarChar, data.available_dates || null)
      .input("status", sql.NVarChar, data.status || "active")
      .query(`
        INSERT INTO experiences 
        (title, description, location, duration_hours, price_from, category, image_url, affiliate_partner_id, available_dates, status, created_at, updated_at)
        VALUES 
        (@title, @description, @location, @duration_hours, @price_from, @category, @image_url, @affiliate_partner_id, @available_dates, @status, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() as id;
      `);
    
    const experienceId = result.recordset[0]?.id;
    return {
      id: experienceId,
      rowsAffected: result.rowsAffected[0]
    };
  } catch (err) {
    throw new Error("Fejl ved oprettelse af oplevelse: " + err.message);
  }
}

// Opdaterer en eksisterende oplevelse i databasen med nye data og opdaterer updated_at timestamp
async function updateExperience(id, data) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar, data.title)
      .input("description", sql.NVarChar, data.description)
      .input("location", sql.NVarChar, data.location)
      .input("duration_hours", sql.Decimal(4, 1), data.duration_hours)
      .input("price_from", sql.Decimal(10, 2), data.price_from)
      .input("category", sql.NVarChar, data.category)
      .input("image_url", sql.NVarChar, data.image_url || null)
      .input("available_dates", sql.NVarChar, data.available_dates || null)
      .input("status", sql.NVarChar, data.status || "active")
      .query(`
        UPDATE experiences 
        SET 
          title = @title,
          description = @description,
          location = @location,
          duration_hours = @duration_hours,
          price_from = @price_from,
          category = @category,
          image_url = @image_url,
          available_dates = @available_dates,
          status = @status,
          updated_at = GETDATE()
        WHERE id = @id
      `);
    
    return result.rowsAffected[0];
  } catch (err) {
    throw new Error("Fejl ved opdatering af oplevelse: " + err.message);
  }
}

// Sletter en oplevelse fra databasen baseret på ID
async function deleteExperience(id) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM experiences WHERE id = @id");
    
    return result.rowsAffected[0];
  } catch (err) {
    throw new Error("Fejl ved sletning af oplevelse: " + err.message);
  }
}

module.exports = {
  getAllExperiences,
  getExperiencesByPartnerId,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
};



