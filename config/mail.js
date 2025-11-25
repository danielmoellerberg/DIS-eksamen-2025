require("dotenv").config();

// Placeholder for mail service (MailerSend kommer snart)
// Alle mail-funktioner er midlertidigt deaktiveret

async function sendBookingConfirmationEmail({ email, name, eventTitle, eventDate }) {
  console.log("📧 Mail-service ikke konfigureret endnu. Ville have sendt til:", email);
  return { success: false, error: "Mail service ikke konfigureret" };
}

module.exports = {
  sendBookingConfirmationEmail,
};
