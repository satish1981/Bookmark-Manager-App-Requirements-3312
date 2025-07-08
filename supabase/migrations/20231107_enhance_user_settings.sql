-- Enhanced user settings table migration
-- Adds support for smart selector preferences and enhanced Straico integration

-- Add new columns for enhanced features
ALTER TABLE user_settings_bk4576hgty 
ADD COLUMN IF NOT EXISTS smart_selector_preference TEXT DEFAULT 'quality',
ADD COLUMN IF NOT EXISTS use_smart_selector BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS generation_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_usage_stats JSONB DEFAULT '{}';

-- Create index for better performance on smart selector queries
CREATE INDEX IF NOT EXISTS idx_user_settings_smart_selector 
ON user_settings_bk4576hgty(user_id, use_smart_selector);

-- Create index for generation preferences
CREATE INDEX IF NOT EXISTS idx_user_settings_generation_prefs 
ON user_settings_bk4576hgty(user_id) WHERE generation_preferences IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_settings_bk4576hgty.smart_selector_preference IS 'User preference for smart model selection: quality, balance, or budget';
COMMENT ON COLUMN user_settings_bk4576hgty.use_smart_selector IS 'Whether user prefers smart model selection over manual selection';
COMMENT ON COLUMN user_settings_bk4576hgty.generation_preferences IS 'JSON object storing user preferences for AI generation parameters';
COMMENT ON COLUMN user_settings_bk4576hgty.api_usage_stats IS 'JSON object tracking API usage statistics and costs';

-- Create function to update user settings with enhanced validation
CREATE OR REPLACE FUNCTION update_user_settings_enhanced(
    p_user_id UUID,
    p_straico_api_key TEXT DEFAULT NULL,
    p_straico_model_id TEXT DEFAULT NULL,
    p_smart_selector_preference TEXT DEFAULT NULL,
    p_use_smart_selector BOOLEAN DEFAULT NULL,
    p_generation_preferences JSONB DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
    -- Validate smart selector preference
    IF p_smart_selector_preference IS NOT NULL AND 
       p_smart_selector_preference NOT IN ('quality', 'balance', 'budget') THEN
        RETURN QUERY SELECT false, 'Invalid smart selector preference. Must be quality, balance, or budget.';
        RETURN;
    END IF;

    -- Update or insert user settings
    INSERT INTO user_settings_bk4576hgty (
        user_id,
        straico_api_key,
        straico_model_id,
        smart_selector_preference,
        use_smart_selector,
        generation_preferences,
        updated_at
    ) VALUES (
        p_user_id,
        p_straico_api_key,
        p_straico_model_id,
        COALESCE(p_smart_selector_preference, 'quality'),
        COALESCE(p_use_smart_selector, true),
        COALESCE(p_generation_preferences, '{}'),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        straico_api_key = COALESCE(EXCLUDED.straico_api_key, user_settings_bk4576hgty.straico_api_key),
        straico_model_id = COALESCE(EXCLUDED.straico_model_id, user_settings_bk4576hgty.straico_model_id),
        smart_selector_preference = COALESCE(EXCLUDED.smart_selector_preference, user_settings_bk4576hgty.smart_selector_preference),
        use_smart_selector = COALESCE(EXCLUDED.use_smart_selector, user_settings_bk4576hgty.use_smart_selector),
        generation_preferences = COALESCE(EXCLUDED.generation_preferences, user_settings_bk4576hgty.generation_preferences),
        updated_at = NOW();

    RETURN QUERY SELECT true, 'User settings updated successfully.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_settings_enhanced(UUID, TEXT, TEXT, TEXT, BOOLEAN, JSONB) TO authenticated;