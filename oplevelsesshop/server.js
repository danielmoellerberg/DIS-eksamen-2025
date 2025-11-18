const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Servér alle statiske filer (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "oplevelsesshop", "public")));

// Sørg for at '/' viser index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "oplevelsesshop","public", "index.html"));
});

// Til test – så du kan se hvilken instans du rammer
app.get("/status", (req, res) => {
  res.send(`✅ Serveren kører på port ${PORT}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveren kører på http://161.35.76.75:${PORT}`);
});

