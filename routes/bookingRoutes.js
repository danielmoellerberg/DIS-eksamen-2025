const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { requireAuth } = require("../utils/authMiddleware");

// ENDPOINT: GET /api/bookings/available/:id
// Beskrivelse: Henter alle tilgængelige datoer for en specifik experience (næste 60 dage)
// Beskyttet: Nej (offentlig - bruges af booking form)
router.get("/available/:id", bookingController.getAvailableDates);

// ENDPOINT: POST /api/bookings
// Beskrivelse: Opretter en ny booking i databasen via API (returnerer JSON)
// Beskyttet: Ja (kræver authentication)
router.post("/", requireAuth, bookingController.createBooking);

// ENDPOINT: POST /api/bookings/create-and-redirect
// Beskrivelse: Opretter en booking og redirecter brugeren til betalingssiden (web form submit)
// Beskyttet: Nej (offentlig - bruges af booking form)
router.post("/create-and-redirect", bookingController.createBookingAndRedirect);

module.exports = router;

