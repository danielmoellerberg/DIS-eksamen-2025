-- Tilføj reminder-felter til bookings tabel
-- Kør denne fil i Azure SQL Database for at tilføje SMS reminder funktionalitet

-- Tilføj reminder_sent felt (BIT = 0 eller 1, default 0 = ikke sendt)
ALTER TABLE bookings
ADD reminder_sent BIT DEFAULT 0;

-- Tilføj reminder_response felt (kan være 'yes', 'no', eller NULL)
ALTER TABLE bookings
ADD reminder_response NVARCHAR(10) NULL;

-- Tilføj reminder_response_date felt (dato/tid for når kunden svarede)
ALTER TABLE bookings
ADD reminder_response_date DATETIME2 NULL;

-- Opret index for bedre performance ved søgninger på reminder_sent
CREATE INDEX idx_bookings_reminder_sent ON bookings(reminder_sent);

-- Kommentar: 
-- reminder_sent = 0 betyder SMS ikke sendt endnu
-- reminder_sent = 1 betyder SMS er sendt
-- reminder_response = 'yes' eller 'no' når kunden har svaret
-- reminder_response_date = tidspunkt for svar

