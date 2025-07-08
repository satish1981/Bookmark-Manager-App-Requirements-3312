import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { fetchModels } from '../../lib/straico-api';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabase';
import { ensureUserSettingsTable } from '../../lib/database-schema';
import ErrorModal from '../common/ErrorModal';

export default function ModelSelector() {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({});

  // Fetch user settings (API key and selected model) on component mount
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  // Fetch the user's stored settings
  const fetchUserSettings = async () => {
    setIsLoading(true);
    try {
      // Ensure table exists first
      const schemaResult = await ensureUserSettingsTable();
      if (!schemaResult.success) {
        console.error('Failed to ensure user settings table:', schemaResult.error);
        setError('Failed to access database settings');
        return;
      }

      const { data, error } = await supabase
        .from('user_settings_bk4576hgty')
        .select('straico_api_key, straico_model_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        if (error.code !== 'PGRST116') {  // Not found error
          setError('Failed to load user settings');
        }
      } else if (data) {
        setApiKey(data.straico_api_key || '');
        setSelectedModelId(data.straico_model_id || '');

        // Auto-load models if API key is available
        if (data.straico_api_key) {
          loadModels(data.straico_api_key);
        }
      }
    } catch (err) {
      console.error('Error in fetchUserSettings:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Load models from Straico API (no mock data allowed)
  const loadModels = async (key = apiKey) => {
    if (!key || key.trim() === '') {
      showApiKeyRequiredError();
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Show API key required error modal
  const showApiKeyRequiredError = () => {
    setErrorModalData({
      title: 'Straico API Key Required',
      message: 'You need to enter your Straico API key to fetch available AI models. Please go to the API Key Manager section above and add your valid Straico API key.',
      actionText: 'Go to API Key Manager',
      onAction: () => {
        setShowErrorModal(false);
        // Scroll to API key manager section
        const apiKeySection = document.querySelector('[data-section="api-key-manager"]');
        if (apiKeySection) {
          apiKeySection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    setShowErrorModal(true);
  };

  // Show API key validation error modal
  const showApiKeyError = (errorMessage) => {
    setErrorModalData({
      title: 'Invalid Straico API Key',
      message: `${errorMessage} Please check your API key in the API Key Manager section above and ensure it's valid and has the necessary permissions.`,
      actionText: 'Check API Key',
      onAction: () => {
        setShowErrorModal(false);
        // Scroll to API key manager section
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

  // Save selected model to database
  const saveSelectedModel = async () => {
    if (!selectedModelId) {
      setError('Please select a model');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Ensure table exists first
      const schemaResult = await ensureUserSettingsTable();
      if (!schemaResult.success) {
        throw new Error(`Database setup failed: ${schemaResult.error}`);
      }

      const { error } = await supabase
        .from('user_settings_bk4576hgty')
        .upsert({
          user_id: user.id,
          straico_model_id: selectedModelId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving model selection:', error);
        throw new Error('Failed to save model selection');
      }

      setSuccess('Model selection saved successfully');
    } catch (err) {
      console.error('Error in saveSelectedModel:', err);
      setError(err.message || 'Failed to save model selection');
    } finally {
      setIsSaving(false);
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return price;
    }
    return `$${price} per 1K tokens`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiCpu} className="mr-2 text-purple-500" />
          Straico Model Selection
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Select an AI model to use for content summarization and analysis.
          <strong className="text-red-600"> A valid Straico API key is required to fetch and use models.</strong>
        </p>

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

        {/* API key status */}
        <div className={`mb-4 p-3 rounded-md ${apiKey ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
          <div className="flex items-start">
            <SafeIcon icon={apiKey ? FiIcons.FiCheck : FiIcons.FiAlertTriangle} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              {apiKey ? (
                <p className="text-sm">API key is configured. You can fetch and select Straico models.</p>
              ) : (
                <>
                  <p className="text-sm font-medium">No API Key Found</p>
                  <p className="text-sm">Please add your Straico API key in the API Key Manager section above to fetch available models. Mock data is not available.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-purple-500" />
            <span className="ml-2 text-gray-600">Loading models from Straico API...</span>
          </div>
        )}

        {/* Models list */}
        {!isLoading && models.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">Available Models</h4>
              <button
                onClick={() => loadModels()}
                disabled={!apiKey}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiIcons.FiRefreshCw} className="h-3 w-3 mr-1" />
                Refresh
              </button>
            </div>

            <div className="bg-gray-50 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pricing
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Tokens
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr
                        key={model.id}
                        className={selectedModelId === model.id ? "bg-purple-50" : "hover:bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            id={`model-${model.id}`}
                            name="model-selection"
                            checked={selectedModelId === model.id}
                            onChange={() => handleModelSelect(model.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label htmlFor={`model-${model.id}`} className="cursor-pointer">
                            <div className="text-sm font-medium text-gray-900">{model.name}</div>
                            <div className="text-xs text-gray-500">{model.id}</div>
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{model.description}</div>
                          {model.capabilities && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {model.capabilities.map((capability, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {capability}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {model.pricing && formatPrice(model.pricing)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {model.max_tokens || 'Variable'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={saveSelectedModel}
              disabled={isSaving || !selectedModelId}
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
                  Save Selection
                </>
              )}
            </button>
          </div>
        )}

        {/* No models found or API key missing */}
        {!isLoading && models.length === 0 && (
          <div className="text-center py-8">
            <SafeIcon icon={FiIcons.FiCpu} className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Models Available</h4>
            <p className="text-gray-600 mb-4">
              {!apiKey
                ? "Please add your Straico API key in the API Key Manager section above to load available models."
                : "No models were found. Please verify your API key has access to Straico models."}
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

        {/* Usage information */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">About Straico Models</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>All model data comes directly from Straico API - no mock or simulated data</li>
            <li>Different models have different capabilities and pricing</li>
            <li>More powerful models may provide better results but cost more</li>
            <li>Your selected model will be used for all AI operations</li>
            <li>You can change your selected model at any time</li>
          </ul>
          <div className="mt-3">
            <a
              href="https://docs.straico.com/models"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4 mr-1" />
              Learn more about Straico models
            </a>
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