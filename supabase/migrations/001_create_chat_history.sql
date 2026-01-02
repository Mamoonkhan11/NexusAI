-- Create chat_history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own chat history
CREATE POLICY "Users can view their own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own chat history
CREATE POLICY "Users can insert their own chat history" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own chat history
CREATE POLICY "Users can update their own chat history" ON chat_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own chat history
CREATE POLICY "Users can delete their own chat history" ON chat_history
  FOR DELETE USING (auth.uid() = user_id);
