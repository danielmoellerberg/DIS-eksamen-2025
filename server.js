const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Statisk indhold
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Forside
app.get("/", (req, res) => {
  res.render("index", { title: "Understory Marketplace" });
});

// Test-endpoint
app.get("/status", (req, res) => {
  res.send(`✅ Serveren kører på port ${PORT}`);
});

// Ruter
const experiencesRoutes = require("./routes/experiencesRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/experiences", experiencesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).render("404", { title: "Siden blev ikke fundet" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Serveren kører på http://localhost:${PORT}`);
});



