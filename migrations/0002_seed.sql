-- MILES 158 — seed data (real fleet: Lexus LC500 / LM500).
-- Prices are tax-exclusive JPY integers; adjust freely from the dashboard later.
-- No staff user is seeded: the first admin is bootstrapped at /dashboard/login.

-- ---- vehicle classes ----
INSERT INTO vehicle_classes
  (id, code, name_ja, name_en, name_zh_hans, name_zh_hant,
   base_rate_24h, extra_24h, extra_1h, cdw_per_day, noc_waiver_per_day, body_diagram, sort_order,
   created_at, updated_at)
VALUES
  ('cls_gt', 'gt', 'グランドツアラー', 'Grand Tourer', '豪华跑车', '豪華跑車',
   45000, 38000, 4000, 3300, 1650, 'coupe', 1,
   '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('cls_lux_minivan', 'luxury-minivan', 'ラグジュアリーミニバン', 'Luxury Minivan', '豪华商务车', '豪華商務車',
   60000, 52000, 5500, 3850, 1650, 'minivan', 2,
   '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z');

-- ---- vehicles ----
INSERT INTO vehicles
  (id, class_id, display_name, subtitle, registration_number, color, image_url, status, created_at, updated_at)
VALUES
  ('veh_lc500_01', 'cls_gt', 'Lexus LC500', 'Grand Tourer · V8 Coupé',
   '名古屋 358 わ 15-08', 'Sonic Quartz', '/images/LC500.png', 'active',
   '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('veh_lm500_01', 'cls_lux_minivan', 'Lexus LM500', 'Luxury Lounge · Chauffeured Minivan',
   '名古屋 358 わ 15-00', 'Sonic Chrome', '/images/LM500.png', 'active',
   '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z');

-- ---- option catalog (equipment / service; coverage is class-priced) ----
INSERT INTO option_catalog
  (id, code, name_ja, name_en, name_zh_hans, name_zh_hant, pricing_type, price_amount,
   max_quantity, preselect, category, active, sort_order, created_at, updated_at)
VALUES
  ('opt_child_seat', 'child_seat', 'チャイルドシート', 'Child Seat', '儿童座椅', '兒童座椅',
   'per_rental', 3300, 3, 0, 'equipment', 1, 1, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('opt_wifi', 'wifi', 'ポケットWi-Fi', 'Pocket Wi-Fi', '随身WiFi', '隨身WiFi',
   'per_day', 1100, 1, 0, 'equipment', 1, 2, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('opt_additional_driver', 'additional_driver', '追加運転者', 'Additional Driver', '附加驾驶员', '附加駕駛員',
   'per_rental', 2200, 3, 0, 'service', 1, 3, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),
  ('opt_airport_delivery', 'airport_delivery', '空港デリバリー', 'Airport Delivery', '机场送车', '機場送車',
   'per_rental', 5500, 1, 0, 'service', 1, 4, '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z');

-- ---- seasons ----
INSERT INTO seasons (id, code, name_ja, sort_order) VALUES
  ('sea_normal', 'normal', '通常期', 1),
  ('sea_summer', 'summer', '夏季', 2),
  ('sea_peak', 'peak', '繁忙期', 3),
  ('sea_superpeak', 'superpeak', '超繁忙期', 4);

INSERT INTO season_periods (id, season_id, start_date, end_date, priority) VALUES
  ('sp_summer_2026', 'sea_summer', '2026-07-01', '2026-08-31', 1),
  ('sp_gw_2026', 'sea_peak', '2026-04-29', '2026-05-06', 2),
  ('sp_obon_2026', 'sea_peak', '2026-08-08', '2026-08-17', 2),
  ('sp_nye_2026', 'sea_superpeak', '2026-12-27', '2027-01-04', 3);

INSERT INTO season_rates (id, class_id, season_id, multiplier) VALUES
  ('sr_gt_normal', 'cls_gt', 'sea_normal', 1.0),
  ('sr_gt_summer', 'cls_gt', 'sea_summer', 1.2),
  ('sr_gt_peak', 'cls_gt', 'sea_peak', 1.5),
  ('sr_gt_superpeak', 'cls_gt', 'sea_superpeak', 1.8),
  ('sr_lm_normal', 'cls_lux_minivan', 'sea_normal', 1.0),
  ('sr_lm_summer', 'cls_lux_minivan', 'sea_summer', 1.2),
  ('sr_lm_peak', 'cls_lux_minivan', 'sea_peak', 1.5),
  ('sr_lm_superpeak', 'cls_lux_minivan', 'sea_superpeak', 1.8);

-- ---- duration discounts ----
INSERT INTO duration_discounts (id, min_days, rate_percent, active) VALUES
  ('dd_3', 3, 5, 1),
  ('dd_7', 7, 10, 1);

-- ---- cancellation policy (standard) ----
INSERT INTO cancellation_policies
  (id, policy_name, version, effective_from, no_show_fee_percent, active)
VALUES
  ('pol_standard', 'Standard', 1, '2026-06-23T00:00:00.000Z', 100, 1);

INSERT INTO cancellation_rules
  (id, policy_id, hours_before_min, hours_before_max, fee_percent, fee_cap_jpy, sort_order)
VALUES
  ('cr_sameday', 'pol_standard', 0, 24, 50, NULL, 1),    -- same day
  ('cr_1to2d', 'pol_standard', 24, 72, 30, NULL, 2),     -- 1-2 days before
  ('cr_3to6d', 'pol_standard', 72, 168, 20, NULL, 3),    -- 3-6 days before
  ('cr_7plus', 'pol_standard', 168, NULL, 0, NULL, 4);   -- 7+ days before (free)

-- ---- delivery zones / fees ----
INSERT INTO delivery_zones (id, code, name_ja) VALUES
  ('dz_nagoya', 'nagoya-city', '名古屋市内'),
  ('dz_airport', 'chubu-airport', '中部国際空港');

INSERT INTO delivery_fees (id, from_zone, to_zone, fee) VALUES
  ('df_ngo_airport', 'dz_nagoya', 'dz_airport', 8800),
  ('df_airport_ngo', 'dz_airport', 'dz_nagoya', 8800);
