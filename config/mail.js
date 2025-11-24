const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Nodemailer kunne ikke forbinde:", error.message);
  } else {
    console.log("📬 Nodemailer er klar til at sende mails");
  }
});

module.exports = {
  transporter,
};
