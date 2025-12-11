const express = require("express");
// Express 5 har indbygget async error handling - ingen ekstra pakke nødvendig!
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const responseTime = require("response-time");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const experienceModel = require("./models/experienceModels");

const app = express();
dotenv.config();

// Trust proxy (nødvendig når app kører bag Nginx)
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const CLOUDINARY_VIDEO_URL = process.env.CLOUDINARY_VIDEO_URL || "";
const CLOUDINARY_VIDEO_POSTER = process.env.CLOUDINARY_VIDEO_POSTER || "";
const CLOUDINARY_EMBED_URL = process.env.CLOUDINARY_EMBED_URL || "";

// Rate limiting - beskytter mod DoS-angreb
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 200, // Maks 200 requests per IP per 15 minutter
  message: {
    error: "For mange forespørgsler fra denne IP. Prøv igen om 15 minutter.",
  },
  standardHeaders: true, // Returnerer rate limit info i headers
  legacyHeaders: false, // Deaktiverer X-RateLimit-* headers
});

// Middleware
app.use(cors());
app.use(helmet()); // HTTP header-sikkerhed (XSS, clickjacking, MIME-sniffing osv.)
app.use(limiter); // Rate limiting (DoS-beskyttelse)
app.use(morgan("dev")); // HTTP request logging
app.use(responseTime((req, res, time) => {
  console.log(`⏱️  ${req.method} ${req.originalUrl} - ${time.toFixed(2)}ms`);
})); // Måler og logger serverresponstid
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser()); // Parse cookies

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "understory-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true i produktion (HTTPS)
      httpOnly: true, // Forhindrer client-side JS fra at tilgå cookie
      sameSite: "strict", // Forhindrer Cross-Site Request Forgery (CSRF)
      maxAge: 1000 * 60 * 60 * 24, // 24 timer
    },
  })
);

// HTTP request logging middleware (detaljeret logging)
app.use((req, res, next) => {
  console.log("----- HTTP Request -----");
  console.log("method:", req.method);
  console.log("url:", req.originalUrl);
  console.log("ip:", req.ip);
  console.log("------------------------");
  next();
});

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

// Hent experiences fra database og format til frontend
async function getExperiencesForFrontend() {
  try {
    const experiences = await experienceModel.getAllExperiences();
    
    // Filtrer kun aktive experiences
    const activeExperiences = experiences.filter(exp => exp.status === 'active');
    
    // Format til det format frontend forventer
    return activeExperiences.map(exp => {
      // Parse available_dates hvis det eksisterer
      let dateText = "Flere datoer tilgængelige";
      if (exp.available_dates) {
        try {
          const dateInfo = JSON.parse(exp.available_dates);
          if (dateInfo.type === "single") {
            dateText = new Date(dateInfo.date).toLocaleDateString('da-DK', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            });
          } else if (dateInfo.type === "always") {
            dateText = "Book når det passer dig";
          }
        } catch (e) {
          // Hvis JSON parse fejler, brug default tekst
        }
      }
      
      // Lav en kort beskrivelse (første 100 tegn)
      const shortDescription = exp.description.length > 100 
        ? exp.description.substring(0, 100) + "..." 
        : exp.description;
      
      return {
        _id: exp.id,
        title: exp.title,
        shortDescription: shortDescription,
        description: exp.description,
        image: exp.image_url || "https://picsum.photos/600/400?random=" + exp.id,
        rating: 4.5, // Default rating (kan tilføjes reviews senere)
        category: exp.category || "Andet",
        location: exp.location,
        date: dateText,
        duration: exp.duration_hours + " timer",
        price: exp.price_from,
      };
    });
  } catch (err) {
    console.error("Fejl ved hentning af experiences:", err);
    return []; // Returner tom array hvis der er fejl
  }
}

// Forside (alias /home)
app.get(["/", "/home"], async (req, res) => {
  try {
    const events = await getExperiencesForFrontend();
  res.render("index", { title: "Understory Marketplace", events });
  } catch (err) {
    console.error("Fejl ved visning af forside:", err);
    res.render("index", { title: "Understory Marketplace", events: [] });
  }
});

// Details-side med anbefalinger
app.get("/details/:id", async (req, res) => {
  try {
    const events = await getExperiencesForFrontend();
  const event = events.find((ev) => String(ev._id) === req.params.id);

  if (!event) {
      return res.status(404).render("404", { title: "Event ikke fundet" });
  }

    const relatedEvents = events
      .filter((ev) => ev._id !== event._id && ev.category === event.category)
      .slice(0, 2);

  res.render("details", {
    title: event.title,
    event,
    relatedEvents,
  });
  } catch (err) {
    console.error("Fejl ved visning af details:", err);
    res.status(500).send("Der opstod en fejl");
  }
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
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/experiences", experiencesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/affiliate", affiliatePartnerRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/upload", uploadRoutes);

// Global error handler (fanger alle async fejl automatisk via express-async-errors)
app.use((err, req, res, next) => {
  console.error("❌ Server fejl:", err.message);
  console.error(err.stack);
  res.status(500).json({
    error: "Der opstod en intern serverfejl",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

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



