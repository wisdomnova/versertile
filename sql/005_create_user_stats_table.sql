-- VERSERTILE Phase 1 - User Statistics Table
-- Cached aggregated user stats for performance

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_analyses INT DEFAULT 0,
  total_works INT DEFAULT 0,
  total_published_works INT DEFAULT 0,
  total_engagement_count INT DEFAULT 0,
  total_reads INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  total_ratings INT DEFAULT 0,
  average_poem_score DECIMAL(5,2),
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  reputation_score INT DEFAULT 0,
  total_earnings DECIMAL(20,8) DEFAULT 0, -- For token earnings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Comments
COMMENT ON TABLE user_stats IS 'Aggregated user statistics for dashboard display';
COMMENT ON COLUMN user_stats.reputation_score IS 'Community reputation based on quality and engagement';
COMMENT ON COLUMN user_stats.total_earnings IS 'Total $VERSE tokens earned (Phase 2+)';
