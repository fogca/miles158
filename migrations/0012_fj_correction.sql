-- Vehicle-identity correction (2026-07-07): the new vehicle is the Toyota
-- "Land Cruiser FJ" (single VX grade, launched 2026-05-14), not the larger
-- Land Cruiser Prado 250 as originally assumed. FJ is a smaller, more
-- affordable model positioned below Prado, so pricing is revised down from
-- the Prado-based estimate (client-confirmed: 38,000 -> 32,000/day). Class
-- rates below scale with the same ratios used in 0011 (extra_24h ~0.85x,
-- extra_1h ~0.09x, cdw ~0.075x of base).

UPDATE vehicle_classes
SET name_ja = 'ラグジュアリーSUV', base_rate_24h = 32000, extra_24h = 27000, extra_1h = 2900, cdw_per_day = 2400
WHERE id = 'cls_suv_prado';

UPDATE vehicles
SET display_name = 'Land Cruiser FJ VX',
    subtitle = 'Heritage Tourer · 2.7L 4WD',
    image_url = '/images/LandCruiserFJ-VX.png'
WHERE id = 'veh_prado_01';
