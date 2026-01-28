-- VERSERTILE Phase 1 - Utility Functions
-- Production-ready stored procedures and functions

-- Function to update user's last_login timestamp
CREATE OR REPLACE FUNCTION update_user_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or update user stats
CREATE OR REPLACE FUNCTION upsert_user_stats(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_stats (user_id) 
  VALUES (user_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment work view count
CREATE OR REPLACE FUNCTION increment_work_view_count(work_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE works SET view_count = view_count + 1 WHERE id = work_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_details JSONB,
  p_ip_address INET,
  p_user_agent TEXT
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO audit_id;
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate overall score from components
CREATE OR REPLACE FUNCTION calculate_overall_score(
  originality INT,
  quality INT,
  expression INT
)
RETURNS INT AS $$
BEGIN
  -- Weighted average: originality 40%, quality 35%, expression 25%
  RETURN ROUND((originality * 0.4 + quality * 0.35 + expression * 0.25))::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_works_updated_at ON works;
CREATE TRIGGER update_works_updated_at BEFORE UPDATE ON works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
