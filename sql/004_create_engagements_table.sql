-- VERSERTILE Phase 1 - Engagement/Interactions Table
-- Stores user engagement with content

CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  engagement_type VARCHAR(50) NOT NULL, -- 'read', 'like', 'share', 'comment', 'rate'
  duration_seconds INT, -- For reading engagement
  rating_value INT CHECK (rating_value >= 1 AND rating_value <= 5), -- For ratings
  comment_text TEXT, -- For comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagements_user_id ON engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_engagements_work_id ON engagements(work_id);
CREATE INDEX IF NOT EXISTS idx_engagements_type ON engagements(engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagements_created_at ON engagements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagements_user_work ON engagements(user_id, work_id);

-- Comments
COMMENT ON TABLE engagements IS 'Tracks user engagement with creative works';
COMMENT ON COLUMN engagements.engagement_type IS 'Type of engagement: read, like, share, comment, rate';
COMMENT ON COLUMN engagements.duration_seconds IS 'Reading duration for engagement tracking';
