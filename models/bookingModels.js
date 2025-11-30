const { poolConnect, pool, sql, ensureConnection } = require("../config/db");

// Hent en oplevelse efter ID
async function getExperienceById(id) {
  try {
    // Sikr at forbindelsen er åben
    await ensureConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM experiences WHERE id = @id");
    
    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af oplevelse: " + err.message);
  }
}

// Tjek om en dato er tilgængelig (tjekker antal bookinger på den dato)
async function checkDateAvailability(experienceId, date) {
  try {
    // Sikr at forbindelsen er åben
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("experienceId", sql.Int, experienceId)
      .input("date", sql.Date, date)
      .query(`
        SELECT COUNT(*) as bookingCount 
        FROM bookings 
        WHERE experience_id = @experienceId 
        AND booking_date = @date 
        AND status != 'cancelled'
      `);
    
    const bookingCount = result.recordset[0].bookingCount;
    // Antager maks 10 deltagere per dato (kan justeres)
    const maxParticipants = 10;
    return {
      available: bookingCount < maxParticipants,
      bookedCount: bookingCount,
      remainingSpots: maxParticipants - bookingCount
    };
  } catch (err) {
    console.error("Fejl i checkDateAvailability:", err);
    throw new Error("Fejl ved tjek af dato tilgængelighed: " + err.message);
  }
}

// Hent tilgængelige datoer for en oplevelse (fra i dag og 60 dage frem)
async function getAvailableDates(experienceId) {
  try {
    // Sikr at forbindelsen er åben
    await ensureConnection();
    // Start fra i dag (eller 1. december 2025 hvis det er senere)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const decemberStart = new Date('2025-12-01');
    decemberStart.setHours(0, 0, 0, 0);
    
    // Brug den seneste dato (enten i dag eller 1. december 2025)
    const startDate = today > decemberStart ? today : decemberStart;
    
    const futureDate = new Date();
    futureDate.setDate(startDate.getDate() + 60);
    
    // Hent alle bookinger fra 1. december 2025
    const result = await pool
      .request()
      .input("experienceId", sql.Int, experienceId)
      .input("startDate", sql.Date, startDate)
      .input("futureDate", sql.Date, futureDate)
      .query(`
        SELECT 
          booking_date,
          COUNT(*) as bookingCount,
          SUM(number_of_participants) as totalParticipants
        FROM bookings 
        WHERE experience_id = @experienceId 
        AND booking_date >= @startDate 
        AND booking_date <= @futureDate
        AND status != 'cancelled'
        GROUP BY booking_date
      `);
    
    const bookingsByDate = {};
    result.recordset.forEach(row => {
      bookingsByDate[row.booking_date.toISOString().split('T')[0]] = {
        bookingCount: row.bookingCount,
        totalParticipants: row.totalParticipants
      };
    });
    
    // Datoer der skal have "few seats left" (5., 10., 15., 20., 25. i hver måned)
    // Generer few seats dates for de næste 60 dage
    const fewSeatsDates = [];
    for (let d = new Date(startDate); d <= futureDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDate();
      if (day === 5 || day === 10 || day === 15 || day === 20 || day === 25) {
        fewSeatsDates.push(d.toISOString().split('T')[0]);
      }
    }
    
    // Generer alle datoer i perioden og tjek tilgængelighed
    const availableDates = [];
    const maxParticipants = 10; // Maks antal deltagere per dato
    
    for (let d = new Date(startDate); d <= futureDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const booking = bookingsByDate[dateStr];
      const bookedCount = booking ? booking.totalParticipants : 0;
      const remainingSpots = maxParticipants - bookedCount;
      
      // Tjek om datoen er i fewSeatsDates eller har 3 eller færre pladser
      const isFewSeatsDate = fewSeatsDates.includes(dateStr);
      const hasFewSpots = remainingSpots <= 3;
      
      if (remainingSpots > 0) {
        availableDates.push({
          date: dateStr,
          available: true,
          remainingSpots: remainingSpots,
          fewSpotsLeft: isFewSeatsDate || hasFewSpots
        });
      }
    }
    
    return availableDates;
  } catch (err) {
    throw new Error("Fejl ved hentning af tilgængelige datoer: " + err.message);
  }
}

// Opret en ny booking
async function createBooking(bookingData) {
  try {
    // Sikr at forbindelsen er åben
    await ensureConnection();
    
    console.log("Indsætter booking i database med data:", bookingData);
    
    const result = await pool
      .request()
      .input("experienceId", sql.Int, bookingData.experienceId)
      .input("bookingDate", sql.Date, bookingData.bookingDate)
      .input("bookingTime", sql.Time, bookingData.bookingTime || null)
      .input("customerName", sql.NVarChar, bookingData.customerName)
      .input("customerEmail", sql.NVarChar, bookingData.customerEmail)
      .input("customerPhone", sql.NVarChar, bookingData.customerPhone || null)
      .input("numberOfParticipants", sql.Int, bookingData.numberOfParticipants)
      .input("totalPrice", sql.Decimal(10, 2), bookingData.totalPrice)
      .input("status", sql.NVarChar, bookingData.status || "pending")
      .query(`
        INSERT INTO bookings 
        (experience_id, booking_date, booking_time, customer_name, customer_email, customer_phone, number_of_participants, total_price, status)
        VALUES 
        (@experienceId, @bookingDate, @bookingTime, @customerName, @customerEmail, @customerPhone, @numberOfParticipants, @totalPrice, @status);
        SELECT SCOPE_IDENTITY() as id;
      `);
    
    const bookingId = result.recordset[0]?.id;
    const rowsAffected = result.rowsAffected[0];
    
    if (!bookingId) {
      throw new Error("Booking ID blev ikke returneret fra databasen");
    }
    
    console.log(`✅ Booking gemt i database - ID: ${bookingId}, Rows affected: ${rowsAffected}`);
    
    return {
      id: bookingId,
      rowsAffected: rowsAffected
    };
  } catch (err) {
    console.error("❌ Database fejl ved oprettelse af booking:", err);
    throw new Error("Fejl ved oprettelse af booking: " + err.message);
  }
}

// Hent booking efter ID
async function getBookingById(bookingId) {
  try {
    await ensureConnection();
    const result = await pool
      .request()
      .input("bookingId", sql.Int, bookingId)
      .query(`
        SELECT b.*, e.title as experience_title
        FROM bookings b
        INNER JOIN experiences e ON b.experience_id = e.id
        WHERE b.id = @bookingId
      `);
    
    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved hentning af booking: " + err.message);
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    await ensureConnection();
    await pool
      .request()
      .input("bookingId", sql.Int, bookingId)
      .input("status", sql.NVarChar, status)
      .query("UPDATE bookings SET status = @status WHERE id = @bookingId");
  } catch (err) {
    throw new Error("Fejl ved opdatering af bookingstatus: " + err.message);
  }
}

// Hent bookinger der skal have SMS reminder (i morgen, ikke sendt endnu, confirmed)
async function getBookingsForReminder() {
  try {
    await ensureConnection();
    
    // Find bookinger hvor booking_date = i morgen
    const result = await pool
      .request()
      .query(`
        SELECT 
          b.*,
          e.title as experience_title
        FROM bookings b
        INNER JOIN experiences e ON b.experience_id = e.id
        WHERE b.booking_date = DATEADD(day, 1, CAST(GETDATE() AS DATE))
          AND b.reminder_sent = 0
          AND b.status = 'confirmed'
          AND b.customer_phone IS NOT NULL
        ORDER BY b.created_at ASC
      `);
    
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af bookinger til reminder: " + err.message);
  }
}

// Opdater reminder_sent til 1 (SMS er sendt)
async function updateReminderSent(bookingId) {
  try {
    await ensureConnection();
    await pool
      .request()
      .input("bookingId", sql.Int, bookingId)
      .query("UPDATE bookings SET reminder_sent = 1 WHERE id = @bookingId");
  } catch (err) {
    throw new Error("Fejl ved opdatering af reminder_sent: " + err.message);
  }
}

// Opdater reminder_response og reminder_response_date
async function updateReminderResponse(bookingId, response) {
  try {
    await ensureConnection();
    await pool
      .request()
      .input("bookingId", sql.Int, bookingId)
      .input("response", sql.NVarChar, response) // 'yes' eller 'no'
      .query(`
        UPDATE bookings 
        SET reminder_response = @response, 
            reminder_response_date = GETDATE()
        WHERE id = @bookingId
      `);
  } catch (err) {
    throw new Error("Fejl ved opdatering af reminder_response: " + err.message);
  }
}

// Find seneste aktive booking for et telefonnummer (status = 'confirmed')
async function findBookingByPhoneNumber(phoneNumber) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("phoneNumber", sql.NVarChar, phoneNumber)
      .query(`
        SELECT TOP 1
          b.*,
          e.title as experience_title
        FROM bookings b
        INNER JOIN experiences e ON b.experience_id = e.id
        WHERE b.customer_phone = @phoneNumber
          AND b.status = 'confirmed'
        ORDER BY b.created_at DESC
      `);
    
    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Fejl ved søgning efter booking: " + err.message);
  }
}

// Hent alle bookinger for en affiliate partners experiences
async function getBookingsByPartner(partnerId) {
  try {
    await ensureConnection();
    
    const result = await pool
      .request()
      .input("partnerId", sql.Int, partnerId)
      .query(`
        SELECT 
          b.*,
          e.title as experience_title,
          e.location as experience_location
        FROM bookings b
        INNER JOIN experiences e ON b.experience_id = e.id
        WHERE e.affiliate_partner_id = @partnerId
        ORDER BY b.booking_date DESC, b.created_at DESC
      `);
    
    return result.recordset;
  } catch (err) {
    throw new Error("Fejl ved hentning af partner bookinger: " + err.message);
  }
}

module.exports = {
  getExperienceById,
  checkDateAvailability,
  getAvailableDates,
  createBooking,
  getBookingById,
  updateBookingStatus,
  getBookingsForReminder,
  updateReminderSent,
  updateReminderResponse,
  findBookingByPhoneNumber,
  getBookingsByPartner,
  ensureConnection,
  pool,
  sql,
};

