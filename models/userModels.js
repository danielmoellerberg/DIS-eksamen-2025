const { pool, sql, ensureConnection } = require("../config/db");
const bcrypt = require("bcrypt");
const { generatePasswordResetToken, verifyPasswordResetToken } = require("../utils/crypto");

const SALT_ROUNDS = 10; // Antal bcrypt salt rounds (10 er standard)

// Henter alle brugere fra databasen uden password information
async function getAllUsers() {
  try {
    await ensureConnection();
    const result = await pool
      .request()
      .query("SELECT id, name, email, created_at FROM Users");
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af brugere: " + err.message);
  }
}

// Opret en ny bruger med bcrypt-hashet password
async function createUser(data) {
  try {
    await ensureConnection();

    // Tjek om email allerede eksisterer
    // pool.request(): Opretter en ny database request
    // .input(): Parameterized query - sikrer mod SQL injection angreb
    // @email: Placeholder i SQL query (erstattes med værdi fra .input())
    // Parameterized queries: Sikker måde at håndtere user input i SQL
    const existingUser = await pool
      .request()
      .input("email", sql.NVarChar, data.email) // sql.NVarChar: SQL Server datatype (Unicode string)
      .query("SELECT id FROM Users WHERE email = @email"); // @email = placeholder

    // recordset: Array med resultater fra database query
    // .length > 0: Tjekker om der er nogen resultater (email eksisterer allerede)
    if (existingUser.recordset.length > 0) {
      // throw: Kaster en fejl - stopper funktionen og går til catch blok
      throw new Error("Email er allerede registreret");
    }

    // Hash password med bcrypt (hvis password er angivet)
    // bcrypt: Krypteringsalgoritme til passwords - hasher password så det ikke kan dekrypteres
    // SALT_ROUNDS: Antal gange password hashes (højere = mere sikkert men langsommere)
    // Vi gemmer ALDRIG passwords i plaintext - altid hashet!
    let hashedPassword = null;
    if (data.password) {
      // await bcrypt.hash(): Asynkron operation - hasher password
      hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    // INSERT query: Indsætter ny række i Users tabellen
    // SCOPE_IDENTITY(): SQL Server funktion der returnerer ID for den sidst indsatte række
    const result = await pool
      .request()
      .input("name", sql.NVarChar, data.name)
      .input("email", sql.NVarChar, data.email)
      .input("password", sql.NVarChar, hashedPassword) // Gemmer hashet password, ikke plaintext!
      .query(`
        INSERT INTO Users (name, email, password) 
        VALUES (@name, @email, @password);
        SELECT SCOPE_IDENTITY() as id; -- Returnerer det nye ID
      `);

    // result.recordset[0]: Første række fra query resultat
    // Optional chaining (?.): Sikrer at koden ikke crasher hvis recordset er tom
    return {
      id: result.recordset[0]?.id,
      name: data.name,
      email: data.email,
    };
  } catch (err) {
    throw new Error("Fejl ved oprettelse af bruger: " + err.message);
  }
}

// Login bruger (verificerer password med bcrypt)
async function loginUser(email, password) {
  try {
    await ensureConnection();

    // Hent bruger fra database
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    const user = result.recordset[0];

    if (!user) {
      throw new Error("Forkert email eller adgangskode");
    }

    // Tjek om bruger har password (nogle brugere kan være oprettet uden)
    if (!user.password) {
      throw new Error("Denne bruger har ikke et password. Kontakt support.");
    }

    // bcrypt.compare(): Sammenligner plaintext password med hashet password
    // Returnerer true hvis de matcher, false hvis ikke
    // bcrypt hasher automatisk det plaintext password og sammenligner med den gemte hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Forkert email eller adgangskode");
    }

    // Returner bruger uden password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

// Henter en bruger fra databasen baseret på ID uden password information
async function getUserById(id) {
  try {
    await ensureConnection();

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT id, name, email, created_at FROM Users WHERE id = @id");

    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af bruger: " + err.message);
  }
}

// Henter en bruger fra databasen baseret på email uden password information
async function getUserByEmail(email) {
  try {
    await ensureConnection();

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id, name, email, created_at FROM Users WHERE email = @email");

    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af bruger: " + err.message);
  }
}

// Opdater bruger password (med bcrypt hashing)
async function updateUserPassword(id, newPassword) {
  try {
    await ensureConnection();

    // Hash nyt password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("password", sql.NVarChar, hashedPassword)
      .query("UPDATE Users SET password = @password WHERE id = @id");

    return { success: true };
  } catch (err) {
    throw new Error("Fejl ved opdatering af password: " + err.message);
  }
}

// Opret password reset token (bruger crypto modul)
async function createPasswordResetToken(email) {
  try {
    await ensureConnection();

    // Find bruger
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Bruger ikke fundet");
    }

    // Generer token med crypto
    const { token, hashedToken, expiresAt } = generatePasswordResetToken();

    // Gem hashed token i database (vi gemmer ALDRIG den rå token!)
    await pool
      .request()
      .input("userId", sql.Int, user.id)
      .input("hashedToken", sql.NVarChar, hashedToken)
      .input("expiresAt", sql.DateTime, expiresAt)
      .query(`
        UPDATE Users 
        SET reset_token_hash = @hashedToken, 
            reset_token_expires = @expiresAt 
        WHERE id = @userId
      `);

    // Returner den rå token (sendes til bruger via email)
    return {
      token,
      userId: user.id,
      email: user.email,
      expiresAt
    };
  } catch (err) {
    throw new Error("Fejl ved oprettelse af reset token: " + err.message);
  }
}

// Verificer og brug password reset token (bruger crypto modul)
async function resetPasswordWithToken(token, newPassword) {
  try {
    await ensureConnection();

    // Find bruger med dette token
    const result = await pool
      .request()
      .query(`
        SELECT id, reset_token_hash, reset_token_expires 
        FROM Users 
        WHERE reset_token_hash IS NOT NULL
      `);

    // Find den bruger hvis token matcher
    let matchedUser = null;
    for (const user of result.recordset) {
      const verification = verifyPasswordResetToken(
        token,
        user.reset_token_hash,
        user.reset_token_expires
      );
      if (verification.valid) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new Error("Ugyldig eller udløbet token");
    }

    // Hash nyt password med bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Opdater password og fjern reset token
    await pool
      .request()
      .input("id", sql.Int, matchedUser.id)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        UPDATE Users 
        SET password = @password,
            reset_token_hash = NULL,
            reset_token_expires = NULL
        WHERE id = @id
      `);

    return { success: true, userId: matchedUser.id };
  } catch (err) {
    throw new Error("Fejl ved nulstilling af password: " + err.message);
  }
}

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  getUserById,
  getUserByEmail,
  updateUserPassword,
  createPasswordResetToken,
  resetPasswordWithToken,
};
