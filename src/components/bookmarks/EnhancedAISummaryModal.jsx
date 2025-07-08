import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { generateSummary, fetchDetailedModels, SMART_LLM_SELECTORS, getUserInfo } from '../../lib/straico-api-enhanced';
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
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  // New state for transcript functionality
  const [transcript, setTranscript] = useState('');
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [transcriptInputMode, setTranscriptInputMode] = useState('text'); // 'text' or 'file'
  const [transcriptError, setTranscriptError] = useState('');

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

  // Fetch user settings with proper error handling for missing columns
  const fetchUserSettings = async () => {
    console.log('🔍 EnhancedAISummaryModal: Fetching user settings for user:', user?.id);
    setIsLoadingSettings(true);
    setError('');

    try {
      // First, try to get basic settings
      const { data: basicData, error: basicError } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key, straico_model_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (basicError) {
        console.error('🔍 EnhancedAISummaryModal: Error fetching basic settings:', basicError);
        if (basicError.code !== 'PGRST116') {
          setError(`Failed to load user settings: ${basicError.message}`);
          setIsLoadingSettings(false);
          return;
        }
      }

      // Then try to get enhanced settings, but handle missing columns gracefully
      let enhancedData = null;
      try {
        const { data: extendedData, error: extendedError } = await supabase
          .from('user_settings_bk4576hgty')
          .select('smart_selector_preference, use_smart_selector')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!extendedError) {
          enhancedData = extendedData;
        } else {
          console.warn('🔍 Enhanced settings not available:', extendedError.message);
        }
      } catch (err) {
        console.warn('🔍 Enhanced settings columns may not exist:', err.message);
      }

      if (basicData && basicData.straico_api_key) {
        const userApiKey = basicData.straico_api_key;
        const userModelId = basicData.straico_model_id || '';
        const userSmartSelectorPreference = enhancedData?.smart_selector_preference || SMART_LLM_SELECTORS.QUALITY;
        const userUseSmartSelector = enhancedData?.use_smart_selector !== false;

        console.log('🔍 EnhancedAISummaryModal: Found API key, length:', userApiKey.length);
        console.log('🔍 EnhancedAISummaryModal: Settings loaded:', {
          modelId: userModelId,
          smartSelectorPreference: userSmartSelectorPreference,
          useSmartSelector: userUseSmartSelector
        });

        setApiKey(userApiKey);
        setSelectedModelId(userModelId);
        setUseSmartSelector(userUseSmartSelector);
        setSmartSelectorType(userSmartSelectorPreference);

        // Load models and user info
        await Promise.all([
          loadModels(userApiKey),
          loadUserInfo(userApiKey)
        ]);
      } else {
        console.log('🔍 EnhancedAISummaryModal: No API key found in settings');
        showApiKeyRequiredError();
      }
    } catch (err) {
      console.error('🔍 EnhancedAISummaryModal: Exception in fetchUserSettings:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Load user account information
  const loadUserInfo = async (key) => {
    try {
      const info = await getUserInfo(key);
      setUserInfo(info.user);
      console.log('🔍 EnhancedAISummaryModal: User info loaded:', info.user);
    } catch (err) {
      console.warn('🔍 EnhancedAISummaryModal: Could not load user info:', err);
    }
  };

  // Load models from Straico API
  const loadModels = async (key = apiKey) => {
    if (!key || key.trim() === '') {
      console.log('🔍 EnhancedAISummaryModal: No API key provided for loading models');
      showApiKeyRequiredError();
      return;
    }

    console.log('🔍 EnhancedAISummaryModal: Loading models with API key length:', key.length);
    setIsLoadingModels(true);
    setError('');

    try {
      const result = await fetchDetailedModels(key);
      const chatModels = result.chatModels || [];
      setModels(chatModels);

      console.log('🔍 EnhancedAISummaryModal: Models loaded successfully:', chatModels.length);

      // Auto-select first model if none selected
      if (!selectedModelId && chatModels.length > 0) {
        setSelectedModelId(chatModels[0].id);
        console.log('🔍 EnhancedAISummaryModal: Auto-selected model:', chatModels[0].id);
      }
    } catch (err) {
      console.error('🔍 EnhancedAISummaryModal: Error loading models:', err);
      if (err.message.includes('API key') || err.message.includes('Invalid') || err.message.includes('401')) {
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
      message: 'You need to configure your Straico API key before generating AI summaries. Please go to Settings → AI API Settings to add your valid Straico API key.',
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
      message: `${errorMessage} Please check your API key in Settings → AI API Settings and ensure it's valid and has the necessary permissions.`,
      actionText: 'Go to Settings',
      onAction: () => {
        setShowErrorModal(false);
        onClose();
        window.location.hash = '#settings';
      }
    });
    setShowErrorModal(true);
  };

  // Handle transcript file upload
  const handleTranscriptFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTranscriptError('');
    
    // Validate file type
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      setTranscriptError('Please upload a text file (.txt)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setTranscriptError('File size must be less than 5MB');
      return;
    }

    setTranscriptFile(file);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (content.length > 50000) {
        setTranscriptError('Transcript must be less than 50,000 characters');
        return;
      }
      setTranscript(content);
    };
    reader.onerror = () => {
      setTranscriptError('Error reading file');
    };
    reader.readAsText(file);
  };

  // Handle transcript text change
  const handleTranscriptTextChange = (e) => {
    const text = e.target.value;
    setTranscript(text);
    setTranscriptError('');
    
    if (text.length > 50000) {
      setTranscriptError('Transcript must be less than 50,000 characters');
    }
  };

  // Validate inputs before generation
  const validateInputs = () => {
    if (!apiKey || apiKey.trim() === '') {
      showApiKeyRequiredError();
      return false;
    }

    if (!useSmartSelector && !selectedModelId) {
      setError('Please select a model or enable smart model selection');
      return false;
    }

    if (!bookmark.url) {
      setError('Video URL is required');
      return false;
    }

    if (transcript.length > 50000) {
      setTranscriptError('Transcript must be less than 50,000 characters');
      return false;
    }

    return true;
  };

  // Generate summary using enhanced API with transcript
  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    console.log('🔍 EnhancedAISummaryModal: Starting enhanced summary generation');
    setIsGenerating(true);
    setError('');
    setGenerationResult(null);

    try {
      // Create enhanced prompt with both URL and transcript
      let enhancedPrompt = customPrompt.trim() || 'Please provide a comprehensive summary focusing on the key points, main ideas, and important details.';
      
      if (transcript.trim()) {
        enhancedPrompt += `\n\nVideo URL: ${bookmark.url}\n\nVideo Transcript:\n${transcript}`;
      } else {
        enhancedPrompt += `\n\nVideo URL: ${bookmark.url}`;
      }

      const options = {
        useSmartSelector,
        smartSelectorType,
        temperature,
        maxTokens,
        customPrompt: enhancedPrompt
      };

      const result = await generateSummary(
        bookmark.url,
        apiKey,
        selectedModelId,
        options
      );

      console.log('🔍 EnhancedAISummaryModal: Summary generated successfully');
      setSummary(result.summary);
      setGenerationResult(result);
    } catch (err) {
      console.error('🔍 EnhancedAISummaryModal: Error generating summary:', err);
      if (err.message.includes('API key') || err.message.includes('Invalid') || err.message.includes('401')) {
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

  // Show loading state while fetching settings
  if (isLoadingSettings) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden p-6"
        >
          <div className="flex items-center justify-center">
            <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-blue-500 mr-3" />
            <span className="text-gray-700">Loading enhanced AI settings...</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
          className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
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
            <div className={`p-3 rounded-md ${
              apiKey ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
            }`}>
              <div className="flex items-start">
                <SafeIcon 
                  icon={apiKey ? FiIcons.FiCheck : FiIcons.FiAlertTriangle} 
                  className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" 
                />
                <div className="text-sm">
                  {apiKey ? (
                    <>
                      <p className="font-medium">Straico API Key Connected</p>
                      <p>API key is configured and ready for enhanced AI features. Key length: {apiKey.length} characters</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">No Straico API Key Found</p>
                      <p>Please configure your API key in Settings → AI API Settings before generating AI summaries.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video URL */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Video Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium text-gray-900 mb-1">{bookmark.title}</p>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {bookmark.url}
                  </a>
                  {bookmark.description && (
                    <p className="text-sm text-gray-600 mt-2">{bookmark.description}</p>
                  )}
                </div>
              </div>

              {/* Transcript Input */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Video Transcript (Optional)</h3>
                <div className="space-y-3">
                  {/* Input Mode Toggle */}
                  <div className="flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTranscriptInputMode('text')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border focus:outline-none ${
                        transcriptInputMode === 'text'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <SafeIcon icon={FiIcons.FiEdit} className="h-4 w-4 mr-2 inline" />
                      Paste Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setTranscriptInputMode('file')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 focus:outline-none ${
                        transcriptInputMode === 'file'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <SafeIcon icon={FiIcons.FiUpload} className="h-4 w-4 mr-2 inline" />
                      Upload File
                    </button>
                  </div>

                  {/* Text Input */}
                  {transcriptInputMode === 'text' && (
                    <div>
                      <textarea
                        value={transcript}
                        onChange={handleTranscriptTextChange}
                        placeholder="Paste your video transcript here to enhance the summary accuracy..."
                        rows="6"
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                          Adding a transcript will improve summary accuracy
                        </p>
                        <span className={`text-xs ${transcript.length > 45000 ? 'text-red-500' : 'text-gray-500'}`}>
                          {transcript.length}/50,000
                        </span>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  {transcriptInputMode === 'file' && (
                    <div>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <SafeIcon icon={FiIcons.FiUpload} className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> transcript file
                            </p>
                            <p className="text-xs text-gray-500">TXT files only (MAX 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".txt,text/plain"
                            onChange={handleTranscriptFileChange}
                          />
                        </label>
                      </div>
                      {transcriptFile && (
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <SafeIcon icon={FiIcons.FiFile} className="h-4 w-4 mr-2" />
                          <span>{transcriptFile.name}</span>
                          <button
                            onClick={() => {
                              setTranscriptFile(null);
                              setTranscript('');
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <SafeIcon icon={FiIcons.FiX} className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transcript Error */}
                  {transcriptError && (
                    <div className="text-sm text-red-600 flex items-center">
                      <SafeIcon icon={FiIcons.FiAlertCircle} className="h-4 w-4 mr-1" />
                      {transcriptError}
                    </div>
                  )}
                </div>
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
                    
                    {isLoadingModels ? (
                      <div className="flex items-center justify-center py-4">
                        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-5 w-5 mr-2 text-purple-500" />
                        <span className="text-sm text-gray-600">Loading models from Straico API...</span>
                      </div>
                    ) : (
                      <select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        disabled={models.length === 0 || !apiKey || isGenerating}
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
                    )}
                    
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
                              <p className="text-gray-500 mt-1">Max tokens: {selectedModel.max_tokens}</p>
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
                  {transcript && (
                    <p><strong>Transcript:</strong> Used ({transcript.length} characters)</p>
                  )}
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