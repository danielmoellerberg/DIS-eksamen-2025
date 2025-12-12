require("dotenv").config();
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN || "",
});

const sentFrom = new Sender(
  process.env.MAILERSEND_FROM_EMAIL || "booking@projectdis.app",
  process.env.MAILERSEND_FROM_NAME || "Understory Marketplace"
);

// Sender booking bekræftelses email til kunden via MailerSend med booking detaljer
async function sendBookingConfirmationEmail({ email, name, eventTitle, eventDate }) {
  if (!email) {
    throw new Error("Manglende e-mailadresse");
  }

  if (!process.env.MAILERSEND_API_TOKEN) {
    console.warn("⚠️ MAILERSEND_API_TOKEN ikke sat – mail sendes ikke");
    return { success: false, error: "API token mangler" };
  }

  const recipients = [new Recipient(email, name || "")];

  const subject = "Tak for din booking hos Understory";
  const textContent = [
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

  const htmlContent = `
    <h2>Tak for din booking!</h2>
    <p>Hej ${name || "ven"},</p>
    <p>Tak for din booking hos Understory Marketplace.</p>
    ${eventTitle ? `<p>Vi glæder os til at se dig til <strong>${eventTitle}</strong>.</p>` : ""}
    ${eventDate ? `<p><strong>Dato:</strong> ${eventDate}</p>` : ""}
    <p>Du modtager mere information i god tid før oplevelsen.</p>
    <p>De bedste hilsner,<br>Team Understory</p>
  `;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setText(textContent)
    .setHtml(htmlContent);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("📧 MailerSend: Bookingbekræftelse sendt til", email);
    return { success: true, response };
  } catch (error) {
    console.error("❌ MailerSend fejl:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmationEmail,
};
