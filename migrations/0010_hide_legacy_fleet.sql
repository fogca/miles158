-- Hide legacy fleet from customer-facing availability (2026-07-07 guideline).
-- Not a deletion: dashboard vehicle management still lists them (it only
-- filters on deleted_at), and `retired` is already excluded from
-- findAvailableVehicles' `status = 'active'` filter.
UPDATE vehicles SET status = 'retired' WHERE id IN ('veh_lc500_01', 'veh_lm500_01');
