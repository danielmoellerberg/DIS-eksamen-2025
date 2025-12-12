const { poolConnect, pool, sql, ensureConnection } = require("../config/db");
const bcrypt = require("bcrypt");

// Registrerer en ny affiliate partner i databasen med hashet password og validerer email unikhed
async function registerAffiliatePartner(data) {
  try {
    await ensureConnection();
    
    // Tjek om email allerede eksisterer
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar, data.email)
      .query("SELECT id FROM affiliate_partners WHERE email = @email");
    
    if (existingUser.recordset.length > 0) {
      throw new Error("Email er allerede registreret");
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Indsæt ny affiliate partner
    const result = await pool
      .request()
      .input("name", sql.NVarChar, data.name)
      .input("email", sql.NVarChar, data.email)
      .input("password_hash", sql.NVarChar, hashedPassword)
      .input("website_url", sql.NVarChar, data.website_url || null)
      .query(`
        INSERT INTO affiliate_partners (name, email, password_hash, website_url, created_at)
        VALUES (@name, @email, @password_hash, @website_url, GETDATE());
        SELECT SCOPE_IDENTITY() as id;
      `);
    
    const partnerId = result.recordset[0]?.id;
    
    return {
      id: partnerId,
      name: data.name,
      email: data.email,
      website_url: data.website_url
    };
  } catch (err) {
    throw new Error("Fejl ved registrering: " + err.message);
  }
}

// Verificerer affiliate partner login ved at sammenligne password med bcrypt hash i databasen
async function loginAffiliatePartner(email, password) {
  try {
    await ensureConnection();
    
    // Hent bruger fra database
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM affiliate_partners WHERE email = @email");
    
    const partner = result.recordset[0];
    
    if (!partner) {
      throw new Error("Forkert email eller adgangskode");
    }
    
    // Verificer password
    const isPasswordValid = await bcrypt.compare(password, partner.password_hash);
    
    if (!isPasswordValid) {
      throw new Error("Forkert email eller adgangskode");
    }
    
    // Returner bruger uden password
    return {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      website_url: partner.website_url,
      logo_url: partner.logo_url
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

// Henter en affiliate partner fra databasen baseret på ID uden password information
async function getAffiliatePartnerById(id) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT id, name, email, website_url, logo_url, created_at FROM affiliate_partners WHERE id = @id");
    
    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af affiliate partner: " + err.message);
  }
}

// Henter en affiliate partner fra databasen baseret på email uden password information
async function getAffiliatePartnerByEmail(email) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id, name, email, website_url, logo_url, created_at FROM affiliate_partners WHERE email = @email");
    
    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af affiliate partner: " + err.message);
  }
}

module.exports = {
  registerAffiliatePartner,
  loginAffiliatePartner,
  getAffiliatePartnerById,
  getAffiliatePartnerByEmail,
};

