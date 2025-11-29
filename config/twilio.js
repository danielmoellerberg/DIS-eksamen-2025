require("dotenv").config();
const twilio = require("twilio");

// Initialiser Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Twilio telefonnummer (fra .env)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

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

