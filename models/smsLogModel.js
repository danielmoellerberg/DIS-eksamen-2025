const { pool, sql, ensureConnection } = require("../config/db");

// Opret SMS log entry
async function createSmsLog(logData) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("bookingId", sql.Int, logData.bookingId || null)
      .input("phoneNumber", sql.NVarChar, logData.phoneNumber)
      .input("messageBody", sql.NVarChar, logData.messageBody)
      .input("direction", sql.NVarChar, logData.direction) // 'outbound' eller 'inbound'
      .input("twilioMessageSid", sql.NVarChar, logData.twilioMessageSid || null)
      .input("status", sql.NVarChar, logData.status || null)
      .query(`
        INSERT INTO sms_logs 
        (booking_id, phone_number, message_body, direction, twilio_message_sid, status)
        VALUES 
        (@bookingId, @phoneNumber, @messageBody, @direction, @twilioMessageSid, @status);
        SELECT SCOPE_IDENTITY() as id;
      `);
    
    return {
      id: result.recordset[0]?.id,
      success: true
    };
  } catch (err) {
    console.error("❌ Fejl ved oprettelse af SMS log:", err);
    throw new Error("Fejl ved oprettelse af SMS log: " + err.message);
  }
}

// Hent SMS logs for en booking
async function getSmsLogsByBookingId(bookingId) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT * FROM sms_logs 
        WHERE booking_id = @bookingId 
        ORDER BY created_at DESC
      `);
    
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af SMS logs: " + err.message);
  }
}

// Hent SMS logs for et telefonnummer
async function getSmsLogsByPhoneNumber(phoneNumber) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("phoneNumber", sql.NVarChar, phoneNumber)
      .query(`
        SELECT * FROM sms_logs 
        WHERE phone_number = @phoneNumber 
        ORDER BY created_at DESC
      `);
    
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af SMS logs: " + err.message);
  }
}

module.exports = {
  createSmsLog,
  getSmsLogsByBookingId,
  getSmsLogsByPhoneNumber,
};

