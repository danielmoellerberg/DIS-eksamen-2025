-- Opdater experiences tabellen med manglende kolonner

-- Tilføj location kolonne (hvor foregår oplevelsen)
ALTER TABLE experiences
ADD location NVARCHAR(255) NULL;

-- Tilføj duration_hours kolonne (varighed i timer, f.eks. 2.5)
ALTER TABLE experiences
ADD duration_hours DECIMAL(4,1) NULL;

-- Tilføj category kolonne (kategori som tekst)
ALTER TABLE experiences
ADD category NVARCHAR(100) NULL;

-- Tilføj available_dates kolonne (JSON eller tekst med tilgængelige datoer - OPTIONAL)
-- Dette felt kan bruges hvis en experience kun er tilgængelig på specifikke datoer
-- Ellers kan vi bruge bookings systemet til at håndtere alle datoer
ALTER TABLE experiences
ADD available_dates NVARCHAR(MAX) NULL;

-- Tilføj status kolonne (active, inactive, draft)
ALTER TABLE experiences
ADD status NVARCHAR(50) DEFAULT 'active' NULL;

-- Opdater eksisterende rækker med default værdier
UPDATE experiences
SET 
    location = 'Ikke angivet',
    duration_hours = 2.0,
    category = 'Andet',
    status = 'active'
WHERE location IS NULL;

-- Vis resultat
SELECT 
    id, 
    title, 
    location, 
    duration_hours, 
    category,
    price_from,
    status,
    affiliate_partner_id,
    created_at
FROM experiences;

