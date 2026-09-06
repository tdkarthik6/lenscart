-- LensCraft Photography Booking Platform
-- MySQL Migration: Initial Schema

CREATE DATABASE IF NOT EXISTS lenscraft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lenscraft_db;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  role ENUM('CUSTOMER', 'OWNER') NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INT NOT NULL DEFAULT 60,
  image_url TEXT,
  included_features JSON,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_price_positive CHECK (price >= 0),
  CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0),
  INDEX idx_services_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  service_id INT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(500),
  notes TEXT,
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  CONSTRAINT chk_valid_time_range CHECK (start_time < end_time),
  INDEX idx_bookings_date (event_date),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_customer (customer_id),
  INDEX idx_bookings_service (service_id),
  INDEX idx_bookings_date_time (event_date, start_time, end_time),
  INDEX idx_bookings_date_status (event_date, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
