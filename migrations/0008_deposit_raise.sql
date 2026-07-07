-- Deposit revision (2026-07-07): client-approved guideline update raises the
-- flat security deposit hold from ¥50,000 to ¥80,000 for all classes.
UPDATE vehicle_classes SET deposit_amount = 80000;
