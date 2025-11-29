-- Tilføj email og password_hash kolonner til affiliate_partners tabellen

-- Tilføj email kolonne
ALTER TABLE affiliate_partners
ADD email NVARCHAR(255) NULL;

-- Tilføj password_hash kolonne
ALTER TABLE affiliate_partners
ADD password_hash NVARCHAR(255) NULL;

-- Opret et unikt index på email (så vi ikke kan have duplicate emails)
CREATE UNIQUE INDEX IX_affiliate_partners_email ON affiliate_partners(email);

-- Vis resultat
SELECT * FROM affiliate_partners;

