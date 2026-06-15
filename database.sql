-- SnackCheck database schema for Supabase
-- Run this in the Supabase SQL Editor (Database > SQL Editor > New query)

CREATE TABLE ratings (
  id            BIGINT PRIMARY KEY,
  user_id       UUID   REFERENCES auth.users(id) NOT NULL,
  product_code  TEXT   NOT NULL,
  brand         TEXT   NOT NULL,
  name          TEXT   NOT NULL,
  flavor        TEXT   NOT NULL,
  category      TEXT   NOT NULL,
  score         INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  pros          TEXT[] DEFAULT '{}',
  cons          TEXT[] DEFAULT '{}',
  image         TEXT,
  timestamp     BIGINT NOT NULL,
  rater         TEXT   NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: anyone can read, only the owner can insert/delete
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert own ratings"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE USING (auth.uid() = user_id);
