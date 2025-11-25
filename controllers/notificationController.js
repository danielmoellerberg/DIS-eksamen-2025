const twilio = require("twilio");
const { transporter, DEFAULT_FROM, sendBookingConfirmationEmail } = require("../config/mail");

// Twilio opsætning
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Send e-mail notifikation
async function sendEmailNotification(req, res) {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Alle felter (to, subject, text) skal udfyldes" });
  }

  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject,
      text,
    });
    res.status(200).json({ message: "E-mail sendt" });
  } catch (err) {
    res.status(500).json({ error: "Fejl ved afsendelse af e-mail: " + err.message });
  }
}

async function sendBookingConfirmation(req, res) {
  const { email, name, eventTitle, eventDate } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Feltet 'email' er påkrævet" });
  }

  try {
    await sendBookingConfirmationEmail({
      email,
      name,
      eventTitle,
      eventDate,
    });
    res.status(200).json({ message: "Bookingbekræftelse sendt" });
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
      from: process.env.TWILIO_PHONE_NUMBER, // Dit Twilio-telefonnummer
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
