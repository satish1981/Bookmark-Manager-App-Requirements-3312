-- Debug and fix user settings table
-- First, let's check if the table exists and its structure

-- Drop and recreate the table with proper structure
DROP TABLE IF EXISTS user_settings_bk4576hgty CASCADE;

-- Create user settings table for storing Straico API keys and preferences
CREATE TABLE user_settings_bk4576hgty (
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

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings_bk4576hgty;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings_bk4576hgty;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings_bk4576hgty;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings_bk4576hgty;

-- Create policies
-- Allow users to select their own settings
CREATE POLICY "Users can view their own settings" 
    ON user_settings_bk4576hgty FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own settings" 
    ON user_settings_bk4576hgty FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own settings
CREATE POLICY "Users can update their own settings" 
    ON user_settings_bk4576hgty FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own settings
CREATE POLICY "Users can delete their own settings" 
    ON user_settings_bk4576hgty FOR DELETE 
    USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
    ON user_settings_bk4576hgty(user_id);

-- Grant necessary permissions
GRANT ALL ON user_settings_bk4576hgty TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;