const express = require("express");
const app = express();
const PORT = 3000;

// Gør mappen 'public' tilgængelig
app.use(express.static("public"));

// Start serveren
app.listen(PORT, () => {
  console.log(`✅ Serveren kører på http://161.35.76.75:${PORT}`);
});
