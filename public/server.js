const express = require("express");
const app = express();
const PORT = 3000;

// Servér statiske filer fra "public" mappen
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Serveren kører på http://161.35.76.75:${PORT}`);
});
