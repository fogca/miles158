-- New fleet imagery (2026-07): compressed WebP product shots replace the
-- placeholder PNG paths referenced since 0011/0012.
UPDATE vehicles SET image_url = '/images/LandCruiserFJ-VX.webp' WHERE id = 'veh_prado_01';
UPDATE vehicles SET image_url = '/images/AlphardHybrid-Z.webp' WHERE id = 'veh_alphard_01';
