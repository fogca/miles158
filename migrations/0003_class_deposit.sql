-- Security deposit (authorization hold) per vehicle class. Data-driven so it can
-- be tuned from the dashboard. Premium fleet => higher holds.
ALTER TABLE vehicle_classes ADD COLUMN deposit_amount INTEGER NOT NULL DEFAULT 100000;

UPDATE vehicle_classes SET deposit_amount = 200000 WHERE code = 'gt';
UPDATE vehicle_classes SET deposit_amount = 300000 WHERE code = 'luxury-minivan';
