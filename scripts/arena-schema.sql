-- HobbyX Arena (run once, or let the app auto-migrate on first request)
CREATE TABLE IF NOT EXISTS arena_suggestions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  video_url TEXT
);

CREATE TABLE IF NOT EXISTS arena_votes (
  suggestion_id TEXT NOT NULL REFERENCES arena_suggestions(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (suggestion_id, voter_id)
);

CREATE INDEX IF NOT EXISTS arena_suggestions_category_idx ON arena_suggestions (category_slug);
CREATE INDEX IF NOT EXISTS arena_votes_voter_idx ON arena_votes (voter_id);
