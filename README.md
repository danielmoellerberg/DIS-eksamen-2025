# Understory Marketplace - DIS Eksamen 2025

## Projektbeskrivelse

Understory Marketplace er en webapplikation til booking og salg af oplevelser. Systemet giver affiliate partners mulighed for at oprette og administrere oplevelser, mens kunder kan browse, booke og betale for oplevelser.

### Hovedfunktioner

- **Marketplace Frontend**: Offentlig side hvor kunder kan browse og søge efter oplevelser
- **Affiliate Partner Dashboard**: Administrationspanel til oprettelse og administration af oplevelser
- **Booking System**: Komplet bookingflow med dato-valg og betaling via Stripe
- **Betalingsintegration**: Stripe Checkout integration
- **Email Bekræftelser**: Automatiske bookingbekræftelser via MailerSend
- **SMS Notifikationer**: SMS reminders via Twilio (sendes dagligt kl. 9:00)
- **Billede Upload**: Cloudinary integration til upload og hosting af billeder

---

## Hurtig Start

### 1. Installer dependencies

```bash
npm install
```

### 2. Opret `.env` fil

Opret en ny `.env` fil i projektroden og kopier alle API nøgler fra **rapportens bilag** ind i filen.

**Vigtigt:** Alle API nøgler findes i bilag af rapporten. Se nedenfor for hvilke variabler der skal sættes.

### 4. Start serveren

```bash
npm start
```

Serveren kører nu på `http://localhost:3000`

---

## Miljøvariabler

Alle miljøvariabler skal sættes i `.env` filen. **API nøgler findes i bilag af rapporten.**

### Nødvendige variabler:

- **Server**: `PORT`, `HOST`, `NODE_ENV`, `BASE_URL`
- **Database**: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT`, `DB_ENCRYPT`, `DB_TRUST_CERT`
- **Session & JWT**: `SESSION_SECRET`, `JWT_SECRET`
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **MailerSend**: `MAILERSEND_API_TOKEN`, `MAILERSEND_FROM_EMAIL`, `MAILERSEND_FROM_NAME`
- **Twilio** (valgfrit): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

Alle værdier findes i rapportens bilag.

---

## Test Instruktioner

### Test Marketplace (Offentlig Side)

1. **Åbn forside**: `http://localhost:3000`
   - Verificer at oplevelser vises
   - Test søgefunktion og kategori-filtrering
   - Klik på en oplevelse for at se detaljer

2. **Booking Flow**:
   - Klik "Book nu" på en oplevelse
   - Vælg antal deltagere og dato
   - Udfyld kontaktoplysninger
   - Klik "Fortsæt til betaling"

3. **Test Betaling**:
   - Klik "Betal med Stripe"
   - Brug Stripe test kort:
     - Kortnummer: `4242 4242 4242 4242`
     - Udløbsdato: `12/25` (eller hvilken som helst fremtidig dato)
     - CVC: `123`
     - ZIP: `12345`
   - Efter succesfuld betaling, verificer redirect til success side

### Test Affiliate Partner System

1. **Registrering**: Gå til `http://localhost:3000/affiliate/register`
   - Udfyld registreringsformular
   - Efter registrering, bliver du automatisk logget ind

2. **Login**: Gå til `http://localhost:3000/affiliate/login`
   - Log ind med dine credentials

3. **Dashboard**: Efter login, bliver du redirected til dashboard
   - Verificer at statistik og oplevelser vises

4. **Opret Oplevelse**:
   - Klik "Opret ny oplevelse"
   - Udfyld alle felter (titel, beskrivelse, kategori, lokation, varighed, pris)
   - Upload billede
   - Vælg dato-type
   - Klik "Opret oplevelse"
   - Verificer at oplevelsen vises på dashboard og forside

5. **Rediger/Slet Oplevelse**:
   - Brug "Rediger" og "Slet" knapperne på dashboard
   - Verificer at ændringerne gemmes korrekt

---

## Vigtige API Endpoints

### Offentlige
- `GET /api/experiences` - Hent alle oplevelser
- `GET /api/bookings/available/:id` - Hent tilgængelige datoer
- `POST /api/bookings/create-and-redirect` - Opret booking og redirect til betaling

### Beskyttede (kræver authentication)
- `POST /api/experiences` - Opret oplevelse
- `POST /api/bookings` - Opret booking
- `GET /affiliate/dashboard` - Dashboard
- `POST /affiliate/experiences/create` - Opret oplevelse
- `POST /affiliate/experiences/edit/:id` - Rediger oplevelse
- `POST /affiliate/experiences/delete/:id` - Slet oplevelse

---

## Database

Projektet bruger **Azure SQL Database**. Database schema skal oprettes manuelt. Tabeller inkluderer:

- `affiliate_partners` - Affiliate partner accounts
- `experiences` - Oplevelser
- `bookings` - Bookings
- `sms_logs` - SMS sending logs

**Vigtigt**: Database schema er ikke inkluderet. Kontakt projektgruppen for database setup script.

---

## Sikkerhed

Projektet implementerer:
- Helmet security headers
- Rate limiting (200 requests per 15 minutter)
- JWT authentication
- Session management med httpOnly cookies
- Password hashing med bcrypt
- SQL injection protection via parameterized queries

---

## Fejlfinding

**Serveren starter ikke:**
- Tjek at port 3000 ikke er optaget
- Verificer at alle dependencies er installeret: `npm install`
- Tjek `.env` filen for manglende variabler

**Database connection fejl:**
- Verificer database credentials i `.env`
- For Azure SQL: Verificer at din IP er whitelisted i firewall

**Stripe betaling virker ikke:**
- Verificer at du bruger test keys (starter med `sk_test_`)
- Tjek Stripe Dashboard for webhook events

**Email sendes ikke:**
- Verificer MailerSend API token
- Tjek at afsender email er verificeret i MailerSend

---

## Noter til Underviser

- **Opret `.env` fil**: Opret en ny `.env` fil i projektroden og kopier alle API nøgler fra rapportens bilag ind i filen.
- **API Nøgler**: Alle API nøgler findes i bilag af rapporten. Kopier værdierne derfra til din `.env` fil.
- **Test Data**: Projektet kræver test data i databasen. Kontakt projektgruppen for test data eller database dump.

---

## Teknisk Stack

- **Backend**: Node.js, Express 5.1.0, EJS
- **Database**: Azure SQL Database (MSSQL)
- **Tredjepartstjenester**: Stripe, Cloudinary, MailerSend, Twilio
- **Sikkerhed**: Helmet, CORS, Rate Limiting, JWT, bcrypt

