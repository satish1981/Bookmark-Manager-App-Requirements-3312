/**
 * Database schema validation and migration utilities
 * Ensures all required tables exist with proper structure
 */
import supabase from './supabase';

/**
 * Check if a table exists by trying to query it
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<{exists: boolean, error: string|null}>}
 */
export const tableExists = async (tableName) => {
  try {
    console.log(`🔍 Checking if table ${tableName} exists...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table ${tableName} check failed:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
        return { exists: false, error: `Table ${tableName} does not exist` };
      }
      
      return { exists: false, error: error.message || 'Unknown table check error' };
    }
    
    console.log(`✅ Table ${tableName} exists and is accessible`);
    return { exists: true, error: null };
  } catch (err) {
    console.error(`❌ Exception checking table ${tableName}:`, err);
    return { exists: false, error: `Exception: ${err.message}` };
  }
};

/**
 * Create the user_settings table if it doesn't exist
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const ensureUserSettingsTable = async () => {
  try {
    console.log('🔧 Ensuring user_settings table exists...');
    
    // Check if table exists
    const tableCheck = await tableExists('user_settings_bk4576hgty');
    
    if (tableCheck.exists) {
      console.log('✅ user_settings_bk4576hgty table already exists and is accessible');
      return { success: true, error: null };
    }
    
    console.log('⚠️ user_settings_bk4576hgty table does not exist or is not accessible');
    console.log('Table check result:', tableCheck);
    
    // Try to create the table if it doesn't exist
    try {
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS user_settings_bk4576hgty (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            straico_api_key TEXT,
            straico_model_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE user_settings_bk4576hgty ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own settings" 
            ON user_settings_bk4576hgty FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own settings" 
            ON user_settings_bk4576hgty FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own settings" 
            ON user_settings_bk4576hgty FOR UPDATE USING (auth.uid() = user_id);
        `
      });
      
      if (createError) {
        console.error('Failed to create user_settings table:', createError);
        return { 
          success: false, 
          error: `Failed to create user_settings table: ${createError.message}` 
        };
      }
      
      console.log('✅ Created user_settings_bk4576hgty table successfully');
      return { success: true, error: null };
    } catch (createErr) {
      console.error('Exception creating user_settings table:', createErr);
      
      // Return a more friendly error message for the user
      return { 
        success: false, 
        error: `Could not create required tables. This may be due to permission issues.` 
      };
    }
  } catch (err) {
    console.error('❌ Exception in ensureUserSettingsTable:', err);
    return { 
      success: false, 
      error: `Unexpected error: ${err.message}` 
    };
  }
};

/**
 * Validate all required database tables exist
 * @returns {Promise<{success: boolean, error: string|null, missingTables: string[]}>}
 */
export const validateDatabaseSchema = async () => {
  try {
    console.log('🔧 Validating database schema...');
    
    const requiredTables = [
      'user_settings_bk4576hgty',
      'bookmarks_bk4576hgty',
      'categories_bk4576hgty',
      'tags_bk4576hgty',
      'bookmark_tags_bk4576hgty',
      'analytics_bk4576hgty'
    ];
    
    const missingTables = [];
    const existingTables = [];
    const errors = [];
    
    for (const tableName of requiredTables) {
      const tableCheck = await tableExists(tableName);
      
      if (tableCheck.exists) {
        existingTables.push(tableName);
      } else {
        missingTables.push(tableName);
        errors.push(`${tableName}: ${tableCheck.error}`);
      }
    }
    
    console.log(`📊 Schema validation results: ${existingTables.length} existing, ${missingTables.length} missing`);
    
    if (missingTables.length > 0) {
      console.log('❌ Schema validation failed. Missing tables:', missingTables);
      return {
        success: false,
        error: `Missing required tables: ${missingTables.join(', ')}. Errors: ${errors.join('; ')}`,
        missingTables
      };
    }
    
    console.log('✅ Database schema validation passed');
    return { success: true, error: null, missingTables: [] };
  } catch (err) {
    console.error('❌ Exception in validateDatabaseSchema:', err);
    return {
      success: false,
      error: `Schema validation failed: ${err.message}`,
      missingTables: []
    };
  }
};

/**
 * Initialize all required database tables
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const initializeDatabaseSchema = async () => {
  try {
    console.log('🔧 Initializing database schema...');
    
    // For this app, we only need to ensure user_settings table exists
    // The other tables are created by the main migration
    const userSettingsResult = await ensureUserSettingsTable();
    
    if (!userSettingsResult.success) {
      console.error('❌ User settings table validation failed:', userSettingsResult.error);
      return userSettingsResult;
    }
    
    console.log('✅ Database schema initialization completed');
    return { success: true, error: null };
  } catch (err) {
    console.error('❌ Exception in initializeDatabaseSchema:', err);
    return {
      success: false,
      error: `Schema initialization failed: ${err.message}`
    };
  }
};

/**
 * Simple test to verify database connection and basic functionality
 * @returns {Promise<{success: boolean, error: string|null, details: object}>}
 */
export const testDatabaseConnection = async () => {
  const details = {
    authCheck: null,
    tableAccess: null,
    userRecord: null
  };
  
  try {
    console.log('🔧 Testing database connection...');
    
    // Test 1: Check auth
    console.log('Step 1: Checking authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      details.authCheck = { success: false, error: authError.message };
      throw new Error(`Auth error: ${authError.message}`);
    }
    
    if (!authData?.user) {
      details.authCheck = { success: false, error: 'No user found' };
      throw new Error('No authenticated user found');
    }
    
    details.authCheck = { success: true, userId: authData.user.id };
    console.log('✅ Auth check passed for user:', authData.user.id);
    
    // Test 2: Try to create the table if needed
    await ensureUserSettingsTable();
    
    // Test 3: Try to access user_settings table
    console.log('Step 3: Testing table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_settings_bk4576hgty')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError) {
      details.tableAccess = { 
        success: false, 
        error: tableError.message,
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint
      };
      throw new Error(`Table access error: ${tableError.message} (Code: ${tableError.code})`);
    }
    
    details.tableAccess = { success: true, count: tableData };
    console.log('✅ Table access check passed');
    
    // Test 4: Try to query user's record (optional)
    console.log('Step 4: Testing user record access...');
    const { data: userData, error: userError } = await supabase
      .from('user_settings_bk4576hgty')
      .select('id, created_at')
      .eq('user_id', authData.user.id)
      .maybeSingle(); // Use maybeSingle to avoid error if no record exists
    
    if (userError) {
      details.userRecord = {
        success: false,
        error: userError.message,
        code: userError.code
      };
      console.warn('⚠️ User record access failed (non-critical):', userError.message);
    } else {
      details.userRecord = {
        success: true,
        hasRecord: !!userData,
        recordId: userData?.id
      };
      console.log('✅ User record access check passed, has record:', !!userData);
    }
    
    console.log('✅ Database connection test completed successfully');
    return { success: true, error: null, details };
    
  } catch (err) {
    console.error('❌ Database connection test failed:', err);
    return {
      success: false,
      error: err.message || 'Unknown database connection error',
      details
    };
  }
};

/**
 * Test basic database operations (insert/read/delete)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const testDatabaseOperations = async () => {
  try {
    console.log('🔧 Testing database operations...');
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      throw new Error('No authenticated user for operations test');
    }
    
    const userId = authData.user.id;
    console.log('Testing operations for user:', userId);
    
    // Test insert
    const testData = {
      user_id: userId,
      straico_api_key: 'test_key_delete_me_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Testing insert operation...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_settings_bk4576hgty')
      .upsert([testData], { onConflict: 'user_id' })
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Insert test failed: ${insertError.message}`);
    }
    
    console.log('✅ Insert test passed, record ID:', insertData.id);
    
    // Test read
    console.log('Testing read operation...');
    const { data: readData, error: readError } = await supabase
      .from('user_settings_bk4576hgty')
      .select('*')
      .eq('id', insertData.id)
      .single();
    
    if (readError) {
      throw new Error(`Read test failed: ${readError.message}`);
    }
    
    console.log('✅ Read test passed');
    
    // Test delete (cleanup) - we'll use update instead since we want to keep the record
    console.log('Testing update operation...');
    const { error: updateError } = await supabase
      .from('user_settings_bk4576hgty')
      .update({ straico_api_key: null })
      .eq('id', insertData.id);
    
    if (updateError) {
      console.warn('⚠️ Update test failed:', updateError.message);
      // Don't throw error for cleanup failure
    } else {
      console.log('✅ Update test passed');
    }
    
    console.log('✅ Database operations test completed successfully');
    return { success: true, error: null };
    
  } catch (err) {
    console.error('❌ Database operations test failed:', err);
    return {
      success: false,
      error: err.message || 'Unknown operations test error'
    };
  }
};