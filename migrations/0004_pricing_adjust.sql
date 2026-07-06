-- Lower base rates to ~¥30k. Weekend (Fri/Sat/Sun) surcharge is applied in the
-- pricing layer (day-of-week), separate from the date-range season multipliers.
UPDATE vehicle_classes SET base_rate_24h = 30000, extra_24h = 25000 WHERE code = 'gt';
UPDATE vehicle_classes SET base_rate_24h = 40000, extra_24h = 34000 WHERE code = 'luxury-minivan';
