const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { requireAuth } = require("../utils/authMiddleware");

// Hent tilgængelige datoer for en oplevelse
router.get("/available/:id", bookingController.getAvailableDates);

// Opret en ny booking (API endpoint - beskyttet)
router.post("/", requireAuth, bookingController.createBooking);

// Opret booking og redirect til betalingsside (form submit)
router.post("/create-and-redirect", bookingController.createBookingAndRedirect);

module.exports = router;

