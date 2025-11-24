const bookingModel = require("../models/bookingModels");

// Dummy events som fallback (samme som i server.js)
const demoEvents = [
  {
    id: 1,
    _id: 1,
    title: "Workshop i keramik",
    shortDescription: "Lær at dreje og dekorere din egen skål",
    description: "En hyggelig keramik workshop hvor du lærer grundlæggende teknikker.",
    image_url: "https://picsum.photos/600/400?random=1",
    image: "https://picsum.photos/600/400?random=1",
    rating: 4.8,
    category: "Kreativitet",
    location: "København",
    date: "12. marts 2025",
    duration: "2 timer",
    price: 450,
    price_from: 450,
  },
  {
    id: 2,
    _id: 2,
    title: "Guidet naturtur",
    shortDescription: "Udforsk skovens flora og fauna på denne guidede tur",
    description: "Kom med på en vandretur i naturen med en erfaren guide.",
    image_url: "https://picsum.photos/600/400?random=2",
    image: "https://picsum.photos/600/400?random=2",
    rating: 4.5,
    category: "Natur",
    location: "Bornholm",
    date: "20. april 2025",
    duration: "3 timer",
    price: 350,
    price_from: 350,
  },
  {
    id: 3,
    _id: 3,
    title: "Madlavningskursus",
    shortDescription: "Lær at lave italienske retter fra bunden",
    description: "En lækker madoplevelse med fokus på autentisk italiensk madlavning.",
    image_url: "https://picsum.photos/600/400?random=3",
    image: "https://picsum.photos/600/400?random=3",
    rating: 4.7,
    category: "Mad",
    location: "Aarhus",
    date: "5. maj 2025",
    duration: "4 timer",
    price: 600,
    price_from: 600,
  },
];

// Mapping fra demoEvent ID til database titel (så vi kan finde det rigtige database ID)
const demoEventToTitle = {
  1: "Workshop i keramik",
  2: "Guidet naturtur",
  3: "Madlavningskursus"
};

// Hjælpefunktion til at finde database ID baseret på demoEvent ID eller titel
async function findDatabaseExperienceId(demoEventId) {
  try {
    const title = demoEventToTitle[demoEventId];
    if (!title) return null;
    
    await bookingModel.ensureConnection();
    const result = await bookingModel.pool
      .request()
      .input("title", bookingModel.sql.NVarChar, title)
      .query("SELECT id FROM experiences WHERE title = @title ORDER BY id DESC");
    
    if (result.recordset.length > 0) {
      return result.recordset[0].id; // Returner det højeste ID hvis der er flere
    }
    return null;
  } catch (err) {
    console.error("Fejl ved søgning efter experience:", err);
    return null;
  }
}

// Vis booking-side
async function getBookingPage(req, res) {
  try {
    const experienceId = parseInt(req.params.id);
    
    if (!experienceId) {
      return res.status(400).send("Ugyldig oplevelse ID");
    }
    
    // Prøv først at hente fra database med det direkte ID
    let experience = null;
    try {
      experience = await bookingModel.getExperienceById(experienceId);
    } catch (dbError) {
      console.log("Database fejl ved direkte lookup:", dbError.message);
    }
    
    // Hvis ikke fundet og det er et demoEvent ID (1, 2, 3), prøv at finde database ID via titel
    if (!experience && (experienceId === 1 || experienceId === 2 || experienceId === 3)) {
      console.log(`Prøver at finde database ID for demoEvent ID ${experienceId}`);
      const databaseId = await findDatabaseExperienceId(experienceId);
      
      if (databaseId) {
        console.log(`Fundet database ID ${databaseId} for demoEvent ID ${experienceId}`);
        try {
          experience = await bookingModel.getExperienceById(databaseId);
        } catch (dbError) {
          console.log("Database fejl ved lookup med database ID:", dbError.message);
        }
      }
    }
    
    // Hvis stadig ikke fundet, brug demoEvents som fallback (kun til visning, ikke booking)
    if (!experience) {
      experience = demoEvents.find(ev => ev.id === experienceId || ev._id === experienceId);
      if (experience) {
        console.warn(`⚠️ Experience ID ${experienceId} findes kun som demoEvent. Booking vil fejle.`);
      }
    }
    
    if (!experience) {
      return res.status(404).send(`Oplevelse med ID ${experienceId} blev ikke fundet`);
    }
    
    // Sørg for at experience har de nødvendige felter
    if (!experience.price_from && experience.price) {
      experience.price_from = experience.price;
    }
    if (!experience.image_url && experience.image) {
      experience.image_url = experience.image;
    }
    
    res.render("book", {
      title: `Book ${experience.title}`,
      experience,
    });
  } catch (err) {
    console.error("Fejl ved hentning af booking-side:", err);
    res.status(500).send(`Serverfejl: ${err.message}`);
  }
}

// Hent tilgængelige datoer (API endpoint)
async function getAvailableDates(req, res) {
  try {
    let experienceId = parseInt(req.params.id);
    
    if (!experienceId) {
      return res.status(400).json({ error: "Ugyldig oplevelse ID" });
    }
    
    // Hvis det er et demoEvent ID (1, 2, 3), find det rigtige database ID
    if (experienceId === 1 || experienceId === 2 || experienceId === 3) {
      const databaseId = await findDatabaseExperienceId(experienceId);
      if (databaseId) {
        experienceId = databaseId;
      }
    }
    
    const availableDates = await bookingModel.getAvailableDates(experienceId);
    
    res.status(200).json({
      success: true,
      dates: availableDates
    });
  } catch (err) {
    console.error("Fejl ved hentning af tilgængelige datoer:", err);
    res.status(500).json({ error: err.message });
  }
}

// Opret booking (API endpoint)
async function createBooking(req, res) {
  try {
    const {
      experienceId,
      bookingDate,
      bookingTime,
      customerName,
      customerEmail,
      customerPhone,
      numberOfParticipants,
      totalPrice
    } = req.body;
    
    // Validering
    if (!experienceId || !bookingDate || !customerName || !customerEmail || !numberOfParticipants || !totalPrice) {
      return res.status(400).json({ 
        error: "Alle påkrævede felter skal udfyldes" 
      });
    }
    
    // Tjek om datoen stadig er tilgængelig
    const availability = await bookingModel.checkDateAvailability(experienceId, bookingDate);
    
    if (!availability.available || availability.remainingSpots < numberOfParticipants) {
      return res.status(400).json({ 
        error: "Datoen er ikke længere tilgængelig for det antal deltagere" 
      });
    }
    
    // Opret booking
    const booking = await bookingModel.createBooking({
      experienceId: parseInt(experienceId),
      bookingDate,
      bookingTime: bookingTime || null,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      numberOfParticipants: parseInt(numberOfParticipants),
      totalPrice: parseFloat(totalPrice),
      status: "pending"
    });
    
    res.status(201).json({
      success: true,
      message: "Booking oprettet succesfuldt",
      bookingId: booking.id
    });
  } catch (err) {
    console.error("Fejl ved oprettelse af booking:", err);
    res.status(500).json({ error: err.message });
  }
}

// Opret booking og redirect til betalingsside
async function createBookingAndRedirect(req, res) {
  try {
    const {
      experienceId,
      bookingDate,
      bookingTime,
      customerName,
      customerEmail,
      customerPhone,
      numberOfParticipants,
      totalPrice
    } = req.body;
    
    console.log("Booking data modtaget:", {
      experienceId,
      bookingDate,
      customerName,
      customerEmail,
      numberOfParticipants,
      totalPrice
    });
    
    // Validering
    if (!experienceId || !bookingDate || !customerName || !customerEmail || !numberOfParticipants || !totalPrice) {
      console.error("Validering fejlede - manglende felter");
      return res.status(400).send("Alle påkrævede felter skal udfyldes");
    }
    
    let parsedExperienceId = parseInt(experienceId);
    
    // Tjek om experience findes i databasen
    let experience = null;
    try {
      experience = await bookingModel.getExperienceById(parsedExperienceId);
    } catch (dbError) {
      console.log("Kunne ikke hente experience fra database:", dbError.message);
    }
    
    // Hvis experience ikke findes og det er et demoEvent ID (1, 2, 3), prøv at finde database ID via titel
    if (!experience && (parsedExperienceId === 1 || parsedExperienceId === 2 || parsedExperienceId === 3)) {
      console.log(`Prøver at finde database ID for demoEvent ID ${parsedExperienceId}`);
      const databaseId = await findDatabaseExperienceId(parsedExperienceId);
      
      if (databaseId) {
        console.log(`Fundet database ID ${databaseId} for demoEvent ID ${parsedExperienceId}`);
        parsedExperienceId = databaseId; // Opdater til database ID
        try {
          experience = await bookingModel.getExperienceById(databaseId);
        } catch (dbError) {
          console.log("Database fejl ved lookup med database ID:", dbError.message);
        }
      }
    }
    
    // Hvis experience stadig ikke findes, fejl
    if (!experience) {
      const demoEvent = demoEvents.find(ev => ev.id === parseInt(experienceId) || ev._id === parseInt(experienceId));
      if (demoEvent) {
        console.warn(`⚠️ Experience ID ${experienceId} findes kun som demoEvent, ikke i database.`);
        console.warn("⚠️ Booking kan ikke oprettes fordi experience ikke findes i databasen.");
        return res.status(400).send(
          `Oplevelse med ID ${experienceId} findes ikke i databasen. ` +
          `Du skal først oprette oplevelsen i databasen før du kan booke den.`
        );
      } else {
        return res.status(404).send(`Oplevelse med ID ${experienceId} blev ikke fundet`);
      }
    }
    
    // Tjek om datoen stadig er tilgængelig (brug det opdaterede database ID)
    const availability = await bookingModel.checkDateAvailability(experience.id, bookingDate);
    
    if (!availability.available || availability.remainingSpots < numberOfParticipants) {
      console.error("Dato ikke tilgængelig:", { availability, numberOfParticipants });
      return res.status(400).send("Datoen er ikke længere tilgængelig for det antal deltagere");
    }
    
    // Opret booking i databasen (brug det rigtige database ID)
    const bookingData = {
      experienceId: experience.id,
      bookingDate,
      bookingTime: bookingTime || null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : null,
      numberOfParticipants: parseInt(numberOfParticipants),
      totalPrice: parseFloat(totalPrice),
      status: "pending"
    };
    
    console.log("Opretter booking i database:", bookingData);
    
    const booking = await bookingModel.createBooking(bookingData);
    
    if (!booking || !booking.id) {
      throw new Error("Booking blev ikke oprettet korrekt i databasen");
    }
    
    console.log("✅ Booking oprettet succesfuldt i database med ID:", booking.id);
    
    // Redirect til betalingsside
    res.redirect(`/payment/${booking.id}`);
  } catch (err) {
    console.error("❌ Fejl ved oprettelse af booking:", err);
    console.error("Error stack:", err.stack);
    res.status(500).send(`Fejl ved oprettelse af booking: ${err.message}`);
  }
}

// Vis betalingsside
async function getPaymentPage(req, res) {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (!bookingId) {
      return res.status(400).send("Ugyldig booking ID");
    }
    
    // Hent booking information fra databasen
    const booking = await bookingModel.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).send("Booking blev ikke fundet");
    }
    
    res.render("payment", {
      title: "Betaling",
      booking: booking,
      bookingId: bookingId
    });
  } catch (err) {
    console.error("Fejl ved hentning af betalingsside:", err);
    res.status(500).send(`Fejl: ${err.message}`);
  }
}

// Success side efter betaling
async function getPaymentSuccess(req, res) {
  try {
    const bookingId = parseInt(req.query.booking_id);
    const sessionId = req.query.session_id;
    
    if (bookingId) {
      // Opdater booking status til "confirmed" hvis betalingen er gennemført
      // (Du kan også verificere med Stripe webhook)
      const booking = await bookingModel.getBookingById(bookingId);
      
      res.render("payment-success", {
        title: "Betaling gennemført",
        booking: booking,
        sessionId: sessionId
      });
    } else {
      res.render("payment-success", {
        title: "Betaling gennemført",
        booking: null,
        sessionId: sessionId
      });
    }
  } catch (err) {
    console.error("Fejl ved hentning af success-side:", err);
    res.status(500).send(`Fejl: ${err.message}`);
  }
}

// Cancel side hvis betalingen annulleres
async function getPaymentCancel(req, res) {
  try {
    const bookingId = parseInt(req.query.booking_id);
    
    if (bookingId) {
      const booking = await bookingModel.getBookingById(bookingId);
      
      res.render("payment-cancel", {
        title: "Betaling annulleret",
        booking: booking,
        bookingId: bookingId
      });
    } else {
      res.render("payment-cancel", {
        title: "Betaling annulleret",
        booking: null,
        bookingId: null
      });
    }
  } catch (err) {
    console.error("Fejl ved hentning af cancel-side:", err);
    res.status(500).send(`Fejl: ${err.message}`);
  }
}

module.exports = {
  getBookingPage,
  getAvailableDates,
  createBooking,
  createBookingAndRedirect,
  getPaymentPage,
  getPaymentSuccess,
  getPaymentCancel,
};

