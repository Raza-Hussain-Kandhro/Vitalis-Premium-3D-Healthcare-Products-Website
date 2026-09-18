-- =====================================================================
-- Vitalis — PostgreSQL schema (equivalent to api/_lib/schema.js)
-- Run in Neon SQL Editor / Supabase SQL Editor, or use `npm run db:push`.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;

-- ------------------------- enums -------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('monitoring', 'diagnostics', 'respiratory', 'recovery', 'consumables');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM ('new', 'in_review', 'responded', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gallery_category AS ENUM ('facility', 'product', 'deployment', 'team');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------- users + profiles -------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          user_role    NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name       VARCHAR(160) NOT NULL,
  registration_id VARCHAR(40) UNIQUE,           -- e.g. CSD231054
  organization    VARCHAR(160),
  phone           VARCHAR(32),
  avatar_url      TEXT,                          -- external object storage URL only
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------- catalogue -------------------------
CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(120)  NOT NULL UNIQUE,
  name              VARCHAR(160)  NOT NULL,
  category          product_category NOT NULL,
  short_description TEXT          NOT NULL,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency          VARCHAR(3)    NOT NULL DEFAULT 'USD',
  rating            NUMERIC(2,1)  DEFAULT 4.8 CHECK (rating BETWEEN 0 AND 5),
  badge             VARCHAR(40),
  certifications    JSONB         NOT NULL DEFAULT '[]'::jsonb,
  specs             JSONB         NOT NULL DEFAULT '{}'::jsonb,
  image_url         TEXT,
  in_stock          BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order        INTEGER       NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);

CREATE TABLE IF NOT EXISTS gallery_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(160) NOT NULL,
  caption    TEXT,
  category   gallery_category NOT NULL,
  image_url  TEXT,
  tone       VARCHAR(120),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gallery_category_idx ON gallery_items (category);

-- ------------------------- lead capture -------------------------
CREATE TABLE IF NOT EXISTS enquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    VARCHAR(160) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  phone        VARCHAR(32),
  organization VARCHAR(160),
  interest     VARCHAR(80),
  message      TEXT NOT NULL,
  status       enquiry_status NOT NULL DEFAULT 'new',
  source_ip    VARCHAR(64),
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS appointments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      VARCHAR(160) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(32)  NOT NULL,
  organization   VARCHAR(160),
  interest       VARCHAR(80),
  preferred_date TIMESTAMPTZ  NOT NULL,
  message        TEXT,
  status         appointment_status NOT NULL DEFAULT 'requested',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments (preferred_date);

CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  source     VARCHAR(60)  NOT NULL DEFAULT 'home-cta',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------- core domain entity -------------------------
CREATE TABLE IF NOT EXISTS app_records (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  status     VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS app_records_user_idx ON app_records (user_id);

-- =====================================================================
-- OPTIONAL: Row Level Security — only needed if the browser talks to
-- Postgres directly (e.g. Supabase client). Our API uses a service
-- connection and enforces ownership in api/_lib/auth.js, so enable these
-- only when you also expose the DB to the client.
-- =====================================================================
-- ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE app_records ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "User profile isolation" ON profiles
--   FOR ALL USING (auth.uid() = id);
-- CREATE POLICY "Record ownership" ON app_records
--   FOR ALL USING (auth.uid() = user_id);
