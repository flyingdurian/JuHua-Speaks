-- Milestone 8.0 reference PostgreSQL migration. NOT applied to a production DB.
-- Designed for eventual authenticated and explicitly consented reading-history storage.
-- All RLS policies are intentionally withheld until an auth provider is selected:
-- enabling RLS without policies DENIES ordinary users, preventing accidental public reads.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS deck_catalog(
 deck_id text PRIMARY KEY, display_name jsonb NOT NULL,
 card_count smallint NOT NULL CHECK(card_count=78),
 rights_status text NOT NULL CHECK(rights_status IN('public-domain','custom-licensed','private-only','unavailable')),
 asset_version text NOT NULL, source_attribution text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reader_catalog(
 reader_id text PRIMARY KEY, display_name jsonb NOT NULL, definition_version text NOT NULL,
 enabled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions(
 session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_user_id uuid, -- external authenticated principal; never trust owner ID from client
 session_version integer NOT NULL DEFAULT 1,
 current_phase text NOT NULL DEFAULT 'landing',
 locale text NOT NULL CHECK(locale IN('en','zh')),
 deck_id text NOT NULL REFERENCES deck_catalog(deck_id),
 deck_asset_version text NOT NULL,
 reader_id text NOT NULL REFERENCES reader_catalog(reader_id),
 reader_version text NOT NULL,
 spread_id text NOT NULL,
 question_text text CHECK(char_length(question_text)<=600),
 options jsonb NOT NULL DEFAULT '[]'::jsonb,
 -- rows are created in persistent storage only after explicit user request and informed consent
 user_requested_save boolean NOT NULL DEFAULT false CHECK(user_requested_save=true),
 save_consent_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS sessions_owner_recent ON sessions(owner_user_id,created_at DESC)
 WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS readings(
 reading_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN('main','followup')),
 request_id uuid, reader_id text NOT NULL REFERENCES reader_catalog(reader_id),
 reader_definition_version text NOT NULL, engine_id text NOT NULL,
 state text NOT NULL CHECK(state IN('pending','ready','failed','canceled')),
 structured_response jsonb, question_snapshot text CHECK(char_length(question_snapshot)<=600),
 created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 UNIQUE(session_id,request_id)
);
CREATE INDEX IF NOT EXISTS readings_session_recent ON readings(session_id,created_at);
CREATE TABLE IF NOT EXISTS reading_cards(
 session_id uuid NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
 draw_index smallint NOT NULL CHECK(draw_index BETWEEN 1 AND 3),
 card_id text NOT NULL, position_id text NOT NULL,
 orientation text NOT NULL CHECK(orientation IN('upright','reversed')),
 locked_at timestamptz NOT NULL, revealed_at timestamptz,
 PRIMARY KEY(session_id,draw_index), UNIQUE(session_id,card_id), UNIQUE(session_id,position_id)
);
CREATE TABLE IF NOT EXISTS guidance(
 guidance_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
 main_reading_id uuid NOT NULL REFERENCES readings(reading_id) ON DELETE CASCADE,
 guidance_question text NOT NULL CHECK(char_length(guidance_question) BETWEEN 3 AND 600),
 card_id text NOT NULL, orientation text NOT NULL CHECK(orientation IN('upright','reversed')),
 locked_at timestamptz NOT NULL, revealed_at timestamptz,
 reading_response jsonb, state text NOT NULL CHECK(state IN('locked','revealed','ready','failed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id,card_id)
);
CREATE TABLE IF NOT EXISTS intent_metadata(
 session_id uuid PRIMARY KEY REFERENCES sessions(session_id) ON DELETE CASCADE,
 intent_category text NOT NULL CHECK(intent_category IN('career','love','growth','decision','study','family','general')),
 confidence_bucket text CHECK(confidence_bucket IN('low','medium','high')),
 classifier_version text NOT NULL, observation_consent boolean NOT NULL DEFAULT false,
 consent_at timestamptz, coarse_tags text[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(NOT observation_consent OR consent_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS intent_metadata_category ON intent_metadata(intent_category)
 WHERE observation_consent;
CREATE TABLE IF NOT EXISTS session_events(
 session_id uuid NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
 ordinal integer NOT NULL CHECK(ordinal>0),
 phase text NOT NULL, event_type text NOT NULL,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 occurred_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(session_id,ordinal)
);
-- Explicit owner-scoped auth/RLS policies, exports, deletion jobs, encryption, and retention
-- are mandatory before deploying the database. No anonymous broad policies.
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
COMMIT;
