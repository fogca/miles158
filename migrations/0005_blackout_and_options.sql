-- Sentinel reservation that owns staff "company-unavailable" (blackout) days.
-- Blackout days become reservation_days rows (type='blackout') pointing here, so
-- they share the UNIQUE(vehicle_id, date) double-booking guard and show as × to
-- customers, without polluting the real reservation lifecycle.
INSERT INTO reservations (id, code, status, origin, created_at, updated_at)
VALUES ('res_blackout_system', '__BLACKOUT__', 'blackout', 'staff',
        '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z');

-- Off-hours add-ons (appear automatically in the /reserve options step).
INSERT INTO option_catalog
  (id, code, name_ja, name_en, name_zh_hans, name_zh_hant, pricing_type, price_amount,
   max_quantity, preselect, category, active, sort_order, created_at, updated_at)
VALUES
  ('opt_early_pickup', 'early_pickup', '早朝受け取り（営業時間前）', 'Early Pickup', '早间取车', '早間取車',
   'per_rental', 3300, 1, 0, 'service', 1, 5, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('opt_night_return', 'night_return', '夜間返却（営業時間後）', 'Late-night Return', '夜间还车', '夜間還車',
   'per_rental', 3300, 1, 0, 'service', 1, 6, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z');
