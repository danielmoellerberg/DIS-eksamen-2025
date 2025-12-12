const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: process.env.DB_ENCRYPT !== "false", // Azure kræver typisk TLS
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const pool = new sql.ConnectionPool(config);

// Sikrer at database connection pool er åben og forbundet, opretter forbindelse hvis nødvendigt
async function ensureConnection() {
  try {
    if (!pool.connected) {
      await pool.connect();
      console.log("✅ Database forbindelse etableret");
    }
    return pool;
  } catch (err) {
    console.error("❌ Kunne ikke forbinde til databasen:", err.message);
    throw err;
  }
}

// Initialiser forbindelse
const poolConnect = ensureConnection();

module.exports = {
  sql,
  poolConnect,
  pool,
  ensureConnection,
};


