const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Servér statiske filer fra "public"-mappen
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/status", (req, res) => {
  res.send(`Server kører på port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`✅ Serveren kører på http://161.35.76.75:${PORT}`);
});
