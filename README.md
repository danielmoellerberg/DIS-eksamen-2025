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

# MailerSend (bookingbekræftelser)
MAILERSEND_API_TOKEN=mlsn.xxxxxxxxxxxxxxxxxxxxxx
MAILERSEND_FROM_EMAIL=booking@projectdis.app
MAILERSEND_FROM_NAME=Understory Marketplace
```

Hvis `CLOUDINARY_EMBED_URL` er sat, bruges Cloudinary-videoen automatisk (autoplay, muted, loop). Ellers faldes der tilbage til en lokal/video-URL eller ren hero-tekst.

## MailerSend opsætning
1. Opret en konto på [MailerSend](https://www.mailersend.com/)
2. Verificer dit domæne eller email-adresse under **Domains**
3. Opret et API token under **API Tokens** og kopier det til `.env`
4. Sæt afsender-email og navn i `.env` (skal matche verificeret domæne/email)

Når disse variabler er sat, sendes bookingbekræftelser automatisk via MailerSend efter succesfuld betaling.
