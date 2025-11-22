const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Send e-mail notifikation
router.post("/email", notificationController.sendEmailNotification);

// Send SMS notifikation
router.post("/sms", notificationController.sendSmsNotification);

module.exports = router;
