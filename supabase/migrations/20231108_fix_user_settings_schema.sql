-- Fix user_settings table schema by adding missing columns
-- This migration adds the missing smart_selector_preference column and other enhanced features

-- First, let's check if the columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add smart_selector_preference column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_settings_bk4576hgty' 
                   AND column_name = 'smart_selector_preference') THEN
        ALTER TABLE user_settings_bk4576hgty 
        ADD COLUMN smart_selector_preference TEXT DEFAULT 'quality';
    END IF;

    -- Add use_smart_selector column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_settings_bk4576hgty' 
                   AND column_name = 'use_smart_selector') THEN
        ALTER TABLE user_settings_bk4576hgty 
        ADD COLUMN use_smart_selector BOOLEAN DEFAULT true;
    END IF;

    -- Add generation_preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_settings_bk4576hgty' 
                   AND column_name = 'generation_preferences') THEN
        ALTER TABLE user_settings_bk4576hgty 
        ADD COLUMN generation_preferences JSONB DEFAULT '{}';
    END IF;

    -- Add api_usage_stats column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_settings_bk4576hgty' 
                   AND column_name = 'api_usage_stats') THEN
        ALTER TABLE user_settings_bk4576hgty 
        ADD COLUMN api_usage_stats JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_smart_selector 
ON user_settings_bk4576hgty(user_id, use_smart_selector);

CREATE INDEX IF NOT EXISTS idx_user_settings_generation_prefs 
ON user_settings_bk4576hgty(user_id) 
WHERE generation_preferences IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_settings_bk4576hgty.smart_selector_preference IS 'User preference for smart model selection: quality, balance, or budget';
COMMENT ON COLUMN user_settings_bk4576hgty.use_smart_selector IS 'Whether user prefers smart model selection over manual selection';
COMMENT ON COLUMN user_settings_bk4576hgty.generation_preferences IS 'JSON object storing user preferences for AI generation parameters';
COMMENT ON COLUMN user_settings_bk4576hgty.api_usage_stats IS 'JSON object tracking API usage statistics and costs';

-- Add constraint for smart_selector_preference
ALTER TABLE user_settings_bk4576hgty 
ADD CONSTRAINT check_smart_selector_preference 
CHECK (smart_selector_preference IN ('quality', 'balance', 'budget'));

-- Update any existing rows to have default values
UPDATE user_settings_bk4576hgty 
SET smart_selector_preference = 'quality' 
WHERE smart_selector_preference IS NULL;

UPDATE user_settings_bk4576hgty 
SET use_smart_selector = true 
WHERE use_smart_selector IS NULL;

UPDATE user_settings_bk4576hgty 
SET generation_preferences = '{}' 
WHERE generation_preferences IS NULL;

UPDATE user_settings_bk4576hgty 
SET api_usage_stats = '{}' 
WHERE api_usage_stats IS NULL;