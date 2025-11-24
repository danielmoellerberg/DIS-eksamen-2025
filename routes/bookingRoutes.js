const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Hent tilgængelige datoer for en oplevelse
router.get("/available/:id", bookingController.getAvailableDates);

// Opret en ny booking
router.post("/", bookingController.createBooking);

module.exports = router;

