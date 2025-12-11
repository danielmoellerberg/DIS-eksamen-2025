# Stripe Webhook Opsætning

## Oversigt

Stripe webhooks er nu implementeret i projektet. Dette giver mere robust betalingshåndtering ved at:

- Automatisk opdatere booking status når betalinger gennemføres
- Håndtere betalinger selv hvis brugeren lukker browseren
- Sende bookingbekræftelser automatisk
- Undgå duplicate opdateringer (idempotency)

## Webhook Endpoint

Webhook endpoint: `https://projectdis.app/api/payment/webhook`

## Opsætning i Stripe Dashboard

### 1. Gå til Stripe Dashboard
1. Log ind på [Stripe Dashboard](https://dashboard.stripe.com)
2. Gå til **Developers** → **Webhooks**

### 2. Opret ny webhook endpoint
1. Klik på **"Add endpoint"**
2. Indtast webhook URL: `https://projectdis.app/api/payment/webhook`
3. Vælg events der skal sendes:
   - ✅ `checkout.session.completed` (vigtigst - når betaling gennemføres)
   - ✅ `payment_intent.succeeded` (valgfri)
   - ✅ `payment_intent.payment_failed` (valgfri - for fejlhåndtering)
   - ✅ `charge.refunded` (valgfri - hvis I vil håndtere refunds)

### 3. Få webhook signing secret
1. Efter oprettelse, klik på webhook endpoint
2. Find **"Signing secret"** (starter med `whsec_...`)
3. Kopier denne secret

### 4. Tilføj til .env fil
Tilføj følgende til jeres `.env` fil på serveren:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 5. Genstart server
Efter at have tilføjet `STRIPE_WEBHOOK_SECRET`, genstart PM2:

```bash
pm2 restart all --update-env
```

## Test Webhook

### Test i Stripe Dashboard
1. Gå til webhook endpoint i Stripe Dashboard
2. Klik på **"Send test webhook"**
3. Vælg event type: `checkout.session.completed`
4. Klik **"Send test webhook"**
5. Tjek server logs for at se om webhook blev modtaget

### Test med Stripe CLI (valgfri)
Hvis I har Stripe CLI installeret:

```bash
stripe listen --forward-to https://projectdis.app/api/payment/webhook
```

## Hvordan det virker

### Flow med webhook:
1. Kunde betaler via Stripe Checkout
2. Stripe sender webhook til `/api/payment/webhook`
3. Webhook verificerer signature (sikkerhed)
4. Webhook opdaterer booking status til "confirmed"
5. Webhook sender bookingbekræftelse email
6. Kunde bliver redirectet til success page (som også virker)

### Fallback (hvis webhook fejler):
- Success page verificerer session_id med Stripe API
- Success page opdaterer booking hvis ikke allerede gjort
- Success page sender email hvis ikke allerede sendt

## Sikkerhed

- ✅ Webhook signature verificering (kunne ikke implementeres uden)
- ✅ Idempotency checks (undgår duplicate opdateringer)
- ✅ Session verificering på success page (ekstra sikkerhed)

## Troubleshooting

### Webhook modtages ikke
- Tjek at `STRIPE_WEBHOOK_SECRET` er sat i `.env`
- Tjek at webhook URL er korrekt i Stripe Dashboard
- Tjek server logs for fejl

### "Webhook signature verificering fejlede"
- Tjek at `STRIPE_WEBHOOK_SECRET` matcher det fra Stripe Dashboard
- Tjek at webhook endpoint bruger raw body (allerede implementeret)

### Booking opdateres ikke
- Tjek server logs for webhook events
- Tjek at bookingId findes i session metadata
- Tjek at booking status ikke allerede er "confirmed"

## Noter

- Webhooks og success page arbejder sammen - begge kan opdatere booking
- Idempotency checks sikrer at booking kun opdateres én gang
- Email sendes kun én gang (tjekker om booking allerede var confirmed)

