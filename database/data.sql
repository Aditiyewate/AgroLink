-- AgroLink Smart Agriculture Marketplace Seed Data (Maharashtra Focused)
-- Developed by R Tech Solutions
-- Password for all seed users is 'password123' (BCrypt: $2a$10$5FZ8Cc8XyfVmjg/criIM/O/h8y1cg2U4fcUekjhzg0iS9/RDe2pDq)

USE agrolink_db;

-- Clear old data in reverse dependency order
DELETE FROM complaints;
DELETE FROM weather;
DELETE FROM mandi_prices;
DELETE FROM storage_bookings;
DELETE FROM cold_storage;
DELETE FROM products;
DELETE FROM buyers;
DELETE FROM farmers;
DELETE FROM users;

-- 1. Populate Users
INSERT INTO users (id, email, password, role, active) VALUES
(1, 'farmer@agrolink.com', '$2a$10$5FZ8Cc8XyfVmjg/criIM/O/h8y1cg2U4fcUekjhzg0iS9/RDe2pDq', 'FARMER', TRUE),
(2, 'buyer@agrolink.com', '$2a$10$5FZ8Cc8XyfVmjg/criIM/O/h8y1cg2U4fcUekjhzg0iS9/RDe2pDq', 'BUYER', TRUE),
(3, 'storage@agrolink.com', '$2a$10$5FZ8Cc8XyfVmjg/criIM/O/h8y1cg2U4fcUekjhzg0iS9/RDe2pDq', 'COLD_STORAGE_MANAGER', TRUE),
(4, 'admin@agrolink.com', '$2a$10$5FZ8Cc8XyfVmjg/criIM/O/h8y1cg2U4fcUekjhzg0iS9/RDe2pDq', 'ADMIN', TRUE);

-- 2. Populate Farmers Profile (Maharashtra based)
INSERT INTO farmers (id, user_id, name, phone, state, district, farm_size_acres, upi_id) VALUES
(1, 1, 'Rajesh Kadam', '9876543210', 'Maharashtra', 'Nashik', 15.50, 'rajeshkadam@okaxis');

-- 3. Populate Buyers Profile (Maharashtra based)
INSERT INTO buyers (id, user_id, company_name, representative_name, phone, address, gstin) VALUES
(1, 2, 'Sahyadri Agro Distributors', 'Amit Patil', '9988776655', 'Market Yard, Pune, Maharashtra, IN', '27AAAAA1111A1Z1');

-- 4. Populate Products (Maharashtra staple crops)
INSERT INTO products (id, farmer_id, crop_name, variety, quantity_quintals, price_per_quintal, description, location, status) VALUES
(1, 1, 'Onion', 'Nasik Red', 120.00, 1850.00, 'Freshly harvested top-grade Nashik red onions. Well cured.', 'Nashik, Maharashtra', 'AVAILABLE'),
(2, 1, 'Grapes', 'Thomson Seedless', 40.00, 7500.00, 'Export quality sweet seedless green grapes directly from Nashik vineyard.', 'Nashik, Maharashtra', 'AVAILABLE'),
(3, 1, 'Sugarcane', 'Co 86032', 450.00, 310.00, 'High sugar recovery variety, harvested fresh on order.', 'Pune, Maharashtra', 'AVAILABLE'),
(4, 1, 'Soybean', 'JS 335', 80.00, 4600.00, 'Clean, sorted high oil content yellow soybeans.', 'Nagpur, Maharashtra', 'AVAILABLE');

-- 5. Populate Cold Storage (Maharashtra facilities)
INSERT INTO cold_storage (id, user_id, name, location, total_capacity_tons, available_capacity_tons, price_per_ton_day, description) VALUES
(1, 3, 'Sahyadri Mega Cold Storage', 'Pimpalgaon, Nashik', 1000.00, 850.00, 12.00, 'IoT-enabled high-capacity cold chain terminal specializing in grape and onion storage with humidity controls.');

-- 6. Populate Storage Bookings
INSERT INTO storage_bookings (id, farmer_id, cold_storage_id, quantity_tons, start_date, end_date, total_price, status) VALUES
(1, 1, 1, 15.00, '2026-06-01', '2026-06-30', 5400.00, 'APPROVED');

-- 7. Populate Mandi Prices (Maharashtra Markets)
INSERT INTO mandi_prices (id, crop_name, variety, market_name, state, price_per_quintal, price_change_yesterday) VALUES
(1, 'Onion', 'Nasik Red', 'Lasalgaon Mandi', 'Maharashtra', 1850.00, 45.00),
(2, 'Grapes', 'Thomson Seedless', 'Nashik Mandi', 'Maharashtra', 7500.00, -120.00),
(3, 'Sugarcane', 'Co 86032', 'Pune Mandi', 'Maharashtra', 310.00, 5.00),
(4, 'Soybean', 'JS 335', 'Nagpur Mandi', 'Maharashtra', 4600.00, 30.00),
(5, 'Alphonso Mango', 'Devgad', 'Mumbai APMC', 'Maharashtra', 12500.00, 250.00);

-- 8. Populate Weather Locations (Maharashtra weather points)
INSERT INTO weather (id, location, temperature_celsius, condition_text, humidity_percentage, rain_probability_percentage) VALUES
(1, 'Nashik, Maharashtra', 31.00, 'Sunny', 40, 5),
(2, 'Pune, Maharashtra', 29.00, 'Partly Cloudy', 55, 10),
(3, 'Nagpur, Maharashtra', 38.00, 'Hot', 25, 0);

-- 9. Populate Complaints
INSERT INTO complaints (id, user_id, title, description, status) VALUES
(1, 1, 'Weighment Dispute', 'Mandi digital scale variance found during onion unloading.', 'PENDING');
