-- Create user settings table for storing Straico API keys and preferences
CREATE TABLE IF NOT EXISTS user_settings_bk4576hgty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  straico_api_key TEXT,
  straico_model_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- Enable row-level security
ALTER TABLE user_settings_bk4576hgty ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select their own settings
CREATE POLICY "Users can view their own settings" 
  ON user_settings_bk4576hgty
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own settings" 
  ON user_settings_bk4576hgty
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own settings
CREATE POLICY "Users can update their own settings" 
  ON user_settings_bk4576hgty
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own settings
CREATE POLICY "Users can delete their own settings" 
  ON user_settings_bk4576hgty
  FOR DELETE
  USING (auth.uid() = user_id);