const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Nodemailer opsætning
const transporter = nodemailer.createTransport({
  service: "gmail", // Eller en anden e-mail-udbyder
  auth: {
    user: process.env.EMAIL_USER, // Din e-mail
    pass: process.env.EMAIL_PASS, // Din e-mail-adgangskode
  },
});

// Twilio opsætning
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send e-mail notifikation
async function sendEmailNotification(req, res) {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Alle felter (to, subject, text) skal udfyldes" });
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "E-mail sendt" });
  } catch (err) {
    res.status(500).json({ error: "Fejl ved afsendelse af e-mail: " + err.message });
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
  sendSmsNotification,
};
