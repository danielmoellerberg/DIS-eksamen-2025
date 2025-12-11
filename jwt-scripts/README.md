# JWT Scripts - JSON Web Tokens

Denne mappe indeholder demonstrationer af JWT (JSON Web Tokens) til autorisation.
Scripts er baseret på forelæsningseksempler og tilpasset til Understory Marketplace.

## 📁 Scripts

| # | Fil | Beskrivelse |
|---|-----|-------------|
| 1 | `1-synchronous.js` | Synkron JWT signering/verificering (HS256) |
| 2 | `2-asynchronously.js` | Asynkron JWT med token udløb |
| 3 | `3-asymmetric.js` | JWT med RSA asymmetrisk signering (RS256) |
| 4 | `auth.js` | Praktisk auth utility til projektet |

## 🚀 Kør Scripts

```bash
node jwt-scripts/1-synchronous.js
node jwt-scripts/2-asynchronously.js
node jwt-scripts/3-asymmetric.js
node jwt-scripts/auth.js
```

## 📚 JWT Koncepter

### Symmetrisk (HS256)
- Samme secret til signering og verificering
- Hurtig og simpel
- Secret skal holdes hemmelig på server

### Asymmetrisk (RS256)
- Private key til signering
- Public key til verificering
- Mere sikker for distribuerede systemer

### Token Struktur
```
header.payload.signature

Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user:42", "role": "admin", "exp": 1234567890 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

## 💡 Praktisk brug i Understory

`auth.js` eksporterer funktioner der kan bruges i projektet:

```javascript
const { generateToken, verifyToken, authMiddleware } = require('./jwt-scripts/auth');

// Generer token ved login
const token = generateToken({ id: 42, email: 'user@example.com', role: 'admin' });

// Verificer token
const decoded = verifyToken(token);

// Beskyt routes med middleware
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

## 🔒 Sikkerhed

- Tokens gemmes i HTTP-only cookies (ikke localStorage)
- Tokens har udløbstid (expiresIn)
- Secret/keys gemmes i environment variables

