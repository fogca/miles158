-- Deposit decision (2026-07-06): credit-card auth only, flat ¥50,000 for all
-- classes. Mainstream operators hold no deposit; premium norm is a 50k-450k
-- card hold. Max customer liability (対物免責5万+車両免責5万+NOC5万) is capped
-- by CDW/NOC-waiver options, so a 50k hold is sufficient and card-friendly.
UPDATE vehicle_classes SET deposit_amount = 50000;
