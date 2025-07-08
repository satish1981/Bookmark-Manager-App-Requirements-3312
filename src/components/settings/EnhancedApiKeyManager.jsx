import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  validateApiKeyFormat, 
  verifyApiKey, 
  getUserInfo,
  getSystemStatus,
  SMART_LLM_SELECTORS 
} from '../../lib/straico-api-enhanced';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabase';
import { testDatabaseConnection } from '../../lib/database-schema';
import ErrorModal from '../common/ErrorModal';

export default function EnhancedApiKeyManager() {
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
  const [systemStatus, setSystemStatus] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [validationDetails, setValidationDetails] = useState({});

  // Initialize on component mount
  useEffect(() => {
    if (user) {
      initializeComponent();
    }
  }, [user]);

  // Initialize component with comprehensive checks
  const initializeComponent = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Test database connection
      const dbTest = await testDatabaseConnection();
      if (!dbTest.success) {
        console.warn('Database connection issues:', dbTest.error);
      }

      // Fetch existing API key
      await fetchApiKey();
    } catch (err) {
      console.error('Initialization error:', err);
      setError(`Initialization failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the user's stored API key and test it
  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching API key:', error);
        setError(`Failed to load API key: ${error.message}`);
        return;
      }

      if (data && data.straico_api_key) {
        const key = data.straico_api_key;
        setApiKey(key);
        setMaskedKey(maskApiKey(key));
        setHasStoredKey(true);
        
        // Test the stored key
        await testStoredApiKey(key);
      } else {
        setHasStoredKey(false);
      }
    } catch (err) {
      console.error('Error in fetchApiKey:', err);
      setError(`Failed to fetch API key: ${err.message}`);
    }
  };

  // Test stored API key and get system status
  const testStoredApiKey = async (key) => {
    try {
      const status = await getSystemStatus(key);
      setSystemStatus(status);
      
      if (status.user) {
        setUserInfo(status.user);
      }
    } catch (err) {
      console.warn('API key test failed:', err);
      setSystemStatus({ status: 'error', error: err.message });
    }
  };

  // Mask API key for display
  const maskApiKey = (key) => {
    if (!key) return '';
    const prefix = key.substring(0, 8);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'•'.repeat(12)}${suffix}`;
  };

  // Handle API key input change with real-time validation
  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    setApiKey(value);
    setError('');
    setSuccess('');
    setSystemStatus(null);
    setUserInfo(null);
    
    // Real-time format validation
    const formatValid = validateApiKeyFormat(value);
    setValidationDetails({
      formatValid,
      hasMinLength: value.length >= 10,
      hasNoSpaces: !value.includes(' '),
      isNotEmpty: value.trim().length > 0
    });
  };

  // Toggle API key visibility
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  // Enhanced API key validation and testing
  const validateAndTestApiKey = async (key) => {
    console.log('🔍 Starting comprehensive API key validation');
    
    // Step 1: Format validation
    if (!validateApiKeyFormat(key)) {
      throw new Error('Invalid API key format. Please check your Straico API key.');
    }

    // Step 2: API connectivity test
    const userInfo = await getUserInfo(key);
    if (!userInfo.user) {
      throw new Error('API key verification failed - no user data returned');
    }

    // Step 3: Get system status
    const status = await getSystemStatus(key);
    
    return {
      userInfo: userInfo.user,
      systemStatus: status,
      isValid: true
    };
  };

  // Save API key with comprehensive validation
  const saveApiKey = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!apiKey || apiKey.trim() === '') {
      setError('Please enter an API key');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Starting API key save process');
      
      // Comprehensive validation and testing
      const validation = await validateAndTestApiKey(apiKey);
      
      setUserInfo(validation.userInfo);
      setSystemStatus(validation.systemStatus);
      
      // Save to database
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .upsert({
          user_id: user.id,
          straico_api_key: apiKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save API key: ${error.message}`);
      }

      // Verify save was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key')
        .eq('user_id', user.id)
        .single();

      if (verifyError || !verifyData?.straico_api_key) {
        throw new Error('API key save verification failed');
      }

      // Update UI state
      setMaskedKey(maskApiKey(apiKey));
      setHasStoredKey(true);
      setSuccess(`API key saved successfully! Account: ${validation.userInfo.first_name} ${validation.userInfo.last_name} (${validation.userInfo.coins} coins)`);
      setShowApiKey(false);
      
    } catch (err) {
      console.error('API key save failed:', err);
      const errorMessage = err.message || 'Failed to save API key';
      setError(errorMessage);
      
      if (err.message.includes('API key') || err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
        showApiKeyError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove API key
  const removeApiKey = async () => {
    if (!window.confirm('Are you sure you want to remove your API key? This will disable all AI features.')) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings_bk4576hgty')
        .update({
          straico_api_key: null,
          straico_model_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to remove API key: ${error.message}`);
      }

      // Reset state
      setApiKey('');
      setMaskedKey('');
      setHasStoredKey(false);
      setSystemStatus(null);
      setUserInfo(null);
      setValidationDetails({});
      setSuccess('API key removed successfully');
      
    } catch (err) {
      console.error('Remove API key failed:', err);
      setError(err.message || 'Failed to remove API key');
    } finally {
      setIsSaving(false);
    }
  };

  // Test current API key
  const testApiKey = async () => {
    if (!apiKey) {
      setError('No API key to test');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const validation = await validateAndTestApiKey(apiKey);
      setUserInfo(validation.userInfo);
      setSystemStatus(validation.systemStatus);
      setSuccess('API key test successful!');
    } catch (err) {
      console.error('API key test failed:', err);
      setError(`API key test failed: ${err.message}`);
      setSystemStatus({ status: 'error', error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Show API key error modal
  const showApiKeyError = (errorMessage) => {
    setErrorModalData({
      title: 'API Key Validation Failed',
      message: `${errorMessage}\n\nPlease verify your API key at https://straico.ai and ensure it has the necessary permissions.`,
      actionText: 'Open Straico Dashboard',
      onAction: () => {
        window.open('https://straico.ai/dashboard', '_blank');
        setShowErrorModal(false);
      }
    });
    setShowErrorModal(true);
  };

  // Check if save button should be enabled
  const isSaveButtonEnabled = () => {
    return apiKey && 
           apiKey.trim().length > 0 && 
           validateApiKeyFormat(apiKey) && 
           !isLoading && 
           !isSaving;
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
          Enhanced Straico API Key Manager
        </h3>

        {/* System Status Display */}
        {systemStatus && (
          <div className={`mb-4 p-4 rounded-md ${
            systemStatus.status === 'operational' ? 'bg-green-50 border border-green-200' :
            systemStatus.status === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start">
              <SafeIcon 
                icon={systemStatus.status === 'operational' ? FiIcons.FiCheckCircle : 
                      systemStatus.status === 'error' ? FiIcons.FiXCircle : 
                      FiIcons.FiAlertTriangle} 
                className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${
                  systemStatus.status === 'operational' ? 'text-green-600' :
                  systemStatus.status === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`} 
              />
              <div className="text-sm">
                <p className="font-medium">
                  API Status: {systemStatus.status === 'operational' ? 'Connected' : 
                              systemStatus.status === 'error' ? 'Error' : 'Unknown'}
                </p>
                {systemStatus.modelsCount > 0 && (
                  <p>Available models: {systemStatus.modelsCount}</p>
                )}
                {systemStatus.error && (
                  <p className="text-red-600 mt-1">{systemStatus.error}</p>
                )}
                {systemStatus.timestamp && (
                  <p className="text-gray-500 mt-1">
                    Last checked: {new Date(systemStatus.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Info Display */}
        {userInfo && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <SafeIcon icon={FiIcons.FiUser} className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  Account: {userInfo.first_name} {userInfo.last_name}
                </p>
                <p>Coins: {userInfo.coins?.toLocaleString()}</p>
                <p>Plan: {userInfo.plan}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !systemStatus ? (
          <div className="flex items-center justify-center py-4">
            <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-5 w-5 mr-2 text-blue-500" />
            <span>Initializing API key manager...</span>
          </div>
        ) : (
          <>
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
                <SafeIcon icon={FiIcons.FiAlertCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-start">
                <SafeIcon icon={FiIcons.FiCheckCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* API Information */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <SafeIcon icon={FiIcons.FiInfo} className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Enhanced Straico Integration</p>
                    <p>This enhanced integration supports all Straico API features including:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Smart LLM selector for optimal model selection</li>
                      <li>File upload and processing capabilities</li>
                      <li>Image generation with multiple models</li>
                      <li>Enhanced error handling and validation</li>
                      <li>Real-time usage and cost tracking</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Enter your Straico API key to enable AI-powered features. 
                Get your API key from the{' '}
                <a 
                  href="https://straico.ai/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Straico Dashboard
                </a>.
              </p>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Straico API Key *
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
                      <SafeIcon icon={showApiKey ? FiIcons.FiEyeOff : FiIcons.FiEye} className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Real-time validation feedback */}
                {apiKey && (
                  <div className="mt-1 text-xs space-y-1">
                    <div className={`flex items-center ${validationDetails.formatValid ? 'text-green-600' : 'text-red-600'}`}>
                      <SafeIcon icon={validationDetails.formatValid ? FiIcons.FiCheck : FiIcons.FiX} className="h-3 w-3 mr-1" />
                      Format validation
                    </div>
                    <div className={`flex items-center ${validationDetails.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                      <SafeIcon icon={validationDetails.hasMinLength ? FiIcons.FiCheck : FiIcons.FiX} className="h-3 w-3 mr-1" />
                      Minimum length (10 characters)
                    </div>
                    <div className={`flex items-center ${validationDetails.hasNoSpaces ? 'text-green-600' : 'text-red-600'}`}>
                      <SafeIcon icon={validationDetails.hasNoSpaces ? FiIcons.FiCheck : FiIcons.FiX} className="h-3 w-3 mr-1" />
                      No spaces or invalid characters
                    </div>
                  </div>
                )}

                <p className="mt-1 text-xs text-gray-500">
                  Your API key will be verified with Straico's live API before saving.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveApiKey}
                  disabled={!isSaveButtonEnabled()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || isSaving ? (
                    <>
                      <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4 mr-2" />
                      {isLoading ? 'Verifying...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiIcons.FiSave} className="h-4 w-4 mr-2" />
                      Save & Verify
                    </>
                  )}
                </button>

                {apiKey && (
                  <button
                    onClick={testApiKey}
                    disabled={isLoading || isSaving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                  >
                    <SafeIcon icon={FiIcons.FiTool} className="h-4 w-4 mr-2" />
                    Test API Key
                  </button>
                )}

                {hasStoredKey && (
                  <button
                    onClick={removeApiKey}
                    disabled={isLoading || isSaving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                  >
                    <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4 mr-2" />
                    Remove
                  </button>
                )}
              </div>

              {/* Save Button State Explanation */}
              {!isSaveButtonEnabled() && apiKey && (
                <div className="text-xs text-gray-500 mt-2">
                  {!validateApiKeyFormat(apiKey) ? (
                    'Please enter a valid API key format'
                  ) : isLoading || isSaving ? (
                    'Please wait while processing'
                  ) : (
                    'Fill in all required fields to enable save'
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Documentation */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-gray-800 mb-2">Enhanced Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Smart Model Selection:</strong> Automatic model selection based on quality, balance, or budget preferences</li>
                  <li><strong>File Processing:</strong> Upload and process documents, images, audio, and video files</li>
                  <li><strong>Image Generation:</strong> Create images with multiple AI models and customization options</li>
                </ul>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Enhanced Error Handling:</strong> Detailed error messages and recovery suggestions</li>
                  <li><strong>Usage Tracking:</strong> Real-time cost and token usage monitoring</li>
                  <li><strong>Security:</strong> Comprehensive API key validation and secure storage</li>
                </ul>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <a 
                  href="https://straico.ai/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4 mr-1" />
                  Straico Dashboard
                </a>
                <a 
                  href="https://docs.straico.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <SafeIcon icon={FiIcons.FiBook} className="h-4 w-4 mr-1" />
                  API Documentation
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