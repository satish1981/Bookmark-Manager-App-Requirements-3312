import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { generateSummary, fetchModels, checkStoredApiKey } from '../../lib/straico-api';
import supabase from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ErrorModal from '../common/ErrorModal';

export default function AISummaryModal({ bookmark, onClose, onSave }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [models, setModels] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({});

  // Fetch user settings on component mount
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  // Fetch the user's stored settings
  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key, straico_model_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        setError('Failed to load user settings');
        return;
      }

      if (data) {
        const userApiKey = data.straico_api_key || '';
        const userModelId = data.straico_model_id || '';
        
        setApiKey(userApiKey);
        setSelectedModelId(userModelId);
        
        if (userApiKey) {
          loadModels(userApiKey);
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

  // Show API key required error modal
  const showApiKeyRequiredError = () => {
    setErrorModalData({
      title: 'Straico API Key Required',
      message: 'You need to configure your Straico API key before generating AI summaries. Please go to Settings → API Key Manager to add your valid Straico API key.',
      actionText: 'Go to Settings',
      onAction: () => {
        setShowErrorModal(false);
        onClose(); // Close this modal
        // Navigate to settings (you may need to implement navigation logic)
        window.location.hash = '#settings';
      }
    });
    setShowErrorModal(true);
  };

  // Show API key validation error modal
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

  // Load models from Straico API
  const loadModels = async (key = apiKey) => {
    if (!key || key.trim() === '') {
      showApiKeyRequiredError();
      return;
    }

    setIsLoadingModels(true);
    setError('');
    
    try {
      const result = await fetchModels(key);
      setModels(result.models);
      
      // If no model is selected but models are available, select the first one
      if (!selectedModelId && result.models.length > 0) {
        setSelectedModelId(result.models[0].id);
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

  const handleGenerate = async () => {
    if (!apiKey || apiKey.trim() === '') {
      showApiKeyRequiredError();
      return;
    }

    if (!selectedModelId) {
      setError('Please select a model for AI summary generation');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const result = await generateSummary(bookmark.url, apiKey, selectedModelId);
      setSummary(result.summary);
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

  const handleSave = () => {
    if (!summary) {
      setError('Please generate a summary first');
      return;
    }
    
    onSave(summary);
  };

  const handleModelChange = (e) => {
    setSelectedModelId(e.target.value);
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
          className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-purple-600 text-white flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center">
              <SafeIcon icon={FiIcons.FiCpu} className="mr-2" />
              Generate AI Summary
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-purple-500 focus:outline-none"
            >
              <SafeIcon icon={FiIcons.FiX} className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                <div className="flex items-start">
                  <SafeIcon icon={FiIcons.FiAlertCircle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* API Key Status */}
            <div className={`mb-4 p-3 rounded-md ${apiKey ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-start">
                <SafeIcon
                  icon={apiKey ? FiIcons.FiCheck : FiIcons.FiAlertTriangle}
                  className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm">
                  {apiKey ? (
                    <p>Straico API key is configured and ready for use.</p>
                  ) : (
                    <>
                      <p className="font-medium">No Straico API Key Found</p>
                      <p>Please configure your API key in Settings before generating AI summaries.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-1">Bookmark</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{bookmark.title}</p>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {bookmark.url}
                </a>
              </div>
            </div>

            {/* Model selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  AI Model
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
                  {isLoadingModels ? "Loading..." : "Refresh Models"}
                </button>
              </div>

              <select
                value={selectedModelId}
                onChange={handleModelChange}
                disabled={models.length === 0 || isLoadingModels || !apiKey}
                className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 disabled:bg-gray-100"
              >
                {models.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  <>
                    <option value="">Select a model</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.pricing ? `(${model.pricing})` : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {!apiKey
                  ? "Configure your API key in Settings to load models"
                  : models.length === 0
                  ? "No models found. Please check your API key permissions."
                  : "Select the AI model to use for generating the summary"}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Generated Summary
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !apiKey || !selectedModelId}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4 mr-1" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiIcons.FiCpu} className="h-4 w-4 mr-1" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="AI-generated summary will appear here (requires valid Straico API key)"
                rows="8"
                className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300"
              />
              <p className="mt-1 text-xs text-gray-500">
                This summary will be generated using Straico's live API and saved with your bookmark
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
              Save Summary
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