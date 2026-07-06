-- Transactional email log + idempotency guard.
-- UNIQUE(idempotency_key) makes a given email (e.g. a booking confirmation)
-- structurally un-double-sendable, even under cron at-least-once retries.
CREATE TABLE email_log (
  id                  TEXT PRIMARY KEY,
  idempotency_key     TEXT NOT NULL UNIQUE,          -- '<kind>/<code>[/<date>]'
  reservation_id      TEXT REFERENCES reservations(id),
  kind                TEXT NOT NULL
                      CHECK (kind IN ('booking_confirmation', 'cancellation',
                                      'reminder', 'staff_new_booking')),
  to_addr             TEXT NOT NULL,
  subject             TEXT NOT NULL,
  locale              TEXT NOT NULL DEFAULT 'ja',
  provider            TEXT NOT NULL,                 -- 'mock'|'resend'|'ses'
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id TEXT,
  error               TEXT,
  body                TEXT,                          -- text part (audit / resend)
  created_at          TEXT NOT NULL
);
CREATE INDEX idx_email_res ON email_log(reservation_id);
CREATE INDEX idx_email_kind ON email_log(kind);
