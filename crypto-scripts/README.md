# Crypto Scripts - Node.js Kryptografi

Denne mappe indeholder demonstrationer af Node.js `crypto` modulet til kryptografiske operationer.
Scripts er baseret på forelæsningseksempler og tilpasset til Understory Marketplace projektet.

## 📁 Scripts

| # | Fil | Beskrivelse |
|---|-----|-------------|
| 1 | `1-symmetric.js` | Symmetrisk kryptering med AES-256-CBC |
| 2 | `2-asymmetric.js` | Asymmetrisk kryptering med RSA |
| 3 | `3-hashing.js` | Hashing med SHA-256 |
| 4 | `4-signature.js` | Digital signering med RSA-SHA256 |
| 5 | `5-salt.js` | Salt + hashing med rounds |
| 6 | `6-password.js` | Password verification med salt |

## 🚀 Kør Scripts

```bash
node crypto-scripts/1-symmetric.js
node crypto-scripts/2-asymmetric.js
node crypto-scripts/3-hashing.js
node crypto-scripts/4-signature.js
node crypto-scripts/5-salt.js
node crypto-scripts/6-password.js
```

## 📚 Koncepter

### 1. Symmetrisk Kryptering (AES-256-CBC)
- Samme nøgle til kryptering og dekryptering
- AES = Advanced Encryption Standard
- 256-bit nøgle = 32 bytes
- CBC = Cipher Block Chaining (kræver IV)

### 2. Asymmetrisk Kryptering (RSA)
- Public key til kryptering
- Private key til dekryptering
- Bruges til sikker udveksling af data

### 3. Hashing (SHA-256)
- Envejs-transformation
- Fast output længde (256 bits = 64 hex chars)
- Bruges til data integritet

### 4. Digital Signering
- Private key til at signere
- Public key til at verificere
- Beviser autenticitet

### 5. Salt
- Tilfældig værdi tilføjet til password
- Forhindrer rainbow table attacks
- Gør samme password til forskellig hash

### 6. Password Verification
- Gem salt + hash i database
- Ved login: hash input med samme salt
- Sammenlign hashes

## 💡 Praktisk anvendelse i Understory

| Koncept | Bruges til |
|---------|------------|
| Hashing | Password hashing (bcrypt i models/) |
| Salt | Automatisk i bcrypt |
| Signering | Twilio webhook validering |
| Kryptering | Sensitiv data i database |
