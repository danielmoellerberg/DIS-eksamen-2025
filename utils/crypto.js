/**
 * Crypto Utilities til Understory Marketplace
 * 
 * Praktiske kryptografiske funktioner der bruges i projektet:
 * - Token generation (password reset, email verification)
 * - Data hashing (integritetskontrol)
 * - Webhook signatur validering
 */

const crypto = require("crypto");

// Genererer en kryptografisk sikker tilfældig token med angivet længde og returnerer den som hex string
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

// Genererer en 6-cifret verifikationskode til SMS verification eller 2FA
function generateVerificationCode() {
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0) % 1000000;
  return number.toString().padStart(6, "0");
}

// Hasher data med SHA-256 algoritme og returnerer hash som hex string til integritetskontrol
function hashSHA256(data) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

// Genererer HMAC-SHA256 signatur for data med hemmelig nøgle til webhook validering eller API signering
function createHmacSignature(data, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
}

// Verificerer HMAC signatur med timing-safe comparison for at forhindre timing attacks ved webhook validering
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

// Genererer password reset token med udløbstid og returnerer både rå token og hashed token til database
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

// Verificerer password reset token ved at tjekke udløbstid og sammenligne hash med gemt hash i database
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

// Krypterer sensitiv data med AES-256-CBC algoritme og returnerer krypteret data med IV som "iv:encrypted"
function encryptData(plaintext, key) {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
}

// Dekrypterer data der er krypteret med AES-256-CBC ved at ekstrahere IV og dekryptere med nøgle
function decryptData(encryptedData, key) {
  const keyBuffer = Buffer.from(key, "hex");
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

// Genererer en sikker session secret som 64-char hex string til express-session konfiguration
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

