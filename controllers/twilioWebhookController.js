const { twilioClient, twilioPhoneNumber, normalizePhoneNumber } = require("../config/twilio");
const { findBookingByPhoneNumber, updateReminderResponse, updateBookingStatus } = require("../models/bookingModels");
const { createSmsLog } = require("../models/smsLogModel");

// Håndter indgående SMS fra Twilio webhook
async function handleIncomingSms(req, res) {
  try {
    // Twilio sender data i req.body
    const from = req.body.From; // Telefonnummer der sender
    const body = req.body.Body ? req.body.Body.trim().toUpperCase() : ""; // SMS indhold
    const messageSid = req.body.MessageSid; // Twilio Message SID
    
    console.log(`📱 Modtaget SMS fra ${from}: "${body}"`);
    
    // Normaliser telefonnummer
    const normalizedPhone = normalizePhoneNumber(from);
    
    // Log indgående SMS
    await createSmsLog({
      bookingId: null, // Vi finder booking senere
      phoneNumber: normalizedPhone,
      messageBody: body,
      direction: "inbound",
      twilioMessageSid: messageSid,
      status: "received"
    });
    
    // Find seneste aktive booking for dette telefonnummer
    const booking = await findBookingByPhoneNumber(normalizedPhone);
    
    if (!booking) {
      console.log(`⚠️ Ingen booking fundet for telefonnummer: ${normalizedPhone}`);
      
      // Send fejlbesked hvis ingen booking findes
      await twilioClient.messages.create({
        body: "Beklager, vi kunne ikke finde din booking. Kontakt venligst support. - Understory",
        from: twilioPhoneNumber,
        to: from
      });
      
      return res.status(200).send("OK"); // Twilio forventer 200 OK
    }
    
    // Tjek om booking allerede har fået et svar
    if (booking.reminder_response) {
      console.log(`ℹ️ Booking ${booking.id} har allerede svaret: ${booking.reminder_response}`);
      return res.status(200).send("OK");
    }
    
    // Parse svar (X for ja, Y for nej)
    let response = null;
    let responseMessage = "";
    
    if (body === "X") {
      response = "yes";
      responseMessage = `Tak for din bekræftelse! Vi glæder os til at se dig til "${booking.experience_title}" den ${formatDate(booking.booking_date)}. - Understory`;
    } else if (body === "Y") {
      response = "no";
      responseMessage = "Tak for din besked. Din booking er blevet annulleret. Hvis du har spørgsmål, kontakt venligst support. - Understory";
    } else {
      // Ugyldigt svar - send fejlbesked
      responseMessage = "Beklager, vi forstod ikke dit svar. Svar venligst X for ja eller Y for nej. - Understory";
    }
    
    // Hvis vi har et gyldigt svar, opdater booking
    if (response) {
      await updateReminderResponse(booking.id, response);
      
      // Hvis nej, annuller booking
      if (response === "no") {
        await updateBookingStatus(booking.id, "cancelled");
        console.log(`✅ Booking ${booking.id} annulleret baseret på kundens svar`);
      }
      
      console.log(`✅ Booking ${booking.id} opdateret med svar: ${response}`);
    }
    
    // Send svar til kunden
    const sentMessage = await twilioClient.messages.create({
      body: responseMessage,
      from: twilioPhoneNumber,
      to: from
    });
    
    // Log udgående SMS (svar til kunden)
    await createSmsLog({
      bookingId: booking.id,
      phoneNumber: normalizedPhone,
      messageBody: responseMessage,
      direction: "outbound",
      twilioMessageSid: sentMessage.sid,
      status: "sent"
    });
    
    // Opdater log for indgående SMS med booking_id
    // (Vi kan ikke opdatere eksisterende log, men det er ok - vi har allerede logget den)
    
    return res.status(200).send("OK"); // Twilio forventer 200 OK
  } catch (error) {
    console.error("❌ Fejl ved håndtering af indgående SMS:", error);
    // Returner stadig 200 OK til Twilio for at undgå retries
    return res.status(200).send("OK");
  }
}

// Hjælpefunktion til at formatere dato (27. december 2025)
function formatDate(date) {
  if (!date) return "";
  
  const d = new Date(date);
  const day = d.getDate();
  const monthNames = [
    "januar", "februar", "marts", "april", "maj", "juni",
    "juli", "august", "september", "oktober", "november", "december"
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day}. ${month} ${year}`;
}

module.exports = {
  handleIncomingSms,
};

