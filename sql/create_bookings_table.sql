-- Opret bookings tabel til at gemme booking information
CREATE TABLE bookings (
    id INT PRIMARY KEY IDENTITY(1,1),
    experience_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NULL,
    customer_name NVARCHAR(255) NOT NULL,
    customer_email NVARCHAR(255) NOT NULL,
    customer_phone NVARCHAR(50) NULL,
    number_of_participants INT DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (experience_id) REFERENCES experiences(id)
);

-- Opret index for bedre performance ved søgninger på datoer
CREATE INDEX idx_bookings_experience_date ON bookings(experience_id, booking_date);

-- Opret index for status queries
CREATE INDEX idx_bookings_status ON bookings(status);

