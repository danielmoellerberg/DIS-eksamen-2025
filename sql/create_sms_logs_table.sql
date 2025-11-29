-- Opret sms_logs tabel til at logge alle SMS beskeder
-- Kør denne fil i Azure SQL Database for at oprette SMS logging

CREATE TABLE sms_logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    booking_id INT NULL, -- Kan være NULL hvis SMS ikke er relateret til en specifik booking
    phone_number NVARCHAR(50) NOT NULL, -- Telefonnummer (modtager eller afsender)
    message_body NVARCHAR(500) NOT NULL, -- SMS indhold
    direction NVARCHAR(10) NOT NULL, -- 'outbound' (udgående) eller 'inbound' (indgående)
    twilio_message_sid NVARCHAR(100) NULL, -- Twilio Message SID for tracking
    status NVARCHAR(50) NULL, -- 'sent', 'delivered', 'failed', 'received'
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Opret index for bedre performance ved søgninger på booking_id
CREATE INDEX idx_sms_logs_booking_id ON sms_logs(booking_id);

-- Opret index for bedre performance ved søgninger på telefonnummer
CREATE INDEX idx_sms_logs_phone_number ON sms_logs(phone_number);

-- Opret index for bedre performance ved søgninger på direction
CREATE INDEX idx_sms_logs_direction ON sms_logs(direction);

-- Opret index for bedre performance ved søgninger på created_at (for rapportering)
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at);

-- Kommentar:
-- Denne tabel logger alle SMS beskeder (både udgående og indgående)
-- booking_id kan være NULL hvis SMS ikke er relateret til en booking
-- direction = 'outbound' for SMS vi sender, 'inbound' for SMS vi modtager
-- twilio_message_sid bruges til at tracke beskeder i Twilio dashboard

