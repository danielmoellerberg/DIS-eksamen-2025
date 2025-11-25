const twilio = require("twilio");
const { sendBookingConfirmationEmail } = require("../config/mail");

// Twilio opsætning
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send e-mail notifikation (midlertidigt deaktiveret)
async function sendEmailNotification(req, res) {
  res.status(503).json({ error: "Mail service ikke konfigureret endnu" });
}

async function sendBookingConfirmation(req, res) {
  const { email, name, eventTitle, eventDate } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Feltet 'email' er påkrævet" });
  }

  try {
    const result = await sendBookingConfirmationEmail({
      email,
      name,
      eventTitle,
      eventDate,
    });
    
    if (result.success) {
      res.status(200).json({ message: "Bookingbekræftelse sendt" });
    } else {
      res.status(503).json({ error: "Mail service ikke konfigureret: " + result.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Kunne ikke sende bookingbekræftelse: " + error.message });
  }
}

// Send SMS notifikation
async function sendSmsNotification(req, res) {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Alle felter (to, message) skal udfyldes" });
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    res.status(200).json({ message: "SMS sendt" });
  } catch (err) {
    res.status(500).json({ error: "Fejl ved afsendelse af SMS: " + err.message });
  }
}

module.exports = {
  sendEmailNotification,
  sendBookingConfirmation,
  sendSmsNotification,
};
