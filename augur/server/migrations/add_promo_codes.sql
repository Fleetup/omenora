CREATE TABLE IF NOT EXISTS promo_codes (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code             text NOT NULL UNIQUE,
  code_type        text NOT NULL CHECK (code_type IN ('full_access', 'discount_percent')),
  code_subtype     text NOT NULL CHECK (code_subtype IN ('personal', 'campaign')),
  discount_value   integer DEFAULT 0,
  max_uses         integer NOT NULL DEFAULT 1,
  current_uses     integer NOT NULL DEFAULT 0,
  expires_at       timestamp with time zone,
  active           boolean NOT NULL DEFAULT true,
  recipient_label  text,
  prefix           text,
  notes            text,
  locked_to_email  text,
  created_at       timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_code_uses (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id   uuid REFERENCES promo_codes(id),
  email     text NOT NULL,
  used_at   timestamp with time zone DEFAULT now(),
  report_id uuid
);

CREATE INDEX IF NOT EXISTS idx_promo_code_uses_code_id
  ON promo_code_uses(code_id);

CREATE INDEX IF NOT EXISTS idx_promo_code_uses_email
  ON promo_code_uses(email);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code
  ON promo_codes(code);

CREATE INDEX IF NOT EXISTS idx_promo_codes_active
  ON promo_codes(active);
