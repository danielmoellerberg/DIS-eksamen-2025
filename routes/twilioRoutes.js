const express = require("express");
const router = express.Router();
const twilioWebhookController = require("../controllers/twilioWebhookController");
const { twilioClient, twilioPhoneNumber, normalizePhoneNumber } = require("../config/twilio");

// ENDPOINT: POST /api/twilio/webhook
// Beskrivelse: Modtager indgående SMS fra Twilio, parser kundens svar (X/Y) og opdaterer booking status
// Beskyttet: Nej (webhook - Twilio sender requests hertil)
// VIGTIGT: Skal være før rate limiting middleware
router.post("/webhook", twilioWebhookController.handleIncomingSms);

// ENDPOINT: POST /api/twilio/test
// Beskrivelse: Sender en test SMS via Twilio for at verificere Twilio konfiguration
// Beskyttet: Nej (offentlig - kun til test)
router.post("/test", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber er påkrævet" });
    }
    
    if (!twilioPhoneNumber) {
      return res.status(500).json({ error: "TWILIO_PHONE_NUMBER ikke sat i .env" });
    }
    
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const testMessage = message || "Test SMS fra Understory Marketplace - Twilio virker! 🎉";
    
    console.log(`🧪 Test SMS: Sender til ${normalizedPhone} fra ${twilioPhoneNumber}`);
    
    const twilioMessage = await twilioClient.messages.create({
      body: testMessage,
      from: twilioPhoneNumber,
      to: normalizedPhone
    });
    
    res.status(200).json({
      success: true,
      message: "SMS sendt",
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      to: normalizedPhone,
      from: twilioPhoneNumber
    });
  } catch (error) {
    console.error("❌ Fejl ved test SMS:", error);
    res.status(500).json({
      error: "Fejl ved afsendelse af SMS",
      details: error.message
    });
  }
});

module.exports = router;

