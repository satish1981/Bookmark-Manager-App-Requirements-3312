import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { validateApiKeyFormat, verifyApiKey } from '../../lib/straico-api';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabase';
import { testDatabaseConnection, testDatabaseOperations } from '../../lib/database-schema';
import ErrorModal from '../common/ErrorModal';

export default function ApiKeyManager() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({});
  const [debugLog, setDebugLog] = useState([]);
  const [dbConnectionStatus, setDbConnectionStatus] = useState('checking'); // 'checking', 'connected', 'failed'
  const [dbError, setDbError] = useState('');

  // Debug logging function
  const addDebugLog = (message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    console.log('🔍 DEBUG:', logEntry);
    setDebugLog(prev => [...prev, logEntry]);
  };

  // Initialize on component mount
  useEffect(() => {
    if (user) {
      addDebugLog('Component mounted, user authenticated', { userId: user.id });
      initializeComponent();
    }
  }, [user]);

  // Initialize component with better error handling
  const initializeComponent = async () => {
    setIsLoading(true);
    setError('');
    setDbError('');
    addDebugLog('Starting component initialization');
    
    try {
      // Test database connection first
      addDebugLog('Testing database connection');
      const connectionTest = await testDatabaseConnection();
      
      addDebugLog('Database connection test result', connectionTest);
      
      if (!connectionTest.success) {
        setDbConnectionStatus('failed');
        setDbError(connectionTest.error);
        addDebugLog('Database connection failed, but continuing with limited functionality');
        
        // Don't return here - allow user to still enter API key
        // The save operation can handle DB issues separately
      } else {
        setDbConnectionStatus('connected');
        addDebugLog('Database connection successful');
        
        // Only try to fetch existing API key if DB connection works
        await fetchApiKey();
      }
    } catch (err) {
      addDebugLog('Exception in component initialization', err);
      setDbConnectionStatus('failed');
      setDbError(`Initialization error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the user's stored API key
  const fetchApiKey = async () => {
    addDebugLog('Starting fetchApiKey');
    
    try {
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if no record exists

      addDebugLog('Fetch API key result', { 
        hasData: !!data,
        hasApiKey: !!data?.straico_api_key,
        error: error?.message,
        errorCode: error?.code
      });

      if (error) {
        addDebugLog('Error fetching API key', error);
        setError(`Failed to load API key settings: ${error.message}`);
      } else if (data && data.straico_api_key) {
        const key = data.straico_api_key;
        setApiKey(key);
        setMaskedKey(maskApiKey(key));
        setHasStoredKey(true);
        addDebugLog('API key loaded successfully');
      } else {
        addDebugLog('No API key found in database');
        setHasStoredKey(false);
      }
    } catch (err) {
      addDebugLog('Exception in fetchApiKey', err);
      setError(`An unexpected error occurred: ${err.message}`);
    }
  };

  // Mask API key for display
  const maskApiKey = (key) => {
    if (!key) return '';
    const prefix = key.substring(0, 5);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'•'.repeat(10)}${suffix}`;
  };

  // Handle API key input change
  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    setApiKey(value);
    setError('');
    setSuccess('');
    addDebugLog('API key input changed', { length: value.length });
  };

  // Toggle showing/hiding the API key
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  // Check if save button should be enabled
  const isSaveButtonEnabled = () => {
    // Enable if user has entered a non-empty API key that passes basic validation
    const hasValidInput = apiKey && apiKey.trim().length > 0 && validateApiKeyFormat(apiKey);
    
    // Don't block on DB connection - user should be able to try saving even if DB check failed
    const notCurrentlySaving = !isSaving;
    
    addDebugLog('Save button state check', {
      hasValidInput,
      notCurrentlySaving,
      dbStatus: dbConnectionStatus,
      shouldEnable: hasValidInput && notCurrentlySaving
    });
    
    return hasValidInput && notCurrentlySaving;
  };

  // Show API key validation error modal
  const showApiKeyError = (errorMessage) => {
    setErrorModalData({
      title: 'API Key Validation Failed',
      message: errorMessage,
      actionText: 'Close',
      onAction: () => setShowErrorModal(false)
    });
    setShowErrorModal(true);
  };

  // Save API key to database
  const saveApiKey = async () => {
    setError('');
    setSuccess('');
    addDebugLog('Starting saveApiKey process');
    
    // Basic validation
    if (!apiKey || apiKey.trim() === '') {
      const errorMsg = 'Please enter an API key';
      addDebugLog('Validation failed: empty API key');
      setError(errorMsg);
      return;
    }

    // Basic format validation
    if (!validateApiKeyFormat(apiKey)) {
      const errorMsg = 'Please enter a valid API key';
      addDebugLog('Validation failed: invalid format');
      setError(errorMsg);
      return;
    }

    addDebugLog('API key validation passed', { keyLength: apiKey.length });
    setIsSaving(true);
    
    try {
      // Step 1: Verify API key with Straico API
      addDebugLog('Starting API key verification with Straico');
      await verifyApiKey(apiKey);
      addDebugLog('Straico API verification successful');
      
      // Step 2: Test database connection if it wasn't already successful
      if (dbConnectionStatus !== 'connected') {
        addDebugLog('Testing database connection before save');
        const connectionTest = await testDatabaseConnection();
        
        if (!connectionTest.success) {
          throw new Error(`Database connection failed: ${connectionTest.error}. Your API key is valid but cannot be saved to the database.`);
        }
        
        setDbConnectionStatus('connected');
        setDbError('');
        addDebugLog('Database connection established during save');
      }
      
      // Step 3: Save to database
      addDebugLog('Attempting to save API key to database');
      
      // Try to upsert (insert or update)
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .upsert({
          user_id: user.id,
          straico_api_key: apiKey,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
        
      addDebugLog('Database save result', { 
        success: !error,
        error: error?.message,
        errorCode: error?.code,
        savedId: data?.id
      });
        
      if (error) {
        throw new Error(`Failed to save API key to database: ${error.message}`);
      }

      // Step 4: Verify the save worked
      addDebugLog('Verifying save by reading back from database');
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key')
        .eq('user_id', user.id)
        .single();
        
      if (verifyError) {
        throw new Error(`Failed to verify saved API key: ${verifyError.message}`);
      }

      if (!verifyData?.straico_api_key) {
        throw new Error('API key was not saved properly - verification failed');
      }

      // Update UI state
      setMaskedKey(maskApiKey(apiKey));
      setHasStoredKey(true);
      setSuccess('API key saved and verified successfully');
      setShowApiKey(false);
      addDebugLog('Save process completed successfully');
      
    } catch (err) {
      addDebugLog('Save process failed', err);
      const errorMessage = err.message || 'Failed to save API key';
      setError(errorMessage);
      
      if (err.message.includes('API key') && !err.message.includes('database') && !err.message.includes('Failed to save')) {
        showApiKeyError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Remove API key from database
  const removeApiKey = async () => {
    if (!window.confirm('Are you sure you want to remove your API key? This will disable all AI features.')) {
      return;
    }
    
    addDebugLog('Starting removeApiKey process');
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .update({ 
          straico_api_key: null,
          straico_model_id: null,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select();

      addDebugLog('Remove API key result', { 
        success: !error,
        error: error?.message,
        updatedId: data?.[0]?.id
      });

      if (error) {
        throw new Error(`Failed to remove API key: ${error.message}`);
      }

      setApiKey('');
      setMaskedKey('');
      setHasStoredKey(false);
      setSuccess('API key removed successfully');
      addDebugLog('Remove process completed successfully');
    } catch (err) {
      addDebugLog('Remove process failed', err);
      setError(err.message || 'Failed to remove API key');
    } finally {
      setIsSaving(false);
    }
  };

  // Test database operations
  const testDatabaseOps = async () => {
    addDebugLog('Starting database operations test');
    setIsLoading(true);
    
    try {
      const opsTest = await testDatabaseOperations();
      addDebugLog('Database operations test result', opsTest);
      
      if (opsTest.success) {
        setSuccess('Database operations test passed successfully');
        setDbConnectionStatus('connected');
        setDbError('');
      } else {
        setError(`Database operations test failed: ${opsTest.error}`);
        setDbConnectionStatus('failed');
        setDbError(opsTest.error);
      }
    } catch (err) {
      addDebugLog('Database operations test exception', err);
      setError(`Database test error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        data-section="api-key-manager"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiKey} className="mr-2 text-blue-500" />
          Straico API Key
        </h3>
        
        {/* Database Connection Status */}
        <div className={`mb-4 p-3 rounded-md ${
          dbConnectionStatus === 'connected' ? 'bg-green-50 text-green-700' :
          dbConnectionStatus === 'failed' ? 'bg-red-50 text-red-700' :
          'bg-yellow-50 text-yellow-700'
        }`}>
          <div className="flex items-start">
            <SafeIcon icon={
              dbConnectionStatus === 'connected' ? FiIcons.FiCheck :
              dbConnectionStatus === 'failed' ? FiIcons.FiAlertTriangle :
              FiIcons.FiLoader
            } className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${
              dbConnectionStatus === 'checking' ? 'animate-spin' : ''
            }`} />
            <div className="text-sm">
              {dbConnectionStatus === 'connected' && (
                <p>Database connection is active. API keys can be saved and loaded.</p>
              )}
              {dbConnectionStatus === 'failed' && (
                <>
                  <p className="font-medium">Database Connection Issue</p>
                  <p>Database access failed: {dbError}</p>
                  <p className="mt-1">You can still enter and verify your API key, but it may not be saved persistently.</p>
                </>
              )}
              {dbConnectionStatus === 'checking' && (
                <p>Checking database connection...</p>
              )}
            </div>
          </div>
        </div>

        {isLoading && dbConnectionStatus === 'checking' ? (
          <div className="flex items-center justify-center py-4">
            <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-5 w-5 mr-2 text-blue-500" />
            <span>Initializing...</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
                <SafeIcon icon={FiIcons.FiAlertCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-start">
                <SafeIcon icon={FiIcons.FiCheckCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <SafeIcon icon={FiIcons.FiInfo} className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Real Straico API Key Required</p>
                    <p>Enter your actual Straico API key from your account dashboard. The key will be verified with Straico's API before saving.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Enter your Straico API key to enable AI-powered features like content summarization and analysis. 
                Your API key will be verified against Straico's live API.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  API Key *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : (hasStoredKey && !showApiKey ? maskedKey : apiKey)}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your Straico API key"
                    className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={toggleShowApiKey}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <SafeIcon
                        icon={showApiKey ? FiIcons.FiEyeOff : FiIcons.FiEye}
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your API key will be verified with Straico's API before saving. Find your API key in your Straico dashboard.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveApiKey}
                  disabled={!isSaveButtonEnabled()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4 mr-2" />
                      Verifying & Saving...
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiIcons.FiSave} className="h-4 w-4 mr-2" />
                      Save & Verify API Key
                    </>
                  )}
                </button>
                
                {hasStoredKey && (
                  <button
                    onClick={removeApiKey}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                  >
                    <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4 mr-2" />
                    Remove
                  </button>
                )}
                
                <button
                  onClick={testDatabaseOps}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                >
                  <SafeIcon icon={FiIcons.FiTool} className="h-4 w-4 mr-2" />
                  Test Database
                </button>
              </div>
              
              {/* Button state explanation */}
              {!isSaveButtonEnabled() && (
                <div className="text-xs text-gray-500 mt-2">
                  {!apiKey || apiKey.trim().length === 0 ? (
                    'Enter an API key to enable the save button'
                  ) : !validateApiKeyFormat(apiKey) ? (
                    'Enter a valid API key format to enable the save button'
                  ) : isSaving ? (
                    'Please wait while the API key is being processed'
                  ) : (
                    'Save button should be enabled'
                  )}
                </div>
              )}
            </div>
            
            {/* Debug Log Section */}
            {debugLog.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <details className="mb-4">
                  <summary className="cursor-pointer font-medium text-gray-800 mb-2">
                    Debug Log ({debugLog.length} entries)
                  </summary>
                  <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {debugLog.map((log, index) => (
                        <div key={index} className="mb-2 pb-2 border-b border-gray-200">
                          <div className="font-semibold text-blue-600">[{log.timestamp}] {log.message}</div>
                          {log.data && <div className="mt-1 text-gray-600">{log.data}</div>}
                        </div>
                      ))}
                    </pre>
                  </div>
                  <button
                    onClick={() => setDebugLog([])}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Debug Log
                  </button>
                </details>
              </div>
            )}
            
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Important Information</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li><strong>API Verification:</strong> Your key will be tested against Straico's API before saving</li>
                <li><strong>Database Storage:</strong> API keys are stored securely when database connection is available</li>
                <li><strong>Offline Mode:</strong> You can verify API keys even if database connection fails</li>
                <li><strong>Usage Billing:</strong> Usage is billed according to your Straico account plan</li>
              </ul>
              <div className="mt-3">
                <a 
                  href="https://api.straico.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4 mr-1" />
                  Straico API Documentation
                </a>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorModalData.title}
        message={errorModalData.message}
        actionText={errorModalData.actionText}
        onAction={errorModalData.onAction}
      />
    </>
  );
}