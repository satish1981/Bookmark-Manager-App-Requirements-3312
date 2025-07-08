import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  generateSummary, 
  fetchDetailedModels, 
  SMART_LLM_SELECTORS,
  getUserInfo 
} from '../../lib/straico-api-enhanced';
import supabase from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ErrorModal from '../common/ErrorModal';

export default function EnhancedAISummaryModal({ bookmark, onClose, onSave }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [useSmartSelector, setUseSmartSelector] = useState(true);
  const [smartSelectorType, setSmartSelectorType] = useState(SMART_LLM_SELECTORS.QUALITY);
  const [models, setModels] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);

  // Initialize component
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  // Initialize summary with existing AI summary
  useEffect(() => {
    if (bookmark?.ai_summary) {
      setSummary(bookmark.ai_summary);
    }
  }, [bookmark]);

  // Fetch user settings and load data
  const fetchUserSettings = async () => {
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
        setUseSmartSelector(data.use_smart_selector !== false);
        setSmartSelectorType(data.smart_selector_preference || SMART_LLM_SELECTORS.QUALITY);

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
    }
  };

  // Load user account information
  const loadUserInfo = async (key) => {
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

    setIsLoadingModels(true);
    setError('');

    try {
      const result = await fetchDetailedModels(key);
      
      // Filter to only chat models for text generation
      const chatModels = result.chatModels || [];
      setModels(chatModels);

      // Auto-select first model if none selected
      if (!selectedModelId && chatModels.length > 0) {
        setSelectedModelId(chatModels[0].id);
      }

    } catch (err) {
      console.error('Error loading models:', err);
      if (err.message.includes('API key')) {
        showApiKeyError(err.message);
      } else {
        setError(err.message || 'Failed to load models from Straico API');
      }
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Show API key required error
  const showApiKeyRequiredError = () => {
    setErrorModalData({
      title: 'Straico API Key Required',
      message: 'You need to configure your Straico API key before generating AI summaries. Please go to Settings → API Key Manager to add your valid Straico API key.',
      actionText: 'Go to Settings',
      onAction: () => {
        setShowErrorModal(false);
        onClose();
        window.location.hash = '#settings';
      }
    });
    setShowErrorModal(true);
  };

  // Show API key error
  const showApiKeyError = (errorMessage) => {
    setErrorModalData({
      title: 'Invalid Straico API Key',
      message: `${errorMessage} Please check your API key in Settings and ensure it's valid and has the necessary permissions.`,
      actionText: 'Go to Settings',
      onAction: () => {
        setShowErrorModal(false);
        onClose();
        window.location.hash = '#settings';
      }
    });
    setShowErrorModal(true);
  };

  // Generate summary using enhanced API
  const handleGenerate = async () => {
    if (!apiKey || apiKey.trim() === '') {
      showApiKeyRequiredError();
      return;
    }

    if (!useSmartSelector && !selectedModelId) {
      setError('Please select a model or enable smart model selection');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGenerationResult(null);

    try {
      const options = {
        useSmartSelector,
        smartSelectorType,
        temperature,
        maxTokens,
        customPrompt: customPrompt.trim() || null
      };

      const result = await generateSummary(
        bookmark.url,
        apiKey,
        selectedModelId,
        options
      );

      setSummary(result.summary);
      setGenerationResult(result);

    } catch (err) {
      console.error('Error generating summary:', err);
      if (err.message.includes('API key')) {
        showApiKeyError(err.message);
      } else {
        setError(err.message || 'Failed to generate summary');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Save summary
  const handleSave = () => {
    if (!summary) {
      setError('Please generate a summary first');
      return;
    }
    onSave(summary);
  };

  // Get provider color for display
  const getProviderColor = (provider) => {
    const colors = {
      'openai': 'text-green-600',
      'anthropic': 'text-purple-600',
      'google': 'text-blue-600',
      'meta': 'text-indigo-600',
      'mistral': 'text-orange-600'
    };
    return colors[provider?.toLowerCase()] || 'text-gray-600';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-purple-600 text-white flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <SafeIcon icon={FiIcons.FiCpu} className="mr-2" />
              Enhanced AI Summary Generator
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-purple-500 focus:outline-none"
            >
              <SafeIcon icon={FiIcons.FiX} className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Account Info */}
            {userInfo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <SafeIcon icon={FiIcons.FiUser} className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {userInfo.first_name} {userInfo.last_name} - {userInfo.plan}
                    </span>
                  </div>
                  <span className="text-blue-700">
                    {userInfo.coins?.toLocaleString()} coins available
                  </span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                <div className="flex items-start">
                  <SafeIcon icon={FiIcons.FiAlertCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* API Key Status */}
            <div className={`p-3 rounded-md ${apiKey ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-start">
                <SafeIcon 
                  icon={apiKey ? FiIcons.FiCheck : FiIcons.FiAlertTriangle} 
                  className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" 
                />
                <div className="text-sm">
                  {apiKey ? (
                    <p>Straico API key is configured and ready for enhanced AI features.</p>
                  ) : (
                    <>
                      <p className="font-medium">No Straico API Key Found</p>
                      <p>Please configure your API key in Settings before generating AI summaries.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bookmark Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Content to Summarize</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium text-gray-900">{bookmark.title}</p>
                <a 
                  href={bookmark.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {bookmark.url}
                </a>
                {bookmark.description && (
                  <p className="text-sm text-gray-600 mt-1">{bookmark.description}</p>
                )}
              </div>
            </div>

            {/* Generation Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Selection */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">AI Model Selection</h3>
                
                {/* Smart Selector Option */}
                <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useSmartSelector}
                      onChange={(e) => setUseSmartSelector(e.target.checked)}
                      disabled={isGenerating}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      Use Smart Model Selection
                    </span>
                    <SafeIcon icon={FiIcons.FiZap} className="ml-2 h-4 w-4 text-yellow-500" />
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Let AI choose the optimal model for this summarization task.
                  </p>

                  {useSmartSelector && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selection Preference
                      </label>
                      <select
                        value={smartSelectorType}
                        onChange={(e) => setSmartSelectorType(e.target.value)}
                        disabled={isGenerating}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      >
                        {Object.values(SMART_LLM_SELECTORS).map((selector) => (
                          <option key={selector} value={selector}>
                            {selector.charAt(0).toUpperCase() + selector.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Manual Model Selection */}
                {!useSmartSelector && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Choose Model
                      </label>
                      <button
                        type="button"
                        onClick={() => loadModels()}
                        disabled={isLoadingModels || !apiKey}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none disabled:opacity-50"
                      >
                        {isLoadingModels ? (
                          <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-3 w-3 mr-1" />
                        ) : (
                          <SafeIcon icon={FiIcons.FiRefreshCw} className="h-3 w-3 mr-1" />
                        )}
                        {isLoadingModels ? "Loading..." : "Refresh"}
                      </button>
                    </div>

                    <select
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      disabled={models.length === 0 || isLoadingModels || !apiKey || isGenerating}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      {models.length === 0 ? (
                        <option value="">No models available</option>
                      ) : (
                        <>
                          <option value="">Select a model</option>
                          {models.map(model => (
                            <option key={model.id} value={model.id}>
                              {model.name} ({model.pricing})
                            </option>
                          ))}
                        </>
                      )}
                    </select>

                    {/* Selected Model Info */}
                    {selectedModelId && models.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {(() => {
                          const selectedModel = models.find(m => m.id === selectedModelId);
                          return selectedModel ? (
                            <div>
                              <p className={`font-medium ${getProviderColor(selectedModel.provider)}`}>
                                {selectedModel.provider} • {selectedModel.pricing}
                              </p>
                              <p className="text-gray-600">{selectedModel.description}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generation Parameters */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Generation Settings</h3>
                
                <div className="space-y-4">
                  {/* Custom Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Instructions (Optional)
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      disabled={isGenerating}
                      rows="3"
                      placeholder="Add custom instructions for the summary (e.g., 'Focus on technical details', 'Write for beginners')"
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Creativity Level: {temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      disabled={isGenerating}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary Length
                    </label>
                    <select
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      disabled={isGenerating}
                      className="block w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={250}>Short (250 tokens)</option>
                      <option value={500}>Medium (500 tokens)</option>
                      <option value={750}>Long (750 tokens)</option>
                      <option value={1000}>Very Long (1000 tokens)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !apiKey || (!useSmartSelector && !selectedModelId)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-5 w-5 mr-2" />
                    Generating Enhanced Summary...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiIcons.FiCpu} className="h-5 w-5 mr-2" />
                    Generate Enhanced Summary
                  </>
                )}
              </button>
            </div>

            {/* Generation Result Info */}
            {generationResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">Generation Complete</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Model Used:</strong> {generationResult.model}</p>
                  <p><strong>Provider:</strong> {generationResult.provider}</p>
                  <p><strong>Tokens:</strong> {generationResult.usage.totalTokens} (Input: {generationResult.usage.inputTokens}, Output: {generationResult.usage.outputTokens})</p>
                  <p><strong>Cost:</strong> {generationResult.usage.cost} coins</p>
                  {generationResult.justification && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Model Selection Reasoning</summary>
                      <p className="mt-1 text-xs bg-white p-2 rounded">{generationResult.justification}</p>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Summary Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Generated Summary
                </label>
                <span className="text-xs text-gray-500">
                  {summary.length} characters
                </span>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Enhanced AI-generated summary will appear here..."
                rows="8"
                className="block w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can edit the summary before saving it to your bookmark.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 text-right flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!summary || isGenerating}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-70"
            >
              <SafeIcon icon={FiIcons.FiSave} className="h-5 w-5 mr-2" />
              Save Enhanced Summary
            </button>
          </div>
        </motion.div>
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