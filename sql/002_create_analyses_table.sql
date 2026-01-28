-- VERSERTILE Phase 1 - Analyses Table
-- Stores P.O.E.M. engine analysis results

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text_content TEXT NOT NULL,
  text_length INT NOT NULL,
  originality_score INT NOT NULL CHECK (originality_score >= 0 AND originality_score <= 100),
  quality_score INT NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  expression_score INT NOT NULL CHECK (expression_score >= 0 AND expression_score <= 100),
  overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  feedback TEXT[] DEFAULT '{}',
  plagiarism_check JSONB,
  sentiment TEXT,
  language_code VARCHAR(5) DEFAULT 'en',
  processing_time_ms INT,
  model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_published BOOLEAN DEFAULT false
);

-- Indexes for performance and querying
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_overall_score ON analyses(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_is_published ON analyses(is_published);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);

-- Comments for documentation
COMMENT ON TABLE analyses IS 'P.O.E.M. engine analysis results and scores';
COMMENT ON COLUMN analyses.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN analyses.text_content IS 'Full text content that was analyzed';
COMMENT ON COLUMN analyses.originality_score IS 'AI-scored originality (0-100)';
COMMENT ON COLUMN analyses.quality_score IS 'AI-scored quality (0-100)';
COMMENT ON COLUMN analyses.expression_score IS 'AI-scored expression/creativity (0-100)';
COMMENT ON COLUMN analyses.overall_score IS 'Weighted average of all scores (0-100)';
COMMENT ON COLUMN analyses.plagiarism_check IS 'Plagiarism detection results (JSON)';
COMMENT ON COLUMN analyses.model_version IS 'AI model version used for analysis';
