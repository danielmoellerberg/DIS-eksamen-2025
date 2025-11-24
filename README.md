# DIS-eksamen-2025

## Nødvendige miljøvariabler
Opret en `.env` i projektroden med mindst følgende nøgler:

```
PORT=3000
HOST=0.0.0.0

# Azure SQL
DB_HOST=...
DB_NAME=...
DB_USER=...
DB_PASS=...

# Hero video (valgfri)
CLOUDINARY_VIDEO_URL=https://eksempel.dk/video.mp4
CLOUDINARY_VIDEO_POSTER=https://eksempel.dk/poster.jpg
```

Videofelterne er valgfrie; hvis de ikke udfyldes, vises blot hero-teksten.