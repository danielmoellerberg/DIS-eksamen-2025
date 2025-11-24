const twilio = require("twilio");
const { transporter } = require("../config/mail");

// Twilio opsætning
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.EMAIL_USER;

// Send e-mail notifikation
async function sendEmailNotification(req, res) {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Alle felter (to, subject, text) skal udfyldes" });
  }

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
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

  const subject = "Tak for din booking hos Understory";
  const text = [
    `Hej ${name || "ven"},`,
    "",
    "Tak for din booking hos Understory Marketplace.",
    eventTitle ? `Vi glæder os til at se dig til "${eventTitle}".` : "",
    eventDate ? `Dato: ${eventDate}` : "",
    "",
    "Du modtager mere information snart.",
    "",
    "De bedste hilsner",
    "Team Understory",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject,
      text,
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
