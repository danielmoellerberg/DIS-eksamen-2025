const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// ENDPOINT: POST /api/notifications/email
// Beskrivelse: Sender en generel email notifikation (midlertidigt deaktiveret)
// Beskyttet: Nej (offentlig)
router.post("/email", notificationController.sendEmailNotification);

// ENDPOINT: POST /api/notifications/email/booking-confirmation
// Beskrivelse: Sender booking bekræftelses email til kunden med booking detaljer
// Beskyttet: Nej (offentlig)
router.post("/email/booking-confirmation", notificationController.sendBookingConfirmation);

// ENDPOINT: POST /api/notifications/sms
// Beskrivelse: Sender en SMS notifikation via Twilio
// Beskyttet: Nej (offentlig)
router.post("/sms", notificationController.sendSmsNotification);

// ENDPOINT: POST /api/notifications/test/reminders
// Beskrivelse: Manuelt trigger SMS reminder-proces for alle bookinger i morgen (kun til test!)
// Beskyttet: Nej (offentlig - kun til test)
router.post("/test/reminders", notificationController.testSendReminders);

module.exports = router;
