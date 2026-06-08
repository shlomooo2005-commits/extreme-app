-- HobbyX competition submissions + hybrid security (run once or auto-migrate)
CREATE TABLE IF NOT EXISTS competition_submissions (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  user_id TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  challenge_title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_public_id TEXT NOT NULL,
  sha256 TEXT,
  source TEXT NOT NULL CHECK (source IN ('app_camera', 'external')),
  status TEXT NOT NULL CHECK (
    status IN (
      'pending_fingerprint',
      'active',
      'flagged_duplicate',
      'rejected'
    )
  ),
  fingerprint_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  fingerprint_matched_platform TEXT,
  fingerprint_scanned_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS competition_submissions_category_status_idx
  ON competition_submissions (category_slug, status);

CREATE INDEX IF NOT EXISTS competition_submissions_competition_idx
  ON competition_submissions (competition_id);

CREATE INDEX IF NOT EXISTS competition_submissions_sha256_idx
  ON competition_submissions (sha256)
  WHERE sha256 IS NOT NULL;

-- TikTok-style feed engagement (impressions + likes for ranking)
CREATE TABLE IF NOT EXISTS feed_engagement (
  clip_id TEXT PRIMARY KEY,
  category_slug TEXT NOT NULL,
  competition_id TEXT NOT NULL,
  submission_id TEXT,
  impressions INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  seed_likes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feed_engagement_category_idx
  ON feed_engagement (category_slug);

CREATE TABLE IF NOT EXISTS feed_clip_likes (
  clip_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (clip_id, voter_id)
);
