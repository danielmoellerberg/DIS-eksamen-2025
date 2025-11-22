# DIS-eksamen-2025

## Krav
- Node.js 20+
- npm 10+
- Adgang til en PostgreSQL/MSSQL database (valgfrie features)

## Lokal udvikling
1. Kopiér `.env.example` til `.env` og udfyld nøgler til DB, mail og Twilio.
2. Installer afhængigheder:
   ```bash
   npm install
   ```
3. Start serveren:
   ```bash
   npm run dev
   ```
4. Applikationen er nu tilgængelig på `http://localhost:3000`.

## Deployment på Ubuntu droplet
1. SSH til droplet:
   ```bash
   ssh ubuntu@161.35.76.75
   ```
2. Installer værktøjer:
   ```bash
   sudo apt update
   sudo apt install -y git curl build-essential
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pm2
   ```
3. Hent koden:
   ```bash
   git clone https://github.com/din-org/DIS-eksamen-2025.git
   cd DIS-eksamen-2025
   npm install
   ```
4. Opsæt miljøvariabler:
   ```bash
   cp .env.example .env
   nano .env
   ```
5. Åbn firewall for port 3000 (eller brug Nginx som reverse proxy):
   ```bash
   sudo ufw allow 3000/tcp
   ```
6. Start serveren med PM2 så den kører i baggrunden:
   ```bash
   pm2 start server.js --name understory
   pm2 save
   pm2 startup
   ```
7. Test:
   ```bash
   curl http://161.35.76.75:3000/status
   ```

Serveren lytter nu på `0.0.0.0`, så den kan tilgås fra din IP eller et Nginx-domæne.