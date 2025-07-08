import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  fetchDetailedModels, 
  SMART_LLM_SELECTORS,
  getUserInfo 
} from '../../lib/straico-api-enhanced';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabase';
import ErrorModal from '../common/ErrorModal';

export default function EnhancedModelSelector() {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [chatModels, setChatModels] = useState([]);
  const [imageModels, setImageModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [smartSelectorPreference, setSmartSelectorPreference] = useState(SMART_LLM_SELECTORS.QUALITY);
  const [useSmartSelector, setUseSmartSelector] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({});

  // Fetch user settings on component mount
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  // Fetch user settings and models
  const fetchUserSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key, straico_model_id, smart_selector_preference, use_smart_selector')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        setError('Failed to load user settings');
        return;
      }

      if (data) {
        const userApiKey = data.straico_api_key || '';
        setApiKey(userApiKey);
        setSelectedModelId(data.straico_model_id || '');
        setSmartSelectorPreference(data.smart_selector_preference || SMART_LLM_SELECTORS.QUALITY);
        setUseSmartSelector(data.use_smart_selector !== false); // Default to true

        if (userApiKey) {
          await Promise.all([
            loadModels(userApiKey),
            loadUserInfo(userApiKey)
          ]);
        } else {
          showApiKeyRequiredError();
        }
      } else {
        showApiKeyRequiredError();
      }
    } catch (err) {
      console.error('Error in fetchUserSettings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user account information
  const loadUserInfo = async (key = apiKey) => {
    try {
      const info = await getUserInfo(key);
      setUserInfo(info.user);
    } catch (err) {
      console.warn('Could not load user info:', err);
    }
  };

  // Load models from Straico API
  const loadModels = async (key = apiKey) => {
    if (!key || key.trim() === '') {
      showApiKeyRequiredError();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await fetchDetailedModels(key);
      
      setModels(result.models);
      setChatModels(result.chatModels);
      setImageModels(result.imageModels);

      // Auto-select first model if none selected
      if (!selectedModelId && result.models.length > 0) {
        const firstChatModel = result.chatModels[0];
        if (firstChatModel) {
          setSelectedModelId(firstChatModel.id);
        }
      }

      console.log('Models loaded:', {
        total: result.models.length,
        chat: result.chatModels.length,
        image: result.imageModels.length
      });

    } catch (err) {
      console.error('Error loading models:', err);
      if (err.message.includes('API key')) {
        showApiKeyError(err.message);
      } else {
        setError(err.message || 'Failed to load models from Straico API');
      }
      setModels([]);
      setChatModels([]);
      setImageModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show API key required error
  const showApiKeyRequiredError = () => {
    setErrorModalData({
      title: 'Straico API Key Required',
      message: 'You need to configure your Straico API key to access AI models. Please add your API key in the API Key Manager section above.',
      actionText: 'Go to API Key Manager',
      onAction: () => {
        setShowErrorModal(false);
        const apiKeySection = document.querySelector('[data-section="api-key-manager"]');
        if (apiKeySection) {
          apiKeySection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    setShowErrorModal(true);
  };

  // Show API key error
  const showApiKeyError = (errorMessage) => {
    setErrorModalData({
      title: 'Invalid Straico API Key',
      message: `${errorMessage} Please check your API key in the API Key Manager section and ensure it's valid.`,
      actionText: 'Check API Key',
      onAction: () => {
        setShowErrorModal(false);
        const apiKeySection = document.querySelector('[data-section="api-key-manager"]');
        if (apiKeySection) {
          apiKeySection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    setShowErrorModal(true);
  };

  // Handle model selection
  const handleModelSelect = (modelId) => {
    setSelectedModelId(modelId);
    setError('');
    setSuccess('');
  };

  // Handle smart selector toggle
  const handleSmartSelectorToggle = (enabled) => {
    setUseSmartSelector(enabled);
    setError('');
    setSuccess('');
  };

  // Handle smart selector preference change
  const handleSmartSelectorPreferenceChange = (preference) => {
    setSmartSelectorPreference(preference);
    setError('');
    setSuccess('');
  };

  // Save model preferences
  const saveModelPreferences = async () => {
    if (!useSmartSelector && !selectedModelId) {
      setError('Please select a model or enable smart model selection');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('user_settings_bk4576hgty')
        .upsert({
          user_id: user.id,
          straico_model_id: selectedModelId,
          smart_selector_preference: smartSelectorPreference,
          use_smart_selector: useSmartSelector,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        throw new Error('Failed to save model preferences');
      }

      setSuccess('Model preferences saved successfully');
    } catch (err) {
      console.error('Error saving model preferences:', err);
      setError(err.message || 'Failed to save model preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Get current models based on active tab
  const getCurrentModels = () => {
    switch (activeTab) {
      case 'chat':
        return chatModels;
      case 'image':
        return imageModels;
      default:
        return models;
    }
  };

  // Format pricing display
  const formatPricing = (pricing) => {
    if (typeof pricing === 'string') {
      return pricing;
    }
    return pricing || 'Variable pricing';
  };

  // Get provider color
  const getProviderColor = (provider) => {
    const colors = {
      'openai': 'bg-green-100 text-green-800',
      'anthropic': 'bg-purple-100 text-purple-800',
      'google': 'bg-blue-100 text-blue-800',
      'meta': 'bg-indigo-100 text-indigo-800',
      'mistral': 'bg-orange-100 text-orange-800',
      'cohere': 'bg-pink-100 text-pink-800',
      'flux': 'bg-yellow-100 text-yellow-800',
      'ideogram': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[provider?.toLowerCase()] || colors.default;
  };

  const tabs = [
    { id: 'all', name: 'All Models', icon: FiIcons.FiGrid },
    { id: 'chat', name: 'Chat Models', icon: FiIcons.FiMessageSquare },
    { id: 'image', name: 'Image Models', icon: FiIcons.FiImage }
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiCpu} className="mr-2 text-purple-500" />
          Enhanced Model Selection
        </h3>

        {/* User Account Info */}
        {userInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SafeIcon icon={FiIcons.FiUser} className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {userInfo.first_name} {userInfo.last_name} - {userInfo.plan}
                </span>
              </div>
              <div className="text-sm text-blue-700">
                {userInfo.coins?.toLocaleString()} coins available
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
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

        {/* API Key Status */}
        <div className={`mb-4 p-3 rounded-md ${apiKey ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
          <div className="flex items-start">
            <SafeIcon 
              icon={apiKey ? FiIcons.FiCheck : FiIcons.FiAlertTriangle} 
              className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" 
            />
            <div>
              {apiKey ? (
                <p className="text-sm">API key configured. Enhanced model features available.</p>
              ) : (
                <>
                  <p className="text-sm font-medium">No API Key Found</p>
                  <p className="text-sm">Please configure your Straico API key above to access models.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Smart Model Selection */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useSmartSelector}
                onChange={(e) => handleSmartSelectorToggle(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">
                Use Smart Model Selection
              </span>
            </label>
            <SafeIcon icon={FiIcons.FiZap} className="h-5 w-5 text-yellow-500" />
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Let AI automatically choose the best model based on your preferences and the task requirements.
          </p>

          {useSmartSelector && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Smart Selection Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(SMART_LLM_SELECTORS).map((selector) => (
                  <button
                    key={selector}
                    type="button"
                    onClick={() => handleSmartSelectorPreferenceChange(selector)}
                    className={`px-3 py-2 text-xs font-medium rounded-md border focus:outline-none ${
                      smartSelectorPreference === selector
                        ? 'bg-purple-100 text-purple-700 border-purple-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {selector.charAt(0).toUpperCase() + selector.slice(1)}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <strong>Quality:</strong> Best performance models, higher cost<br/>
                <strong>Balance:</strong> Good performance with reasonable cost<br/>
                <strong>Budget:</strong> Cost-effective models for basic tasks
              </div>
            </div>
          )}
        </div>

        {/* Manual Model Selection */}
        {!useSmartSelector && (
          <>
            {/* Model Category Tabs */}
            <div className="mb-4">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <SafeIcon icon={tab.icon} className="mr-2 h-4 w-4" />
                      {tab.name}
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        {tab.id === 'all' ? models.length : 
                         tab.id === 'chat' ? chatModels.length : 
                         imageModels.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-purple-500" />
                <span className="ml-2 text-gray-600">Loading models from Straico API...</span>
              </div>
            )}

            {/* Models Display */}
            {!isLoading && getCurrentModels().length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">
                    Available {activeTab === 'all' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Models
                  </h4>
                  <button
                    onClick={() => loadModels()}
                    disabled={!apiKey}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                  >
                    <SafeIcon icon={FiIcons.FiRefreshCw} className="h-3 w-3 mr-1" />
                    Refresh
                  </button>
                </div>

                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2 p-4">
                      {getCurrentModels().map((model) => (
                        <div
                          key={model.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedModelId === model.id
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleModelSelect(model.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id={`model-${model.id}`}
                              name="model-selection"
                              checked={selectedModelId === model.id}
                              onChange={() => handleModelSelect(model.id)}
                              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-900">{model.name}</h5>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getProviderColor(model.provider)}`}>
                                    {model.provider}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {model.category}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>
                                  <strong>Pricing:</strong> {formatPricing(model.pricing)}
                                </div>
                                <div>
                                  <strong>Max Tokens:</strong> {model.max_tokens}
                                </div>
                              </div>

                              {model.metadata && (
                                <div className="mt-2 space-y-2">
                                  {model.metadata.pros && model.metadata.pros.length > 0 && (
                                    <div>
                                      <strong className="text-xs text-green-600">Pros:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {model.metadata.pros.slice(0, 3).map((pro, index) => (
                                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                                            {pro}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {model.metadata.applications && model.metadata.applications.length > 0 && (
                                    <div>
                                      <strong className="text-xs text-blue-600">Best for:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {model.metadata.applications.slice(0, 3).map((app, index) => (
                                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                            {app}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveModelPreferences}
            disabled={isSaving || (!useSmartSelector && !selectedModelId)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <SafeIcon icon={FiIcons.FiSave} className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {/* No Models State */}
        {!isLoading && models.length === 0 && (
          <div className="text-center py-8">
            <SafeIcon icon={FiIcons.FiCpu} className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Models Available</h4>
            <p className="text-gray-600 mb-4">
              {!apiKey 
                ? "Please add your Straico API key above to load available models."
                : "No models were found. Please verify your API key has access to Straico models."
              }
            </p>
            <button
              onClick={() => apiKey ? loadModels() : showApiKeyRequiredError()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <SafeIcon icon={apiKey ? FiIcons.FiRefreshCw : FiIcons.FiKey} className="h-4 w-4 mr-2" />
              {apiKey ? 'Retry Loading Models' : 'Add API Key'}
            </button>
          </div>
        )}

        {/* Enhanced Features Info */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Enhanced Model Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Smart Selection:</strong> AI chooses optimal models automatically</li>
              <li><strong>Detailed Metadata:</strong> Comprehensive model information and capabilities</li>
              <li><strong>Cost Optimization:</strong> Balance quality and cost based on preferences</li>
            </ul>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Multiple Categories:</strong> Chat and image generation models</li>
              <li><strong>Real-time Pricing:</strong> Up-to-date cost information</li>
              <li><strong>Provider Diversity:</strong> Models from multiple AI providers</li>
            </ul>
          </div>
        </div>
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