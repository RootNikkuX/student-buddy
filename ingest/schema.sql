-- Student Buddy ingestion database (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS opportunities (
  id            TEXT PRIMARY KEY,          -- hash of title + source host, so re-scrapes update the same row
  title         TEXT NOT NULL,
  type          TEXT NOT NULL,             -- hackathon | internship | job | scholarship | competition | workshop | other
  org           TEXT,
  deadline      TEXT,                      -- YYYY-MM-DD or NULL
  deadline_text TEXT,                      -- deadline as written on the page
  eligibility   TEXT,
  pay           TEXT,                      -- stipend, prize or fee
  location      TEXT,                      -- city, Remote or Online
  description   TEXT,
  source_url    TEXT NOT NULL,             -- the opportunity's own page
  source_page   TEXT,                      -- the listing page the agent scraped
  status        TEXT NOT NULL DEFAULT 'open',   -- open | closed
  hidden        INTEGER NOT NULL DEFAULT 0,     -- set to 1 to hide a bad row without deleting it
  first_seen    TEXT NOT NULL,
  last_seen     TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_opp_type     ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opp_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opp_status   ON opportunities(status, hidden);

CREATE TABLE IF NOT EXISTS sources (        -- pages the agent scrapes (filled from SOURCES in src/sources.js)
  url          TEXT PRIMARY KEY,
  name         TEXT,
  type_hint    TEXT,
  enabled      INTEGER NOT NULL DEFAULT 1,
  last_started TEXT,
  last_ok      TEXT,
  last_error   TEXT
);

CREATE TABLE IF NOT EXISTS runs (           -- TinyFish agent runs in flight or finished
  run_id      TEXT PRIMARY KEY,
  source_url  TEXT NOT NULL,
  started_at  TEXT NOT NULL,
  state       TEXT NOT NULL DEFAULT 'running',  -- running | done | failed | timeout
  n_items     INTEGER NOT NULL DEFAULT 0,
  error       TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_state ON runs(state);
