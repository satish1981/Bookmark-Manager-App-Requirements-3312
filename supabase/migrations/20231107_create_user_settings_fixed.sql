-- Create user settings table for storing Straico API keys and preferences
-- This migration ensures the table exists with proper structure and permissions

-- Drop the table if it exists (for clean slate)
DROP TABLE IF EXISTS user_settings_bk4576hgty CASCADE;

-- Create the user_settings table
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

-- Drop all existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings_bk4576hgty;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings_bk4576hgty;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings_bk4576hgty;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings_bk4576hgty;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own settings" 
    ON user_settings_bk4576hgty FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
    ON user_settings_bk4576hgty FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
    ON user_settings_bk4576hgty FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
    ON user_settings_bk4576hgty FOR DELETE 
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
    ON user_settings_bk4576hgty(user_id);

CREATE INDEX IF NOT EXISTS idx_user_settings_api_key 
    ON user_settings_bk4576hgty(user_id) 
    WHERE straico_api_key IS NOT NULL;

-- Grant necessary permissions
GRANT ALL ON user_settings_bk4576hgty TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to check table existence (for our validation utility)
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO authenticated;

-- Create a function to execute SQL (for schema management)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function (be careful with this in production)
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;