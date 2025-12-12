const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const fsPromises = require("fs").promises;
const path = require("path");

// Multer setup til at håndtere en enkelt billedfil
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
  fileFilter: (req, file, cb) => {
    // Tillad kun billeder
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Kun billeder er tilladt (jpeg, jpg, png, gif, webp)"));
    }
  }
});

// ENDPOINT: POST /api/upload/experience-image
// Beskrivelse: Uploader et experience billede til Cloudinary, optimerer det og returnerer image URL
// Beskyttet: Nej (offentlig - bruges af affiliate partner forms)
router.post("/experience-image", upload.single("image"), async (req, res) => {
  try {
    // Tjek om der er en fil
    if (!req.file) {
      return res.status(400).json({ error: "Ingen fil uploadet" });
    }

    const imageBuffer = req.file.buffer;
    
    // Opret temp mappe hvis den ikke findes
    const tmpDir = path.join(__dirname, "../temp");
    try {
      await fsPromises.mkdir(tmpDir, { recursive: true });
    } catch (err) {
      // Mappe findes allerede
    }
    
    const tmpFilePath = path.join(tmpDir, req.file.originalname);

    // Gem filen midlertidigt
    await fsPromises.writeFile(tmpFilePath, imageBuffer);

    // Upload til Cloudinary
    const uploadOptions = {
      folder: "projectdis/events", // Mappe i Cloudinary
      public_id: "event_" + Date.now(), // Unikt ID
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 800, crop: "limit" }, // Begræns størrelse
        { quality: "auto" } // Automatisk kvalitet optimering
      ]
    };

    const result = await cloudinary.uploader.upload(
      tmpFilePath,
      uploadOptions
    );

    // Slet den midlertidige fil
    await fsPromises.unlink(tmpFilePath);

    console.log("✅ Billede uploadet til Cloudinary:", result.secure_url);

    res.status(201).json({
      message: "Billede er uploadet",
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error("❌ Upload fejl:", error);
    res.status(500).json({ 
      error: "Billede upload fejlede",
      details: error.message 
    });
  }
});

// ENDPOINT: GET /api/upload/experience-images
// Beskrivelse: Henter alle uploadede experience billeder fra Cloudinary projectdis/events mappe
// Beskyttet: Nej (offentlig)
router.get("/experience-images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "projectdis/events/",
      max_results: 50,
    });
    
    res.status(200).json({
      images: result.resources,
      count: result.resources.length
    });
  } catch (error) {
    console.error("❌ Fejl ved hentning af billeder:", error);
    res.status(500).json({ 
      error: "Kunne ikke hente billeder",
      details: error.message 
    });
  }
});

module.exports = router;

