const express = require("express");
const router = express.Router();
const twilioWebhookController = require("../controllers/twilioWebhookController");

// Webhook endpoint for indgående SMS fra Twilio
// Twilio sender POST requests til denne endpoint når de modtager SMS
router.post("/webhook", twilioWebhookController.handleIncomingSms);

module.exports = router;

