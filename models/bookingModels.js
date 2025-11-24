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

// Hent tilgængelige datoer for en oplevelse (fra 1. december 2025)
async function getAvailableDates(experienceId) {
  try {
    // Sikr at forbindelsen er åben
    await ensureConnection();
    // Start fra 1. december 2025
    const startDate = new Date('2025-12-01');
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
    
    // Datoer der skal have "few seats left" (5., 10., 15., 20., 25. december)
    const fewSeatsDates = [
      '2025-12-05',
      '2025-12-10',
      '2025-12-15',
      '2025-12-20',
      '2025-12-25'
    ];
    
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

module.exports = {
  getExperienceById,
  checkDateAvailability,
  getAvailableDates,
  createBooking,
  ensureConnection,
  pool,
  sql,
};

