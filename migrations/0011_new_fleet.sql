-- Fleet swap (2026-07-07, client-confirmed): the outgoing Lexus LC500/LM500
-- are retired (see 0010) and replaced by two new vehicles. Pricing below is a
-- studio proposal based on market research — confirmed with the client at
-- Prado 38,000/day and Alphard 36,000/day; extension/CDW rates are scaled
-- proportionally to the existing GT/Luxury-Minivan classes' ratios. Deposit
-- follows the 80,000 flat rate set in 0008.

INSERT INTO vehicle_classes
  (id, code, name_ja, name_en, name_zh_hans, name_zh_hant,
   base_rate_24h, extra_24h, extra_1h, cdw_per_day, noc_waiver_per_day, deposit_amount, body_diagram, sort_order,
   created_at, updated_at)
VALUES
  ('cls_suv_prado', 'suv-prado', 'ラグジュアリーSUV', 'Luxury SUV', '豪华SUV', '豪華SUV',
   38000, 32000, 3500, 2800, 1650, 80000, 'suv', 3,
   '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('cls_minivan_alphard', 'minivan-alphard', 'プレミアムミニバン', 'Premium Minivan', '尊享商务车', '尊享商務車',
   36000, 30000, 3300, 2700, 1650, 80000, 'minivan', 4,
   '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z');

INSERT INTO vehicles
  (id, class_id, display_name, subtitle, registration_number, color, image_url, status, created_at, updated_at)
VALUES
  ('veh_prado_01', 'cls_suv_prado', 'Land Cruiser Prado VX', 'Adventure Tourer · 2.7L 4WD',
   '登録手続き中（プラド）', 'スモーキーブルー', '/images/LandCruiserPrado-VX.png', 'active',
   '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('veh_alphard_01', 'cls_minivan_alphard', 'Alphard Hybrid Z', 'Premium Lounge · Hybrid 7-Seater',
   '登録手続き中（アルファード）', 'ブラックマイカ', '/images/AlphardHybrid-Z.png', 'active',
   '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z');
