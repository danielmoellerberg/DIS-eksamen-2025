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

# Cloudinary hero video
CLOUDINARY_CLOUD_NAME=dcgzil7pm
CLOUDINARY_VIDEO_PUBLIC_ID=Visit_Copenhagen_In_4K_-_Daniel_Lupascu_1080p_h264_qu32gn
CLOUDINARY_VIDEO_URL=https://res.cloudinary.com/dcgzil7pm/video/upload/...mp4
CLOUDINARY_VIDEO_POSTER=https://res.cloudinary.com/dcgzil7pm/image/upload/...jpg
```

`CLOUDINARY_VIDEO_URL` og `CLOUDINARY_VIDEO_POSTER` bruges som fallback, hvis playeren ikke kan initialiseres. PUBLIC_ID skal være identisk med navnet på filen i Cloudinary (uden filendelse).