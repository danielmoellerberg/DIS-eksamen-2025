const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const bookingModel = require("../models/bookingModels");
const stripeWebhookController = require("../controllers/stripeWebhookController");

// Initialiser Stripe med secret key fra environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Opret Stripe checkout session
// NOTE: Offentlig endpoint - booking ID valideres i stedet for authentication
// Dette er sikkert fordi booking allerede er oprettet og kun booking ID er nødvendigt
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID er påkrævet" });
    }
    
    // Hent booking information fra databasen
    const booking = await bookingModel.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking blev ikke fundet" });
    }
    
    // Konverter pris fra DKK til øre (Stripe bruger øre)
    const amountInOre = Math.round(parseFloat(booking.total_price) * 100);
    
    // Opret Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "dkk",
            product_data: { 
              name: booking.experience_title || "Booking",
              description: `Booking for ${booking.number_of_participants} deltager(e) - ${new Date(booking.booking_date).toLocaleDateString('da-DK')}`
            },
            unit_amount: amountInOre // Pris i øre
          },
          quantity: 1
        }
      ],
      customer_email: booking.customer_email,
      metadata: {
        bookingId: booking.id.toString(),
        experienceId: booking.experience_id.toString(),
        customerName: booking.customer_name
      },
      success_url: `${process.env.BASE_URL || "https://projectdis.app"}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${process.env.BASE_URL || "https://projectdis.app"}/payment/cancel?booking_id=${booking.id}`
    });
    
    console.log("✅ Stripe checkout session oprettet:", session.id);
    
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Fejl ved oprettelse af Stripe session:", error);
    res.status(500).json({ error: "Kunne ikke oprette betalingssession" });
  }
});

// Stripe webhook endpoint
// VIGTIGT: Denne route skal bruge raw body (ikke parsed JSON)
// Stripe kræver raw body for at verificere signature
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Raw body for webhook signature verification
  stripeWebhookController.handleStripeWebhook
);

module.exports = router;

