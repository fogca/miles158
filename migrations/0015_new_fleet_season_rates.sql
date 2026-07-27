-- Season multipliers were never added for the new fleet classes (0011/0012
-- introduced cls_suv_prado / cls_minivan_alphard without season_rates rows),
-- so loadRateMultiplier fell back to 1.0 year-round — summer/peak surcharges
-- silently disappeared. Mirror the multipliers used by the legacy classes.
INSERT INTO season_rates (id, class_id, season_id, multiplier) VALUES
  ('sr_fj_normal',    'cls_suv_prado',       'sea_normal',    1.0),
  ('sr_fj_summer',    'cls_suv_prado',       'sea_summer',    1.2),
  ('sr_fj_peak',      'cls_suv_prado',       'sea_peak',      1.5),
  ('sr_fj_superpeak', 'cls_suv_prado',       'sea_superpeak', 1.8),
  ('sr_al_normal',    'cls_minivan_alphard', 'sea_normal',    1.0),
  ('sr_al_summer',    'cls_minivan_alphard', 'sea_summer',    1.2),
  ('sr_al_peak',      'cls_minivan_alphard', 'sea_peak',      1.5),
  ('sr_al_superpeak', 'cls_minivan_alphard', 'sea_superpeak', 1.8);
