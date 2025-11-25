const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const DEFAULT_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;

transporter.verify((error) => {
  if (error) {
    console.error("❌ Nodemailer kunne ikke forbinde:", error.message);
  } else {
    console.log("📬 Nodemailer er klar til at sende mails");
  }
});

async function sendBookingConfirmationEmail({ email, name, eventTitle, eventDate }) {
  if (!email) {
    throw new Error("Manglende e-mailadresse");
  }

  const subject = "Tak for din booking hos Understory";
  const text = [
    `Hej ${name || "ven"},`,
    "",
    "Tak for din booking hos Understory Marketplace.",
    eventTitle ? `Vi glæder os til at se dig til "${eventTitle}".` : "",
    eventDate ? `Dato: ${eventDate}` : "",
    "",
    "Du modtager mere information i god tid før oplevelsen.",
    "",
    "De bedste hilsner",
    "Team Understory",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: DEFAULT_FROM,
    to: email,
    subject,
    text,
  });
}

module.exports = {
  transporter,
  DEFAULT_FROM,
  sendBookingConfirmationEmail,
};
