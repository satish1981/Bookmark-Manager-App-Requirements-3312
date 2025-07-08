/**
 * Straico API client for generating AI summaries of content
 * IMPORTANT: This client only uses real Straico API data - no mock data
 */

const STRAICO_API_ENDPOINT = 'https://api.straico.com';

/**
 * Generate summary for a given URL using Straico API
 * @param {string} url - The URL to summarize
 * @param {string} apiKey - User's Straico API key (required)
 * @param {string} modelId - Selected model ID
 * @returns {Promise<{summary: string, error: string|null}>}
 */
export const generateSummary = async (url, apiKey, modelId) => {
  console.log('🔍 generateSummary called', { url, modelId, hasApiKey: !!apiKey });

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your Straico API key in Settings.');
  }

  try {
    const requestBody = {
      model: modelId,
      message: `Please provide a comprehensive summary of the content at this URL: ${url}. Focus on the key points, main ideas, and important details.`,
      max_tokens: 500
    };

    console.log('🔍 Making request to Straico API', {
      endpoint: `${STRAICO_API_ENDPOINT}/v0/prompt/completion`,
      requestBody
    });

    const response = await fetch(`${STRAICO_API_ENDPOINT}/v0/prompt/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔍 Straico API response status', response.status);

    const data = await response.json();
    console.log('🔍 Straico API response data', data);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid or expired API key. Please check your Straico API key in Settings.');
      }
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return {
      summary: data.data?.completion?.choices?.[0]?.message?.content || 'Summary generated successfully',
      error: null
    };
  } catch (error) {
    console.error('🔍 Straico API error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

/**
 * Fetch available AI models from Straico API
 * @param {string} apiKey - User's Straico API key (required)
 * @returns {Promise<{models: Array, error: string|null}>}
 */
export const fetchModels = async (apiKey) => {
  console.log('🔍 fetchModels called', { hasApiKey: !!apiKey });

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your Straico API key in Settings.');
  }

  try {
    console.log('🔍 Making request to Straico models endpoint');
    const response = await fetch(`${STRAICO_API_ENDPOINT}/v0/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 Models API response status', response.status);

    const data = await response.json();
    console.log('🔍 Models API response data', data);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid or expired API key. Please check your Straico API key in Settings.');
      }
      throw new Error(data.message || `Failed to fetch models. API responded with status ${response.status}`);
    }

    // Transform the response to match our expected format
    const models = data.data || [];
    return {
      models: models.map(model => ({
        id: model.model,
        name: model.name,
        description: `${model.name} AI model`,
        pricing: model.pricing ? `${model.pricing.coins} coins per ${model.pricing.words} words` : 'Contact Straico for pricing',
        max_tokens: model.max_output || 'Variable',
        capabilities: ['text-generation', 'summarization']
      })),
      error: null
    };
  } catch (error) {
    console.error('🔍 Straico API error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

/**
 * Validate Straico API key (basic check)
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} - Whether the key passes basic validation
 */
export const validateApiKeyFormat = (apiKey) => {
  console.log('🔍 validateApiKeyFormat called', { hasApiKey: !!apiKey, type: typeof apiKey, length: apiKey?.length });

  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Only perform basic validation - API key should be a non-empty string
  const isValid = apiKey.trim().length > 0;
  console.log('🔍 API key format validation result', isValid);
  return isValid;
};

/**
 * Verify API key by making a test request to the API
 * @param {string} apiKey - The API key to verify
 * @returns {Promise<{valid: boolean, error: string|null}>}
 */
export const verifyApiKey = async (apiKey) => {
  console.log('🔍 verifyApiKey called', { hasApiKey: !!apiKey, keyLength: apiKey?.length });

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your Straico API key in Settings.');
  }

  try {
    console.log('🔍 Making verification request to Straico user endpoint');
    // Test the API key by making a simple request to the user endpoint
    const response = await fetch(`${STRAICO_API_ENDPOINT}/v0/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 User API response status', response.status);

    const data = await response.json();
    console.log('🔍 User API response data', data);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid or expired API key. Please check your Straico API key in Settings.');
      }
      throw new Error(data.message || `API key verification failed with status ${response.status}`);
    }

    // If we got here, the API key is valid
    console.log('🔍 API key verification successful');
    return { valid: true, error: null };
  } catch (error) {
    console.error('🔍 API key verification error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

/**
 * Check if user has a valid API key stored
 * @param {string} userId - User ID
 * @returns {Promise<{hasKey: boolean, key: string|null}>}
 */
export const checkStoredApiKey = async (userId, supabase) => {
  console.log('🔍 checkStoredApiKey called', { userId });

  if (!userId) {
    return { hasKey: false, key: null };
  }

  try {
    const { data, error } = await supabase
      .from('user_settings_bk4576hgty')
      .select('straico_api_key')
      .eq('user_id', userId)
      .single();

    console.log('🔍 checkStoredApiKey result', { hasData: !!data, hasKey: !!data?.straico_api_key, error });

    if (error || !data || !data.straico_api_key) {
      return { hasKey: false, key: null };
    }

    return { hasKey: true, key: data.straico_api_key };
  } catch (err) {
    console.error('🔍 Error checking stored API key:', err);
    return { hasKey: false, key: null };
  }
};