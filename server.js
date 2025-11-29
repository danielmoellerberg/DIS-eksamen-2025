const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cron = require("node-cron");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const CLOUDINARY_VIDEO_URL = process.env.CLOUDINARY_VIDEO_URL || "";
const CLOUDINARY_VIDEO_POSTER = process.env.CLOUDINARY_VIDEO_POSTER || "";
const CLOUDINARY_EMBED_URL = process.env.CLOUDINARY_EMBED_URL || "";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "understory-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true i produktion (HTTPS)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 timer
    },
  })
);

// View engine + layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// Statisk indhold
app.use(express.static(path.join(__dirname, "public")));

// Globale template-variabler
app.use((req, res, next) => {
  res.locals.heroVideoUrl = CLOUDINARY_VIDEO_URL;
  res.locals.heroVideoPoster = CLOUDINARY_VIDEO_POSTER;
  res.locals.cloudinaryEmbedUrl = CLOUDINARY_EMBED_URL;
  next();
});

// Dummy events til lokal visning (kan erstattes af data fra DB senere)
const demoEvents = [
  {
    _id: 1,
    title: "Workshop i keramik",
    shortDescription: "Lær at dreje og dekorere din egen skål",
    description: "En hyggelig keramik workshop hvor du lærer grundlæggende teknikker.",
    image: "https://picsum.photos/600/400?random=1",
    rating: 4.8,
    category: "Kreativitet",
    location: "København",
    date: "12. marts 2025",
    duration: "2 timer",
    price: 450,
  },
  {
    _id: 2,
    title: "Guidet naturtur",
    shortDescription: "Udforsk skovens flora og fauna på denne guidede tur",
    description: "Kom med på en vandretur i naturen med en erfaren guide.",
    image: "https://picsum.photos/600/400?random=2",
    rating: 4.5,
    category: "Natur",
    location: "Bornholm",
    date: "20. april 2025",
    duration: "3 timer",
    price: 350,
  },
  {
    _id: 3,
    title: "Madlavningskursus",
    shortDescription: "Lær at lave italienske retter fra bunden",
    description: "En lækker madoplevelse med fokus på autentisk italiensk madlavning.",
    image: "https://picsum.photos/600/400?random=3",
    rating: 4.7,
    category: "Mad",
    location: "Aarhus",
    date: "5. maj 2025",
    duration: "4 timer",
    price: 600,
  },
];

const resolveEvents = () => demoEvents;

// Forside (alias /home)
app.get(["/", "/home"], (req, res) => {
  const events = resolveEvents();
  res.render("index", { title: "Understory Marketplace", events });
});

// Details-side med anbefalinger
app.get("/details/:id", (req, res) => {
  const events = resolveEvents();
  const event = events.find((ev) => String(ev._id) === req.params.id);

  if (!event) {
    return res.status(404).send("Event blev ikke fundet");
  }

  const relatedEvents = events.filter((ev) => ev._id !== event._id).slice(0, 2);

  res.render("details", {
    title: event.title,
    event,
    relatedEvents,
  });
});

// Booking-side
const bookingController = require("./controllers/bookingController");
app.get("/book/:id", bookingController.getBookingPage);

// Betalingsside
app.get("/payment/success", bookingController.getPaymentSuccess);
app.get("/payment/cancel", bookingController.getPaymentCancel);
app.get("/payment/:id", bookingController.getPaymentPage);

// Test-endpoint
app.get("/status", (req, res) => {
  res.send(`✅ Serveren kører på port ${PORT}`);
});

// Ruter
const experiencesRoutes = require("./routes/experiencesRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const affiliatePartnerRoutes = require("./routes/affiliatePartnerRoutes");
const twilioRoutes = require("./routes/twilioRoutes");

app.use("/api/experiences", experiencesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/affiliate", affiliatePartnerRoutes);
app.use("/api/twilio", twilioRoutes);

// 404 fallback
app.use((req, res) => {
  // Prøv først at rendere 404 view, hvis det findes
  try {
    res.status(404).render("404", { title: "Siden blev ikke fundet" });
  } catch (err) {
    // Hvis 404 view ikke findes, send simpel tekst
    res.status(404).send("404 - Siden blev ikke fundet");
  }
});

// Cron job: Send SMS reminders kl. 9:00 hver dag
const { sendRemindersForTomorrow } = require("./controllers/notificationController");

// Kør cron job hver dag kl. 9:00
// Format: sekund minut time dag måned ugedag
// '0 9 * * *' = kl. 9:00 hver dag
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Cron job kører: Sender SMS reminders for i morgen...");
  try {
    const result = await sendRemindersForTomorrow();
    console.log("📊 Cron job resultat:", result);
  } catch (error) {
    console.error("❌ Fejl i cron job:", error);
  }
}, {
  scheduled: true,
  timezone: "Europe/Copenhagen" // Brug dansk tidzone
});

console.log("⏰ Cron job opsat: SMS reminders sendes dagligt kl. 9:00 (dansk tid)");

// Start server
app.listen(PORT, HOST, () => {
  console.log(`✅ Serveren kører på http://${HOST}:${PORT}`);
});



