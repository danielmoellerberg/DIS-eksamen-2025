require("dotenv").config();
const twilio = require("twilio");

// Valider environment variabler
if (!process.env.TWILIO_ACCOUNT_SID) {
  console.error("❌ TWILIO_ACCOUNT_SID mangler i .env filen!");
}
if (!process.env.TWILIO_AUTH_TOKEN) {
  console.error("❌ TWILIO_AUTH_TOKEN mangler i .env filen!");
}
if (!process.env.TWILIO_PHONE_NUMBER) {
  console.error("❌ TWILIO_PHONE_NUMBER mangler i .env filen!");
}

// Initialiser Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Twilio telefonnummer (fra .env)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Test Twilio connection ved opstart
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  console.log("✅ Twilio client initialiseret");
  console.log(`📱 Twilio telefonnummer: ${twilioPhoneNumber || "IKKE SAT"}`);
} else {
  console.warn("⚠️ Twilio ikke fuldt konfigureret - tjek .env filen");
}

// Funktion til at normalisere telefonnummer (sikrer internationalt format)
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  
  // Fjern alle mellemrum og specialtegn
  let normalized = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
  
  // Hvis nummeret starter med 0, erstatt med +45
  if (normalized.startsWith("0")) {
    normalized = "+45" + normalized.substring(1);
  }
  // Hvis nummeret ikke starter med +, tilføj +45
  else if (!normalized.startsWith("+")) {
    normalized = "+45" + normalized;
  }
  
  return normalized;
}

module.exports = {
  twilioClient,
  twilioPhoneNumber,
  normalizePhoneNumber,
};

