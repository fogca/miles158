-- MILES 158 — initial schema (full P0/P1/P2 surface defined up-front).
-- Conventions:
--   * money: JPY integer, tax-exclusive at storage; tax computed in pricing layer.
--   * slot dates: 'YYYY-MM-DD' in JST (single timezone operation).
--   * timestamps: ISO 8601 UTC TEXT.
--   * ids: crypto.randomUUID() generated in the app layer.
-- Tables are ordered so foreign-key targets exist before referrers.

-- ============================================================
-- Vehicle classes & units
-- ============================================================
CREATE TABLE vehicle_classes (
  id                  TEXT PRIMARY KEY,
  code                TEXT NOT NULL UNIQUE,        -- 'gt' | 'luxury-minivan' | ...
  name_ja             TEXT NOT NULL,
  name_en             TEXT,
  name_zh_hans        TEXT,
  name_zh_hant        TEXT,
  base_rate_24h       INTEGER NOT NULL,            -- tax-excl, normal season, first 24h
  extra_24h           INTEGER NOT NULL,            -- each additional 24h (cheaper than first)
  extra_1h            INTEGER NOT NULL,            -- hourly overflow
  cdw_per_day         INTEGER NOT NULL DEFAULT 0,  -- collision damage waiver (class-priced)
  noc_waiver_per_day  INTEGER NOT NULL DEFAULT 0,  -- non-operation-charge waiver (class-priced)
  body_diagram        TEXT,                        -- 'coupe' | 'sedan' | 'suv' | 'minivan'
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE TABLE vehicles (
  id                  TEXT PRIMARY KEY,
  class_id            TEXT NOT NULL REFERENCES vehicle_classes(id),
  display_name        TEXT NOT NULL,               -- 'Lexus LC500'
  subtitle            TEXT,                         -- 'Grand Tourer · V8 Coupé'
  registration_number TEXT NOT NULL UNIQUE,        -- 「わ/れ」number (legal rental ledger)
  vin                 TEXT,
  color               TEXT,
  insurance_policy_no TEXT,
  image_url           TEXT,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'maintenance', 'retired')),
  photo_urls          TEXT,                         -- JSON array (R2 urls)
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  deleted_at          TEXT
);
CREATE INDEX idx_vehicles_class ON vehicles(class_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ============================================================
-- Customers & drivers (embeds legal rental-ledger fields)
-- ============================================================
CREATE TABLE customers (
  id                  TEXT PRIMARY KEY,
  name_family         TEXT NOT NULL,
  name_given          TEXT NOT NULL,
  name_display        TEXT,
  email               TEXT,
  phone               TEXT,
  address             TEXT,                         -- ledger: renter address
  nationality         TEXT,                         -- ISO country code
  preferred_locale    TEXT NOT NULL DEFAULT 'ja',
  license_kind        TEXT,                         -- 'jp'|'idp_geneva'|'translation'|'hk_macau_idp'
  license_number      TEXT,
  license_type        TEXT,                         -- ledger: license category
  license_expiry      TEXT,
  passport_number     TEXT,
  entry_date          TEXT,                         -- entry to Japan (1-year rule)
  idp_issuing_country TEXT,
  idp_issue_date      TEXT,
  idp_expiry_date     TEXT,
  wechat_openid       TEXT,                         -- P2 booking funnel
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  deleted_at          TEXT
);
CREATE INDEX idx_customers_email ON customers(email);

CREATE TABLE drivers (
  id                  TEXT PRIMARY KEY,
  customer_id         TEXT NOT NULL REFERENCES customers(id),
  name_family         TEXT NOT NULL,
  name_given          TEXT NOT NULL,
  address             TEXT NOT NULL,                -- ledger: driver address
  license_type        TEXT NOT NULL,                -- ledger: license category
  license_number      TEXT NOT NULL,                -- ledger: license number
  created_at          TEXT NOT NULL
);
CREATE INDEX idx_drivers_customer ON drivers(customer_id);

-- ============================================================
-- Cancellation policy (data-driven; snapshotted onto reservations)
-- ============================================================
CREATE TABLE cancellation_policies (
  id                  TEXT PRIMARY KEY,
  policy_name         TEXT NOT NULL,
  version             INTEGER NOT NULL DEFAULT 1,
  effective_from      TEXT NOT NULL,
  effective_until     TEXT,
  no_show_fee_percent INTEGER NOT NULL DEFAULT 100,
  active              INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE cancellation_rules (
  id                  TEXT PRIMARY KEY,
  policy_id           TEXT NOT NULL REFERENCES cancellation_policies(id),
  hours_before_min    INTEGER NOT NULL,             -- interval [min, max) hours before pickup
  hours_before_max    INTEGER,                      -- NULL = infinity
  fee_percent         INTEGER NOT NULL CHECK (fee_percent BETWEEN 0 AND 100),
  fee_cap_jpy         INTEGER,                      -- NULL = no cap
  sort_order          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_cr_policy ON cancellation_rules(policy_id);

-- ============================================================
-- Reservations (master) + status history
-- ============================================================
CREATE TABLE reservations (
  id                     TEXT PRIMARY KEY,
  code                   TEXT NOT NULL UNIQUE,      -- human-readable 'M158-...'
  status                 TEXT NOT NULL DEFAULT 'draft',
  origin                 TEXT NOT NULL DEFAULT 'web', -- 'web'|'staff'|'wechat'|'phone'
  vehicle_id             TEXT REFERENCES vehicles(id),
  class_id               TEXT REFERENCES vehicle_classes(id),
  customer_id            TEXT REFERENCES customers(id),
  -- ledger: office / route / passengers / mileage / accident
  pickup_office          TEXT NOT NULL DEFAULT 'nagoya',
  return_office          TEXT NOT NULL DEFAULT 'nagoya',
  route_destination      TEXT,
  passenger_count        INTEGER,
  mileage_start_km       INTEGER,
  mileage_end_km         INTEGER,
  fuel_start             INTEGER,                   -- 0..8 eighths
  fuel_end               INTEGER,
  accident_notes         TEXT,
  -- schedule (JST input -> UTC stored)
  pickup_scheduled_at    TEXT,
  return_scheduled_at    TEXT,
  -- pricing snapshot (frozen at quote/confirm time)
  price_snapshot         TEXT,                      -- JSON full breakdown
  base_amount            INTEGER,
  options_amount         INTEGER,
  subtotal               INTEGER,
  tax_amount             INTEGER,
  total_amount           INTEGER,
  deposit_amount         INTEGER,                   -- authorization hold (card)
  cancellation_fee       INTEGER DEFAULT 0,
  cancellation_policy_id TEXT REFERENCES cancellation_policies(id),
  -- coverage selections (priced from vehicle_classes)
  cdw_selected           INTEGER NOT NULL DEFAULT 0,
  noc_waiver_purchased   INTEGER NOT NULL DEFAULT 0,
  -- consent
  terms_agreed_at        TEXT,
  consent_edoc_at        TEXT,
  -- lifecycle timestamps
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  quoted_at              TEXT,
  held_at                TEXT,
  held_expires_at        TEXT,
  paid_at                TEXT,
  confirmed_at           TEXT,
  checked_out_at         TEXT,
  returned_at            TEXT,
  completed_at           TEXT,
  cancelled_at           TEXT,
  no_show_at             TEXT,
  -- sub-flags expressed as columns (avoid extra states)
  extension_requested_at TEXT,
  extension_approved_at  TEXT,
  overstay_flagged_at    TEXT,
  notes                  TEXT
);
CREATE INDEX idx_res_status ON reservations(status);
CREATE INDEX idx_res_vehicle ON reservations(vehicle_id);
CREATE INDEX idx_res_pickup ON reservations(pickup_scheduled_at);
CREATE INDEX idx_res_held_exp ON reservations(status, held_expires_at);

CREATE TABLE reservation_status_history (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  from_status         TEXT,
  to_status           TEXT NOT NULL,
  triggered_by        TEXT NOT NULL,               -- 'customer'|'staff:<id>'|'cron'|'webhook'
  reason              TEXT,
  created_at          TEXT NOT NULL
);
CREATE INDEX idx_rsh_res ON reservation_status_history(reservation_id);

-- ============================================================
-- Daily slots — the double-booking guard
-- ============================================================
CREATE TABLE reservation_days (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  vehicle_id          TEXT NOT NULL REFERENCES vehicles(id),
  date                TEXT NOT NULL,               -- 'YYYY-MM-DD' JST
  type                TEXT NOT NULL DEFAULT 'rental'
                      CHECK (type IN ('rental', 'buffer', 'maintenance', 'blackout')),
  UNIQUE (vehicle_id, date)                        -- structural double-booking exclusion
);
CREATE INDEX idx_rd_vehicle_date ON reservation_days(vehicle_id, date);
CREATE INDEX idx_rd_res ON reservation_days(reservation_id);
CREATE INDEX idx_rd_date ON reservation_days(date);

-- ============================================================
-- Options catalog (equipment/service add-ons; coverage is class-priced)
-- ============================================================
CREATE TABLE option_catalog (
  id                  TEXT PRIMARY KEY,
  code                TEXT NOT NULL UNIQUE,
  name_ja             TEXT NOT NULL,
  name_en             TEXT,
  name_zh_hans        TEXT,
  name_zh_hant        TEXT,
  pricing_type        TEXT NOT NULL CHECK (pricing_type IN ('per_rental', 'per_day')),
  price_amount        INTEGER NOT NULL,            -- tax-excl
  max_quantity        INTEGER NOT NULL DEFAULT 1,
  preselect           INTEGER NOT NULL DEFAULT 0,
  category            TEXT,                         -- 'equipment'|'service'
  active              INTEGER NOT NULL DEFAULT 1,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE TABLE booking_options (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  option_id           TEXT NOT NULL REFERENCES option_catalog(id),
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price          INTEGER NOT NULL,            -- snapshot at booking
  pricing_type        TEXT NOT NULL,
  line_amount         INTEGER NOT NULL
);
CREATE INDEX idx_bo_res ON booking_options(reservation_id);

-- ============================================================
-- Seasons / pricing rules
-- ============================================================
CREATE TABLE seasons (
  id                  TEXT PRIMARY KEY,
  code                TEXT NOT NULL UNIQUE,        -- 'normal'|'summer'|'peak'|'superpeak'
  name_ja             TEXT NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE season_periods (
  id                  TEXT PRIMARY KEY,
  season_id           TEXT NOT NULL REFERENCES seasons(id),
  start_date          TEXT NOT NULL,               -- 'YYYY-MM-DD' JST
  end_date            TEXT NOT NULL,
  priority            INTEGER NOT NULL DEFAULT 0   -- higher wins on overlap
);
CREATE INDEX idx_sp_dates ON season_periods(start_date, end_date);

CREATE TABLE season_rates (
  id                  TEXT PRIMARY KEY,
  class_id            TEXT NOT NULL REFERENCES vehicle_classes(id),
  season_id           TEXT NOT NULL REFERENCES seasons(id),
  multiplier          REAL NOT NULL,
  UNIQUE (class_id, season_id)
);

CREATE TABLE duration_discounts (
  id                  TEXT PRIMARY KEY,
  min_days            INTEGER NOT NULL,
  rate_percent        INTEGER NOT NULL,
  active              INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- Blackouts / maintenance (expanded into reservation_days for locking)
-- ============================================================
CREATE TABLE blackouts (
  id                  TEXT PRIMARY KEY,
  vehicle_id          TEXT REFERENCES vehicles(id), -- NULL = all vehicles
  start_date          TEXT NOT NULL,
  end_date            TEXT NOT NULL,
  reason              TEXT,
  created_by          TEXT,
  created_at          TEXT NOT NULL
);

-- ============================================================
-- Payments / refunds / webhook idempotency
-- ============================================================
CREATE TABLE payments (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  provider            TEXT NOT NULL,               -- 'mock'|'stripe'
  method              TEXT NOT NULL,               -- 'card'|'wechat'|'alipay'
  kind                TEXT NOT NULL DEFAULT 'rental', -- 'rental'|'deposit'|'extension'|'noc'|'overstay'
  intent_id           TEXT,
  status              TEXT NOT NULL,               -- 'requires_capture'|'authorized'|'captured'|'refunded'|'released'|'failed'
  authorized_amount   INTEGER,
  captured_amount     INTEGER,
  deposit_amount      INTEGER,
  refunded_amount     INTEGER DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'jpy',
  capture_before      TEXT,                        -- auth expiry (card JPY up to 30d)
  client_secret       TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);
CREATE INDEX idx_pay_res ON payments(reservation_id);
CREATE INDEX idx_pay_intent ON payments(intent_id);

CREATE TABLE refunds (
  id                  TEXT PRIMARY KEY,
  payment_id          TEXT NOT NULL REFERENCES payments(id),
  amount              INTEGER NOT NULL,
  reason              TEXT,                         -- 'cancellation'|'deposit_release'|'damage_adjust'
  status              TEXT NOT NULL,               -- 'pending'|'succeeded'|'failed'
  provider_ref        TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);
CREATE INDEX idx_refund_payment ON refunds(payment_id);

CREATE TABLE webhook_events (
  event_id            TEXT PRIMARY KEY,            -- provider event id (idempotency)
  provider            TEXT NOT NULL,
  type                TEXT,
  processed_at        TEXT NOT NULL,
  payload             TEXT
);

-- ============================================================
-- Inspections / damages (check-in/out)
-- ============================================================
CREATE TABLE inspections (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  kind                TEXT NOT NULL CHECK (kind IN ('checkout', 'checkin')),
  fuel_level          INTEGER,                      -- 0..8 eighths
  mileage_km          INTEGER,
  body_marks          TEXT,                         -- JSON: SVG coords of damage marks
  signature_url       TEXT,
  staff_id            TEXT,
  notes               TEXT,
  created_at          TEXT NOT NULL
);
CREATE INDEX idx_insp_res ON inspections(reservation_id);

CREATE TABLE inspection_photos (
  id                  TEXT PRIMARY KEY,
  inspection_id       TEXT NOT NULL REFERENCES inspections(id),
  r2_url              TEXT NOT NULL,
  sort_order          INTEGER,
  created_at          TEXT NOT NULL
);

CREATE TABLE damages (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  description         TEXT,
  self_drivable       INTEGER,                      -- NOC determination
  noc_amount          INTEGER,
  estimate_amount     INTEGER,
  insurance_claim_status TEXT,
  status              TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

-- ============================================================
-- One-way / delivery fees
-- ============================================================
CREATE TABLE delivery_zones (
  id                  TEXT PRIMARY KEY,
  code                TEXT NOT NULL UNIQUE,
  name_ja             TEXT NOT NULL
);
CREATE TABLE delivery_fees (
  id                  TEXT PRIMARY KEY,
  from_zone           TEXT NOT NULL REFERENCES delivery_zones(id),
  to_zone             TEXT NOT NULL REFERENCES delivery_zones(id),
  fee                 INTEGER NOT NULL,
  UNIQUE (from_zone, to_zone)
);

-- ============================================================
-- Staff / auth / audit
-- ============================================================
CREATE TABLE staff_users (
  id                  TEXT PRIMARY KEY,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,               -- PBKDF2 (Web Crypto)
  name                TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'staff'
                      CHECK (role IN ('admin', 'manager', 'staff')),
  active              INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  deleted_at          TEXT
);

CREATE TABLE staff_sessions (
  id                  TEXT PRIMARY KEY,            -- session token (hashed)
  staff_id            TEXT NOT NULL REFERENCES staff_users(id),
  expires_at          TEXT NOT NULL,
  created_at          TEXT NOT NULL,
  ip                  TEXT,
  user_agent          TEXT
);
CREATE INDEX idx_sess_staff ON staff_sessions(staff_id);

CREATE TABLE audit_log (
  id                  TEXT PRIMARY KEY,
  actor               TEXT NOT NULL,               -- 'staff:<id>'|'customer'|'cron'|'webhook'
  action              TEXT NOT NULL,
  entity              TEXT NOT NULL,
  entity_id           TEXT,
  before              TEXT,
  after               TEXT,
  ip                  TEXT,
  created_at          TEXT NOT NULL
);
CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================================
-- Customer-facing flow scratch session
-- ============================================================
CREATE TABLE reserve_sessions (
  id                  TEXT PRIMARY KEY,            -- stored in cookie
  data                TEXT NOT NULL,               -- JSON per-step input
  reservation_id      TEXT,                         -- linked after HELD
  expires_at          TEXT NOT NULL,
  created_at          TEXT NOT NULL
);

-- ============================================================
-- Qualified invoices (インボイス)
-- ============================================================
CREATE TABLE invoices (
  id                  TEXT PRIMARY KEY,
  reservation_id      TEXT NOT NULL REFERENCES reservations(id),
  invoice_number      TEXT NOT NULL UNIQUE,
  registration_number TEXT NOT NULL,               -- T + 13 digits
  issued_at           TEXT,
  pdf_url             TEXT,
  created_at          TEXT NOT NULL
);
