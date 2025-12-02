const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Send e-mail notifikation
router.post("/email", notificationController.sendEmailNotification);

// Send booking-bekræftelse
router.post("/email/booking-confirmation", notificationController.sendBookingConfirmation);

// Send SMS notifikation
router.post("/sms", notificationController.sendSmsNotification);

// Test endpoint: Manuelt trigger reminder-proces (kun til test!)
router.post("/test/reminders", notificationController.testSendReminders);

module.exports = router;
