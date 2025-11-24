-- Slet demo-oplevelser fra databasen
-- Kør dette script når admin-siden er klar og du vil fjerne test-data

-- Først: Slet alle bookinger tilknyttet demo-oplevelserne (hvis nogen)
DELETE FROM bookings 
WHERE experience_id IN (
    SELECT id FROM experiences 
    WHERE title IN ('Workshop i keramik', 'Guidet naturtur', 'Madlavningskursus')
);

-- Derefter: Slet demo-oplevelserne
DELETE FROM experiences 
WHERE title IN ('Workshop i keramik', 'Guidet naturtur', 'Madlavningskursus');

-- Verificer at de er slettet
SELECT * FROM experiences ORDER BY id;

