/**
 * Crypto Utilities til Understory Marketplace
 * 
 * Praktiske kryptografiske funktioner der bruges i projektet:
 * - Token generation (password reset, email verification)
 * - Data hashing (integritetskontrol)
 * - Webhook signatur validering
 */

const crypto = require("crypto");

/**
 * Generer kryptografisk sikker tilfældig token
 * Bruges til: Password reset, email verification, API tokens
 * 
 * @param {number} length - Antal bytes (default: 32 = 64 hex chars)
 * @returns {string} - Token som hex string
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generer kort verification kode (6 cifre)
 * Bruges til: SMS verification, 2FA
 * 
 * @returns {string} - 6-cifret kode
 */
function generateVerificationCode() {
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0) % 1000000;
  return number.toString().padStart(6, "0");
}

/**
 * Hash data med SHA-256
 * Bruges til: Data integritet, checksums
 * 
 * @param {string} data - Data der skal hashes
 * @returns {string} - Hash som hex string
 */
function hashSHA256(data) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

/**
 * Generer HMAC signatur
 * Bruges til: API request signering, webhook validering
 * 
 * @param {string} data - Data der skal signeres
 * @param {string} secret - Hemmelig nøgle
 * @returns {string} - HMAC signatur som hex string
 */
function createHmacSignature(data, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
}

/**
 * Verificer HMAC signatur (timing-safe)
 * Bruges til: Webhook validering (Twilio, Stripe)
 * 
 * @param {string} data - Original data
 * @param {string} signature - Modtaget signatur
 * @param {string} secret - Hemmelig nøgle
 * @returns {boolean} - true hvis signatur er gyldig
 */
function verifyHmacSignature(data, signature, secret) {
  const expectedSignature = createHmacSignature(data, secret);
  
  // Brug timingSafeEqual for at forhindre timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (err) {
    // Hvis buffer længder ikke matcher, er signaturen ugyldig
    return false;
  }
}

/**
 * Generer password reset token med udløbstid
 * 
 * @param {number} expiresInMs - Udløbstid i millisekunder (default: 1 time)
 * @returns {{token: string, hashedToken: string, expiresAt: Date}}
 */
function generatePasswordResetToken(expiresInMs = 3600000) {
  const token = generateToken(32);
  const hashedToken = hashSHA256(token); // Gem kun hash i database
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  return {
    token,        // Send til bruger via email
    hashedToken,  // Gem i database
    expiresAt     // Gem i database
  };
}

/**
 * Verificer password reset token
 * 
 * @param {string} token - Token fra bruger
 * @param {string} storedHash - Hash gemt i database
 * @param {Date} expiresAt - Udløbstidspunkt
 * @returns {{valid: boolean, reason?: string}}
 */
function verifyPasswordResetToken(token, storedHash, expiresAt) {
  // Tjek om token er udløbet
  if (new Date() > new Date(expiresAt)) {
    return { valid: false, reason: "Token er udløbet" };
  }
  
  // Verificer token hash
  const hashedInput = hashSHA256(token);
  if (hashedInput !== storedHash) {
    return { valid: false, reason: "Ugyldig token" };
  }
  
  return { valid: true };
}

/**
 * Krypter sensitiv data (AES-256-CBC)
 * Bruges til: Kryptering af følsomme data i database
 * 
 * @param {string} plaintext - Data der skal krypteres
 * @param {string} key - 32-byte nøgle (hex string)
 * @returns {string} - Krypteret data som "iv:encrypted"
 */
function encryptData(plaintext, key) {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Dekrypter sensitiv data (AES-256-CBC)
 * 
 * @param {string} encryptedData - Krypteret data som "iv:encrypted"
 * @param {string} key - 32-byte nøgle (hex string)
 * @returns {string} - Dekrypteret data
 */
function decryptData(encryptedData, key) {
  const keyBuffer = Buffer.from(key, "hex");
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Generer sikker session secret
 * Bruges til: express-session konfiguration
 * 
 * @returns {string} - 64-char hex string
 */
function generateSessionSecret() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  generateToken,
  generateVerificationCode,
  hashSHA256,
  createHmacSignature,
  verifyHmacSignature,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  encryptData,
  decryptData,
  generateSessionSecret,
};

