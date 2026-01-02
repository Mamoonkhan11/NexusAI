-- Create user_api_keys table
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_key TEXT,
  gemini_key TEXT,
  claude_key TEXT,
  groq_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id (one record per user)
ALTER TABLE user_api_keys ADD CONSTRAINT user_api_keys_user_id_key UNIQUE (user_id);

-- Create index for upsert operations
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_api_keys_user_id_unique ON user_api_keys(user_id);

-- Create index on user_id for faster queries
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);

-- Enable RLS
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own API keys
CREATE POLICY "Users can view their own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own API keys
CREATE POLICY "Users can insert their own API keys" ON user_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own API keys
CREATE POLICY "Users can update their own API keys" ON user_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own API keys
CREATE POLICY "Users can delete their own API keys" ON user_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
