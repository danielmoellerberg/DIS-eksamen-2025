# Understory Marketplace - Projektbeskrivelse

## Hvad er projektet?

**Understory Marketplace** er en digital platform, der samler workshops, guidede ture og unikke oplevelser fra forskellige virksomheder på ét sted. Platformen fungerer som en marketplace, hvor kunder kan opdage, booke og betale for oplevelser, mens virksomheder (affiliate partners) kan tilføje og administrere deres tilbud.

## Projektets formål

Projektet er udviklet som en fuldt funktionel webapplikation, der demonstrerer moderne webudvikling med fokus på:
- **Marketplace-funktionalitet**: En centraliseret platform for oplevelser
- **Affiliate partner system**: Virksomheder kan registrere sig og tilføje oplevelser
- **Komplet booking-flow**: Fra opdagelse til betaling og bekræftelse
- **Automatiseret kommunikation**: SMS-reminders og email-bekræftelser
- **Sikker betalingshåndtering**: Integration med Stripe

## Implementerede features

### 1. **Marketplace & Oplevelser**
- **Forside med hero-video**: Dynamisk hero-sektion med Cloudinary video-integration
- **Oplevelseskatalog**: Visning af alle tilgængelige oplevelser med kategorier
- **Oplevelsesdetaljer**: Detaljerede sider for hver oplevelse med anbefalinger
- **Dato-tilgængelighed**: Dynamisk tjek af tilgængelige datoer og pladser
- **"Few seats left" indikator**: Visuel markering når der er få pladser tilbage

### 2. **Booking System**
- **Booking-formular**: Komplet booking-flow med valg af dato, tid og antal deltagere
- **Dato-validering**: Tjek af tilgængelighed før booking oprettes
- **Booking-status**: Håndtering af `pending`, `confirmed` og `cancelled` statusser
- **Booking-historik**: Alle bookinger gemmes i Azure SQL Database

### 3. **Betalingssystem (Stripe Integration)**
- **Stripe Checkout**: Sikker betalingshåndtering via Stripe
- **Session management**: Oprettelse af checkout-sessioner baseret på booking
- **Success/Cancel handling**: Håndtering af betalingsresultater
- **Status-opdatering**: Automatisk opdatering af booking-status efter betaling

### 4. **Affiliate Partner System**
- **Registrering**: Affiliate partners kan oprette konti med email og password
- **Login/Logout**: Sikker autentificering med bcrypt password-hashing
- **Dashboard**: Oversigt over partnerens oplevelser og statistikker
- **Oplevelsesadministration**: Mulighed for at oprette, redigere og administrere oplevelser
- **Session-baseret adgangskontrol**: Beskyttede routes for affiliate partners

### 5. **Email-bekræftelser (MailerSend)**
- **Automatisk bookingbekræftelse**: Email sendes efter succesfuld betaling
- **Professionel email-design**: HTML og tekst-versioner af bekræftelser
- **MailerSend integration**: Brug af MailerSend API til email-afsendelse
- **Konfigurerbar afsender**: Customizable fra-email og navn

### 6. **SMS Reminder System (Twilio)**
- **Automatisk SMS-reminders**: SMS sendes 24 timer før booking via cron job
- **Cron job integration**: Dagligt automatisk kørsel kl. 9:00 (dansk tidzone)
- **Interaktivt svar-system**: Kunder kan svare X (ja) eller Y (nej) på SMS
- **Webhook-håndtering**: Modtagelse og behandling af SMS-svar fra Twilio
- **Automatisk aflysning**: Bookinger annulleres automatisk hvis kunden svarer "nej"
- **SMS-logging**: Alle SMS-beskeder logges i database (`sms_logs` tabel)
- **Telefonnummer-normalisering**: Automatisk konvertering til internationalt format

### 7. **Database & Data Management**
- **Azure SQL Database**: Cloud-baseret database med sikker forbindelse
- **Normaliseret datastruktur**: Tabeller for experiences, bookings, affiliate_partners, categories, etc.
- **SMS logging**: Dedikeret tabel til logging af alle SMS-interaktioner
- **Reminder-tracking**: Felter til tracking af reminder-status og kundesvar
- **Click tracking**: Tracking af klik på affiliate links

### 8. **Admin System**
- **Admin dashboard**: Administrativt interface til platformstyring
- **Admin autentificering**: Sikker login for administratorer
- **Platform-overblik**: Oversigt over alle bookinger, oplevelser og partnere

### 9. **Teknisk Infrastruktur**
- **Express.js backend**: RESTful API med Express framework
- **EJS templating**: Server-side rendering af views
- **Session management**: Express-session til brugerautentificering
- **CORS support**: Cross-origin resource sharing konfigureret
- **Error handling**: Omfattende fejlhåndtering gennem hele applikationen
- **Logging**: Console-logging for debugging og monitoring

### 10. **Frontend & UI**
- **Responsive design**: Mobile-first tilgang til design
- **Modern UI**: Glassmorphism-inspireret navigation og layout
- **Hero-video integration**: Cloudinary video-embedding
- **Dynamisk indhold**: AJAX-baserede opdateringer for dato-tilgængelighed
- **Brugeroplevelse**: Intuitiv navigation og klar call-to-action

## Teknologier brugt

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Azure SQL Database**: Cloud database
- **mssql**: SQL Server driver

### Integrations
- **Stripe**: Betalingshåndtering
- **Twilio**: SMS-afsendelse og webhook-håndtering
- **MailerSend**: Email-afsendelse
- **Cloudinary**: Video-hosting

### Sikkerhed & Autentificering
- **bcrypt**: Password-hashing
- **express-session**: Session management
- **Environment variables**: Sikker håndtering af credentials

### Scheduling
- **node-cron**: Automatisk kørsel af SMS-reminder job

## Database Struktur

### Hovedtabeller
- `experiences`: Oplevelser/workshops
- `bookings`: Kunde-bookinger
- `affiliate_partners`: Virksomheder der tilbyder oplevelser
- `categories`: Kategorier for oplevelser
- `experience_categories`: Many-to-many relation mellem oplevelser og kategorier
- `sms_logs`: Logging af alle SMS-beskeder (udgående og indgående)
- `admin_users`: Administrator-brugere
- `click_tracking`: Tracking af klik på affiliate links

### Booking-tracking felter
- `reminder_sent`: Om SMS-reminder er sendt
- `reminder_response`: Kundens svar ('yes', 'no', eller NULL)
- `reminder_response_date`: Tidspunkt for kundens svar

## Workflow

### Booking-flow
1. Kunde opdager oplevelse på marketplace
2. Kunde vælger dato, tid og antal deltagere
3. Booking oprettes med status `pending`
4. Kunde betaler via Stripe Checkout
5. Booking-status opdateres til `confirmed`
6. Email-bekræftelse sendes automatisk
7. 24 timer før booking sendes SMS-reminder
8. Kunde kan svare X (ja) eller Y (nej)
9. System håndterer svar og opdaterer booking

### Affiliate Partner-flow
1. Partner registrerer sig med email og password
2. Partner logger ind på dashboard
3. Partner opretter oplevelser med detaljer
4. Oplevelser vises på marketplace
5. Partner kan se statistikker og administrere oplevelser

## Deployment

- **Hosting**: DigitalOcean Droplet
- **Domain**: projectdis.app
- **Database**: Azure SQL Database
- **Environment**: Production-ready med environment variables

## Fremtidige forbedringer (potentielle)

- Follow-up SMS hvis ingen svar modtages
- Email-reminders som supplement til SMS
- Avanceret rapportering og analytics
- Mobile app integration
- Multi-language support
- Avanceret søgefunktionalitet

---

**Projektet demonstrerer en komplet, produktion-klar webapplikation med moderne teknologier og best practices inden for webudvikling, database-design, sikkerhed og integration med tredjepartstjenester.**

