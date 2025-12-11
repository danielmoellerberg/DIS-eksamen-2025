# Authentication Implementation - Sikkerhedsgennemgang

## Oversigt
Dette dokument beskriver de ændringer der er lavet for at implementere hybrid authentication (session cookies + JWT tokens) som beskrevet i projektbeskrivelsen.

## ✅ Implementerede ændringer

### 1. JWT Token Generation
- ✅ `userController.js` - Tilføjet JWT token generation ved login
- ✅ `adminController.js` - Allerede havde JWT token generation
- ✅ `affiliatePartnerController.js` - Allerede havde JWT token generation

**Alle tre brugertyper genererer nu både session og JWT token ved login.**

### 2. Hybrid Authentication Middleware
- ✅ Oprettet `utils/authMiddleware.js` med:
  - `requireAuth()` - Accepterer både session (web) og JWT (API)
  - `requireJWT()` - Kun JWT tokens (API)
  - `requireSession()` - Kun sessions (web)
  - `requireRole()` - Rollebaseret adgangskontrol

### 3. Route Protection

#### Beskyttede Routes (kræver authentication):
- ✅ `/api/users` (GET) - Hent alle brugere
- ✅ `/api/users/:id` (GET) - Hent bruger ved ID
- ✅ `/api/users/:id/password` (PUT) - Opdater password
- ✅ `/api/admins/*` (alle routes) - Kræver admin rolle
- ✅ `/api/bookings` (POST) - Opret booking via API
- ✅ `/api/experiences` (POST) - Opret oplevelse (kræver affiliate rolle)

#### Offentlige Routes (ingen authentication):
- ✅ `/api/users` (POST) - Opret bruger (registrering)
- ✅ `/api/users/login` - Login
- ✅ `/api/users/logout` - Logout
- ✅ `/api/users/forgot-password` - Password reset request
- ✅ `/api/users/reset-password` - Password reset
- ✅ `/api/admins/login` - Admin login
- ✅ `/api/admins/logout` - Admin logout
- ✅ `/api/bookings/available/:id` (GET) - Hent tilgængelige datoer (offentlig)
- ✅ `/api/bookings/create-and-redirect` (POST) - Opret booking via form (offentlig)
- ✅ `/api/payment/create-checkout-session` (POST) - Opret Stripe session (offentlig, validerer booking ID)
- ✅ `/api/payment/webhook` (POST) - Stripe webhook (ingen auth, Stripe signerer)
- ✅ `/api/experiences` (GET) - Hent alle oplevelser (offentlig)

## 🔒 Sikkerhedsaspekter

### Session Cookies
- ✅ `httpOnly: true` - Forhindrer XSS angreb
- ✅ `sameSite: "strict"` - Forhindrer CSRF angreb
- ✅ `secure: true` i produktion - Kun HTTPS

### JWT Tokens
- ✅ HS256 algoritme (symmetrisk)
- ✅ Issuer validation (`understory-marketplace`)
- ✅ Expiration time (24 timer for users/affiliate, 1 time for admin)
- ✅ Secret fra environment variable

### Hybrid Approach
- ✅ Sessions til webbaserede komponenter (form submissions, redirects)
- ✅ JWT tokens til API-orienterede komponenter (fetch requests)
- ✅ Middleware prioriterer JWT hvis begge er til stede (API-first)

## ⚠️ Potentielle problemer og løsninger

### 1. Payment Checkout Session
**Problem:** Oprindeligt beskyttet med `requireAuth`, men kaldes fra offentlig side uden authentication.

**Løsning:** Fjernet authentication. Endpoint er sikkert fordi:
- Booking ID valideres i controlleren
- Booking skal eksistere i databasen
- Kun booking ID er nødvendigt (ikke bruger authentication)

### 2. Booking API Endpoint
**Status:** `/api/bookings` (POST) er nu beskyttet med `requireAuth`.

**Note:** Dette endpoint bliver ikke brugt i frontend (kun `/api/bookings/create-and-redirect` bruges). 
Hvis du har eksterne API klienter der skal bruge dette endpoint, skal de sende JWT token i Authorization header.

### 3. Frontend Integration
**Status:** Frontend kode i `payment.ejs` og `book.ejs` virker korrekt:
- `payment.ejs` kalder `/api/payment/create-checkout-session` (nu offentlig) ✅
- `book.ejs` kalder `/api/bookings/available/:id` (offentlig) ✅
- `book.ejs` submitter form til `/api/bookings/create-and-redirect` (offentlig) ✅

### 4. Affiliate Partner Routes
**Status:** Hybrid implementation - accepterer både session (web) og JWT (API).

## 🧪 Test Checklist

Før du deployer, test følgende:

### User Authentication
- [ ] User kan oprette konto (POST `/api/users`)
- [ ] User kan logge ind (POST `/api/users/login`) - skal returnere både session og JWT token
- [ ] User kan hente egne data (GET `/api/users/:id`) med JWT token
- [ ] User kan hente egne data (GET `/api/users/:id`) med session cookie
- [ ] User kan opdatere password (PUT `/api/users/:id/password`) med authentication

### Admin Authentication
- [ ] Admin kan logge ind (POST `/api/admins/login`) - skal returnere både session og JWT token
- [ ] Admin kan hente alle admins (GET `/api/admins`) med JWT token + admin rolle
- [ ] Admin kan oprette ny admin (POST `/api/admins`) med authentication

### Booking Flow
- [ ] Offentlig booking form virker (`/api/bookings/create-and-redirect`)
- [ ] Payment checkout session virker (`/api/payment/create-checkout-session`)
- [ ] API booking endpoint virker med JWT token (`POST /api/bookings`)

### Affiliate Partner
- [ ] Affiliate kan logge ind via web (session)
- [ ] Affiliate kan logge ind via API (JWT token)
- [ ] Affiliate kan oprette oplevelse med authentication

## 📝 Environment Variables

Sørg for at have følgende environment variables sat:

```env
SESSION_SECRET=din-session-secret-her
JWT_SECRET=din-jwt-secret-her  # Kan være samme som SESSION_SECRET
```

**Vigtigt:** I produktion skal disse være forskellige, stærke secrets!

## 🔄 Bagudkompatibilitet

**Alle ændringer er bagudkompatible:**
- Eksisterende session-baserede flows virker stadig
- Nye JWT token flows er tilføjet uden at bryde eksisterende funktionalitet
- Offentlige endpoints forbliver offentlige

## 📚 Yderligere dokumentation

- Se `jwt-scripts/README.md` for JWT koncepter
- Se `utils/authMiddleware.js` for middleware dokumentation
- Se `PROJEKTBESKRIVELSE.md` for projektbeskrivelse
