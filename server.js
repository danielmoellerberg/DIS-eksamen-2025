const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors"); // Tilføjet

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Aktiverer CORS
app.use(express.json());

// Statisk indhold
app.use(express.static(path.join(__dirname, "public")));

// Forside
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
  res.status(404).json({ error: "Route ikke fundet" });
});

// Global fejl-håndtering
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Intern serverfejl" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveren kører på http://161.35.76.75:${PORT}`);
});



