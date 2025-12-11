const Stripe = require("stripe");
const bookingModel = require("../models/bookingModels");
const { sendBookingConfirmationEmail } = require("../config/mail");

// Initialiser Stripe med secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook secret fra environment variable (fås fra Stripe Dashboard)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Håndter Stripe webhook events
 * Verificerer signature og opdaterer booking status automatisk
 */
async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ Stripe webhook: Manglende signature header");
    return res.status(400).send("Manglende signature");
  }

  if (!webhookSecret) {
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET ikke sat - webhook verificering deaktiveret");
    // I development kan man springe verificering over, men i produktion skal den være sat
    if (process.env.NODE_ENV === "production") {
      return res.status(500).send("Webhook secret ikke konfigureret");
    }
  }

  let event;

  try {
    // Verificer webhook signature (vigtigt for sikkerhed!)
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback for development (IKKE sikkert - kun til test!)
      console.warn("⚠️ Webhook verificering springes over (development mode)");
      event = req.body;
    }
  } catch (err) {
    console.error("❌ Stripe webhook signature verificering fejlede:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Håndter forskellige event typer
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "payment_intent.succeeded":
        // Håndter hvis nødvendigt
        console.log("✅ Payment intent succeeded:", event.data.object.id);
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Payment intent failed:", event.data.object.id);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`ℹ️ Ukendt event type: ${event.type}`);
    }

    // Returner 200 OK til Stripe (vigtigt - Stripe prøver igen hvis ikke 200)
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Fejl ved håndtering af webhook event:", error);
    // Returner stadig 200 for at undgå Stripe retries (hvis det er en ikke-kritisk fejl)
    // Eller returner 500 hvis det er en kritisk fejl der skal retries
    res.status(500).json({ error: error.message });
  }
}

/**
 * Håndter når checkout session er gennemført (betaling succesfuld)
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("✅ Stripe webhook: Checkout session completed:", session.id);

    // Hent booking ID fra metadata
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error("❌ Ingen bookingId i session metadata");
      return;
    }

    // Tjek om betalingen faktisk er gennemført
    if (session.payment_status !== "paid") {
      console.log(`ℹ️ Session ${session.id} er ikke betalt (status: ${session.payment_status})`);
      return;
    }

    // Hent booking fra database
    const booking = await bookingModel.getBookingById(parseInt(bookingId));

    if (!booking) {
      console.error(`❌ Booking ${bookingId} ikke fundet i database`);
      return;
    }

    // Tjek om booking allerede er bekræftet (idempotency check)
    if (booking.status === "confirmed") {
      console.log(`ℹ️ Booking ${bookingId} er allerede bekræftet - springer over`);
      return;
    }

    // Opdater booking status til confirmed
    await bookingModel.updateBookingStatus(parseInt(bookingId), "confirmed");
    console.log(`✅ Booking ${bookingId} opdateret til 'confirmed' via webhook`);

    // Send bookingbekræftelse email
    try {
      await sendBookingConfirmationEmail({
        email: booking.customer_email,
        name: booking.customer_name,
        eventTitle: booking.experience_title,
        eventDate: booking.booking_date
          ? new Date(booking.booking_date).toLocaleDateString("da-DK")
          : undefined,
      });
      console.log(`📧 Bookingbekræftelse sendt til ${booking.customer_email}`);
    } catch (mailErr) {
      console.error("❌ Kunne ikke sende bookingbekræftelse:", mailErr.message);
      // Fortsæt selvom email fejler - booking er stadig bekræftet
    }
  } catch (error) {
    console.error("❌ Fejl ved håndtering af checkout session completed:", error);
    throw error; // Re-throw så webhook kan returnere fejl
  }
}

/**
 * Håndter refund (hvis kunde får pengene tilbage)
 */
async function handleChargeRefunded(charge) {
  try {
    console.log("💰 Stripe webhook: Charge refunded:", charge.id);

    // Hvis I har payment_intent_id gemt i booking, kan I finde booking og opdatere status
    // For nu logger vi bare
    // TODO: Hvis I vil håndtere refunds, skal I gemme payment_intent_id i booking tabellen
  } catch (error) {
    console.error("❌ Fejl ved håndtering af refund:", error);
  }
}

module.exports = {
  handleStripeWebhook,
};

