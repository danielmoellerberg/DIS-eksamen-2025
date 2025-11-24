-- Indsæt demo-oplevelser i databasen
-- Dette sikrer at bookinger kan oprettes for disse oplevelser
-- Baseret på database-strukturen fra ERD-diagrammet

-- Oplevelse 1: Workshop i keramik
INSERT INTO experiences (title, description, image_url, affiliate_link, affiliate_partner_id, price_from, created_at, updated_at)
VALUES (
    'Workshop i keramik',
    'En hyggelig keramik workshop hvor du lærer grundlæggende teknikker.',
    'https://picsum.photos/600/400?random=1',
    NULL, -- affiliate_link kan være NULL
    NULL, -- affiliate_partner_id kan være NULL (eller sæt til eksisterende partner ID hvis nødvendigt)
    450.00,
    GETDATE(),
    GETDATE()
);

-- Oplevelse 2: Guidet naturtur
INSERT INTO experiences (title, description, image_url, affiliate_link, affiliate_partner_id, price_from, created_at, updated_at)
VALUES (
    'Guidet naturtur',
    'Kom med på en vandretur i naturen med en erfaren guide.',
    'https://picsum.photos/600/400?random=2',
    NULL,
    NULL,
    350.00,
    GETDATE(),
    GETDATE()
);

-- Oplevelse 3: Madlavningskursus
INSERT INTO experiences (title, description, image_url, affiliate_link, affiliate_partner_id, price_from, created_at, updated_at)
VALUES (
    'Madlavningskursus',
    'En lækker madoplevelse med fokus på autentisk italiensk madlavning.',
    'https://picsum.photos/600/400?random=3',
    NULL,
    NULL,
    600.00,
    GETDATE(),
    GETDATE()
);

-- Tjek at oplevelserne er blevet oprettet
SELECT id, title, price_from, created_at FROM experiences ORDER BY id;

