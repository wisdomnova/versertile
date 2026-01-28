-- VERSERTILE Phase 1 - Works Table
-- Stores published creative works

CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  content_length INT NOT NULL,
  genre VARCHAR(100),
  language_code VARCHAR(5) DEFAULT 'en',
  poem_score INT CHECK (poem_score >= 0 AND poem_score <= 100),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  rating_average DECIMAL(3,2),
  rating_count INT DEFAULT 0,
  nft_minted BOOLEAN DEFAULT false,
  nft_contract_address VARCHAR(255),
  nft_token_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_works_user_id ON works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_is_published ON works(is_published);
CREATE INDEX IF NOT EXISTS idx_works_is_featured ON works(is_featured);
CREATE INDEX IF NOT EXISTS idx_works_poem_score ON works(poem_score DESC);
CREATE INDEX IF NOT EXISTS idx_works_created_at ON works(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_works_published_at ON works(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_works_user_published ON works(user_id, is_published);
CREATE INDEX IF NOT EXISTS idx_works_genre ON works(genre);

-- Comments for documentation
COMMENT ON TABLE works IS 'Published creative works on VERSERTILE platform';
COMMENT ON COLUMN works.analysis_id IS 'Link to original P.O.E.M. analysis if applicable';
COMMENT ON COLUMN works.poem_score IS 'P.O.E.M. overall score at time of publication';
COMMENT ON COLUMN works.nft_minted IS 'Whether work has been minted as NFT';
COMMENT ON COLUMN works.nft_contract_address IS 'Smart contract address on blockchain';
