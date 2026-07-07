-- Mileage overage billing (2026-07-07 guideline): rentals include 300km/day of
-- free mileage; excess is billed at ¥55/km, recorded on the reservation at
-- return-time reconciliation.
ALTER TABLE reservations ADD COLUMN mileage_overage_km INTEGER;
ALTER TABLE reservations ADD COLUMN mileage_overage_amount INTEGER;
