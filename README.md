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
CLOUDINARY_EMBED_URL=https://player.cloudinary.com/embed/?cloud_name=dcgzil7pm&public_id=Visit_Copenhagen_In_4K_-_Daniel_Lupascu_1080p_h264_qu32gn&profile=cld-default
CLOUDINARY_VIDEO_URL=https://eksempel.dk/video.mp4
CLOUDINARY_VIDEO_POSTER=https://eksempel.dk/poster.jpg

# E-mail (Nodemailer)
EMAIL_USER=projectdis.app@gmail.com
EMAIL_PASS=************************
EMAIL_FROM=Understory Marketplace <projectdis.app@gmail.com>
```

Hvis `CLOUDINARY_EMBED_URL` er sat, bruges Cloudinary-videoen automatisk (autoplay, muted, loop). Ellers faldes der tilbage til en lokal/video-URL eller ren hero-tekst.

> **Gmail tip:** slå 2FA til og brug et “App password” i stedet for den almindelige adgangskode, så Google ikke blokerer forespørgslerne.