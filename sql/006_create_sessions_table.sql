-- VERSERTILE Phase 1 - Session/Audit Table
-- For tracking user sessions and audit logs

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address INET,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  logout_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Comments
COMMENT ON TABLE sessions IS 'User session tracking for authentication';
COMMENT ON COLUMN sessions.session_token IS 'Unique session identifier';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration timestamp';
