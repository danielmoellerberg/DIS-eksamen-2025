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

// Vis booking-side
async function getBookingPage(req, res) {
  try {
    const experienceId = parseInt(req.params.id);
    
    if (!experienceId) {
      return res.status(400).send("Ugyldig oplevelse ID");
    }
    
    // Prøv først at hente fra database
    let experience = null;
    try {
      experience = await bookingModel.getExperienceById(experienceId);
    } catch (dbError) {
      console.log("Database fejl, bruger demoEvents som fallback:", dbError.message);
    }
    
    // Hvis ikke fundet i database, brug demoEvents som fallback
    if (!experience) {
      experience = demoEvents.find(ev => ev.id === experienceId || ev._id === experienceId);
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
    const experienceId = parseInt(req.params.id);
    
    if (!experienceId) {
      return res.status(400).json({ error: "Ugyldig oplevelse ID" });
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
    
    // Validering
    if (!experienceId || !bookingDate || !customerName || !customerEmail || !numberOfParticipants || !totalPrice) {
      return res.status(400).send("Alle påkrævede felter skal udfyldes");
    }
    
    // Tjek om datoen stadig er tilgængelig
    const availability = await bookingModel.checkDateAvailability(experienceId, bookingDate);
    
    if (!availability.available || availability.remainingSpots < numberOfParticipants) {
      return res.status(400).send("Datoen er ikke længere tilgængelig for det antal deltagere");
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
    
    // Redirect til betalingsside
    res.redirect(`/payment/${booking.id}`);
  } catch (err) {
    console.error("Fejl ved oprettelse af booking:", err);
    res.status(500).send(`Fejl: ${err.message}`);
  }
}

// Vis betalingsside
async function getPaymentPage(req, res) {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (!bookingId) {
      return res.status(400).send("Ugyldig booking ID");
    }
    
    // Hent booking information (kan udvides senere)
    // For nu viser vi bare en simpel betalingsside
    
    res.render("payment", {
      title: "Betaling",
      bookingId: bookingId
    });
  } catch (err) {
    console.error("Fejl ved hentning af betalingsside:", err);
    res.status(500).send(`Fejl: ${err.message}`);
  }
}

module.exports = {
  getBookingPage,
  getAvailableDates,
  createBooking,
  createBookingAndRedirect,
  getPaymentPage,
};

