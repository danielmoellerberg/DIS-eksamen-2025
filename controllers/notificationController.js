const { twilioClient, twilioPhoneNumber, normalizePhoneNumber } = require("../config/twilio");
const { sendBookingConfirmationEmail } = require("../config/mail");
const { getBookingsForReminder, updateReminderSent } = require("../models/bookingModels");
const { createSmsLog } = require("../models/smsLogModel");

// Send e-mail notifikation endpoint (midlertidigt deaktiveret - returnerer 503)
async function sendEmailNotification(req, res) {
  res.status(503).json({ error: "Mail service ikke konfigureret endnu" });
}

// Sender booking bekræftelses email til kunden med booking detaljer
async function sendBookingConfirmation(req, res) {
  const { email, name, eventTitle, eventDate } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Feltet 'email' er påkrævet" });
  }

  try {
    const result = await sendBookingConfirmationEmail({
      email,
      name,
      eventTitle,
      eventDate,
    });
    
    if (result.success) {
      res.status(200).json({ message: "Bookingbekræftelse sendt" });
    } else {
      res.status(503).json({ error: "Mail service ikke konfigureret: " + result.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Kunne ikke sende bookingbekræftelse: " + error.message });
  }
}

// Sender SMS notifikation via Twilio baseret på request body data
async function sendSmsNotification(req, res) {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Alle felter (to, message) skal udfyldes" });
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });
    res.status(200).json({ message: "SMS sendt" });
  } catch (err) {
    res.status(500).json({ error: "Fejl ved afsendelse af SMS: " + err.message });
  }
}

// Sender SMS reminder til en specifik booking via Twilio og logger det i databasen
async function sendBookingReminderSms(booking) {
  try {
    if (!booking.customer_phone) {
      console.log(`⚠️ Ingen telefonnummer for booking ${booking.id}`);
      return { success: false, error: "Ingen telefonnummer" };
    }

    // Normaliser telefonnummer
    const normalizedPhone = normalizePhoneNumber(booking.customer_phone);
    
    // Formatér dato (27. december 2025)
    const bookingDate = formatDate(booking.booking_date);
    
    // Opret SMS besked
    const message = `Hej ${booking.customer_name}! Du har booket ${booking.experience_title} den ${bookingDate}. Kommer du stadig? Svar X for ja, Y for nej. - Understory`;
    
    // Valider Twilio konfiguration
    if (!twilioPhoneNumber) {
      throw new Error("TWILIO_PHONE_NUMBER ikke sat i .env filen");
    }
    
    console.log(`📤 Sender SMS til ${normalizedPhone} fra ${twilioPhoneNumber}`);
    
    // Send SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: normalizedPhone
    });
    
    console.log(`✅ SMS sendt - MessageSid: ${twilioMessage.sid}, Status: ${twilioMessage.status}`);
    
    // Log SMS i database
    await createSmsLog({
      bookingId: booking.id,
      phoneNumber: normalizedPhone,
      messageBody: message,
      direction: "outbound",
      twilioMessageSid: twilioMessage.sid,
      status: "sent"
    });
    
    // Opdater booking - marker at reminder er sendt
    await updateReminderSent(booking.id);
    
    console.log(`✅ SMS reminder sendt til booking ${booking.id} (${normalizedPhone})`);
    
    return {
      success: true,
      messageSid: twilioMessage.sid,
      bookingId: booking.id
    };
  } catch (error) {
    console.error(`❌ Fejl ved afsendelse af SMS reminder for booking ${booking.id}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Sender SMS reminders til alle bookinger der skal have reminder i morgen (køres af cron job)
async function sendRemindersForTomorrow() {
  try {
    console.log("🔔 Starter reminder-proces for i morgen...");
    
    // Hent alle bookinger der skal have reminder
    const bookings = await getBookingsForReminder();
    
    if (bookings.length === 0) {
      console.log("ℹ️ Ingen bookinger der skal have reminder i morgen");
      return { success: true, sent: 0, total: 0 };
    }
    
    console.log(`📋 Fundet ${bookings.length} booking(er) der skal have reminder`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Send reminder til hver booking
    for (const booking of bookings) {
      const result = await sendBookingReminderSms(booking);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`✅ Reminder-proces færdig: ${successCount} sendt, ${errorCount} fejl`);
    
    return {
      success: true,
      sent: successCount,
      errors: errorCount,
      total: bookings.length
    };
  } catch (error) {
    console.error("❌ Fejl i sendRemindersForTomorrow:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test endpoint der manuelt trigger reminder-proces for at teste SMS reminder funktionalitet
async function testSendReminders(req, res) {
  try {
    console.log("🧪 Test: Manuelt trigger af reminder-proces...");
    const result = await sendRemindersForTomorrow();
    
    if (result.success) {
      res.status(200).json({
        message: "Reminder-proces kørt",
        result: result
      });
    } else {
      res.status(500).json({
        error: "Fejl i reminder-proces",
        details: result
      });
    }
  } catch (error) {
    console.error("❌ Fejl i test endpoint:", error);
    res.status(500).json({
      error: "Fejl ved test af reminder-proces",
      message: error.message
    });
  }
}

// Formaterer en dato til dansk format (f.eks. "27. december 2025")
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
  sendEmailNotification,
  sendBookingConfirmation,
  sendSmsNotification,
  sendBookingReminderSms,
  sendRemindersForTomorrow,
  testSendReminders,
};
