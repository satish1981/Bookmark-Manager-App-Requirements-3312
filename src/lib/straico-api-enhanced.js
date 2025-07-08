/**
 * Enhanced Straico API client with full feature support
 * Based on official Straico API documentation
 * IMPORTANT: This client only uses real Straico API data - no mock data
 */

const STRAICO_API_BASE = 'https://api.straico.com';
const STRAICO_API_VERSION = 'v0';
const STRAICO_API_V1_VERSION = 'v1';

// Smart LLM selector options
export const SMART_LLM_SELECTORS = {
  QUALITY: 'quality',
  BALANCE: 'balance',
  BUDGET: 'budget'
};

// Supported file types for upload
export const SUPPORTED_FILE_TYPES = [
  'pdf', 'docx', 'pptx', 'txt', 'xlsx', 'mp3', 'mp4', 'html', 'csv', 
  'json', 'py', 'php', 'js', 'css', 'cs', 'swift', 'kt', 'xml', 'ts', 
  'png', 'jpg', 'jpeg', 'webp', 'gif'
];

// Image sizes
export const IMAGE_SIZES = {
  SQUARE: 'square',
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait'
};

/**
 * Make authenticated API request to Straico
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} apiKey - User's Straico API key
 * @param {string} version - API version (v0 or v1)
 * @returns {Promise<Object>} API response
 */
const makeApiRequest = async (endpoint, options = {}, apiKey, version = STRAICO_API_VERSION) => {
  console.log('🔍 Making Straico API request:', { endpoint, version, hasApiKey: !!apiKey });
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your Straico API key in Settings.');
  }

  const url = `${STRAICO_API_BASE}/${version}${endpoint}`;
  
  const defaultHeaders = {
    'Authorization': `Bearer ${apiKey}`
  };

  // Set Content-Type based on request type
  if (options.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  console.log('🔍 Request details:', {
    url,
    method: requestOptions.method || 'GET',
    hasBody: !!requestOptions.body,
    contentType: requestOptions.headers['Content-Type']
  });

  try {
    const response = await fetch(url, requestOptions);
    console.log('🔍 API response status:', response.status);

    const data = await response.json();
    console.log('🔍 API response data:', data);

    if (!response.ok) {
      const errorMessage = getErrorMessage(response.status, data);
      throw new Error(errorMessage);
    }

    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('🔍 Straico API error:', error);
    
    // Re-throw with enhanced error information
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Straico API. Please check your internet connection.');
    }
    
    throw error;
  }
};

/**
 * Get user-friendly error message based on status code and response
 * @param {number} status - HTTP status code
 * @param {Object} data - Response data
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (status, data) => {
  const baseMessage = data?.message || 'Unknown error occurred';
  
  switch (status) {
    case 400:
      return `Invalid request: ${baseMessage}`;
    case 401:
      return 'Invalid or expired API key. Please check your Straico API key in Settings.';
    case 403:
      return `Access forbidden: ${baseMessage}. Please check your API key permissions.`;
    case 404:
      return `Resource not found: ${baseMessage}`;
    case 429:
      return 'Rate limit exceeded. Please wait a moment before trying again.';
    case 500:
      return `Straico server error: ${baseMessage}. Please try again later.`;
    default:
      return `API error (${status}): ${baseMessage}`;
  }
};

/**
 * Get user information
 * @param {string} apiKey - User's Straico API key
 * @returns {Promise<Object>} User data including coins, plan, etc.
 */
export const getUserInfo = async (apiKey) => {
  console.log('🔍 getUserInfo called');
  
  const response = await makeApiRequest('/user', {
    method: 'GET'
  }, apiKey);
  
  return {
    user: response.data,
    error: null
  };
};

/**
 * Fetch available AI models (v0 - basic list)
 * @param {string} apiKey - User's Straico API key
 * @returns {Promise<Object>} Models list with pricing and limits
 */
export const fetchModels = async (apiKey) => {
  console.log('🔍 fetchModels called (v0)');
  
  const response = await makeApiRequest('/models', {
    method: 'GET'
  }, apiKey);
  
  // Transform the response to match our expected format
  const models = response.data.map(model => ({
    id: model.model,
    name: model.name,
    description: `${model.name} AI model`,
    pricing: model.pricing ? 
      `${model.pricing.coins} coins per ${model.pricing.words} words` : 
      'Contact Straico for pricing',
    max_tokens: model.max_output || 'Variable',
    capabilities: ['text-generation', 'summarization'],
    provider: model.model.split('/')[0] || 'Unknown',
    category: 'chat'
  }));
  
  return {
    models,
    error: null
  };
};

/**
 * Fetch detailed categorized models (v1 - with metadata)
 * @param {string} apiKey - User's Straico API key
 * @returns {Promise<Object>} Detailed models with categories and metadata
 */
export const fetchDetailedModels = async (apiKey) => {
  console.log('🔍 fetchDetailedModels called (v1)');
  
  const response = await makeApiRequest('/models', {
    method: 'GET'
  }, apiKey, STRAICO_API_V1_VERSION);
  
  const chatModels = response.data.chat?.map(model => ({
    id: model.model,
    name: model.name,
    description: model.metadata?.description || `${model.name} chat model`,
    pricing: model.pricing ? 
      `${model.pricing.coins} coins per ${model.pricing.words || 100} words` : 
      'Variable pricing',
    max_tokens: model.max_output || model.word_limit || 'Variable',
    capabilities: ['text-generation', 'conversation', 'summarization'],
    provider: model.model.split('/')[0] || 'Unknown',
    category: 'chat',
    metadata: {
      pros: model.metadata?.pros || [],
      cons: model.metadata?.cons || [],
      applications: model.metadata?.applications || [],
      wordLimit: model.word_limit
    }
  })) || [];

  const imageModels = response.data.image?.map(model => ({
    id: model.model,
    name: model.name,
    description: model.metadata?.description || `${model.name} image generation model`,
    pricing: model.pricing ? 
      `${model.pricing.coins} coins per image` : 
      'Variable pricing',
    max_tokens: 'N/A',
    capabilities: ['image-generation'],
    provider: model.model.split('/')[0] || 'Unknown',
    category: 'image',
    metadata: {
      pros: model.metadata?.pros || [],
      cons: model.metadata?.cons || [],
      applications: model.metadata?.applications || [],
      supportedSizes: ['square', 'landscape', 'portrait']
    }
  })) || [];
  
  return {
    models: [...chatModels, ...imageModels],
    chatModels,
    imageModels,
    error: null
  };
};

/**
 * Generate content summary using Straico API with enhanced options
 * @param {string} content - Content to summarize (URL or text)
 * @param {string} apiKey - User's Straico API key
 * @param {string} modelId - Selected model ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Generated summary with usage info
 */
export const generateSummary = async (content, apiKey, modelId, options = {}) => {
  console.log('🔍 generateSummary called', { 
    contentLength: content?.length, 
    modelId, 
    hasApiKey: !!apiKey,
    options 
  });

  const {
    useSmartSelector = false,
    smartSelectorType = SMART_LLM_SELECTORS.QUALITY,
    temperature = 0.7,
    maxTokens = 500,
    customPrompt = null
  } = options;

  // Create the message based on content type
  let message;
  if (content.startsWith('http')) {
    message = customPrompt || 
      `Please provide a comprehensive summary of the content at this URL: ${content}. Focus on the key points, main ideas, and important details.`;
  } else {
    message = customPrompt || 
      `Please provide a comprehensive summary of the following content: ${content}. Focus on the key points, main ideas, and important details.`;
  }

  const requestBody = {
    message,
    temperature,
    max_tokens: maxTokens,
    replace_failed_models: true
  };

  // Use smart selector or specific model
  if (useSmartSelector) {
    requestBody.smart_llm_selector = smartSelectorType;
  } else {
    requestBody.model = modelId;
  }

  console.log('🔍 Making summary request with body:', requestBody);

  const response = await makeApiRequest('/prompt/completion', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  }, apiKey);

  const completion = response.data.completion;
  const summary = completion?.choices?.[0]?.message?.content || 'Summary generated successfully';

  return {
    summary,
    usage: {
      inputTokens: response.data.words?.input || 0,
      outputTokens: response.data.words?.output || 0,
      totalTokens: response.data.words?.total || 0,
      cost: response.data.price?.total || 0
    },
    model: completion?.model || modelId,
    provider: completion?.provider || 'Unknown',
    justification: response.data.model_selector_justification || null,
    error: null
  };
};

/**
 * Generate enhanced prompt completion with multiple model support (v1)
 * @param {string} prompt - The prompt text
 * @param {string} apiKey - User's Straico API key
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Enhanced completion response
 */
export const generateEnhancedCompletion = async (prompt, apiKey, options = {}) => {
  console.log('🔍 generateEnhancedCompletion called (v1)', { 
    promptLength: prompt?.length, 
    hasApiKey: !!apiKey,
    options 
  });

  const {
    models = [],
    files = [],
    temperature = 0.7,
    maxTokens = 1000,
    useSmartSelector = true,
    smartSelectorType = SMART_LLM_SELECTORS.QUALITY
  } = options;

  const requestBody = {
    message: prompt,
    temperature,
    max_tokens: maxTokens
  };

  // Add models or smart selector
  if (useSmartSelector) {
    requestBody.smart_llm_selector = smartSelectorType;
  } else if (models.length > 0) {
    requestBody.models = models.slice(0, 4); // Max 4 models
  }

  // Add files if provided
  if (files.length > 0) {
    requestBody.files = files;
  }

  const response = await makeApiRequest('/prompt/completion', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  }, apiKey, STRAICO_API_V1_VERSION);

  return {
    completion: response.data,
    error: null
  };
};

/**
 * Upload file to Straico
 * @param {File} file - File to upload
 * @param {string} apiKey - User's Straico API key
 * @returns {Promise<Object>} Upload response with file URL
 */
export const uploadFile = async (file, apiKey) => {
  console.log('🔍 uploadFile called', { 
    fileName: file?.name, 
    fileSize: file?.size,
    fileType: file?.type,
    hasApiKey: !!apiKey 
  });

  // Validate file size (25MB limit)
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 25MB limit');
  }

  // Validate file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
    throw new Error(`File type .${fileExtension} is not supported. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}`);
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await makeApiRequest('/file/upload', {
    method: 'POST',
    body: formData
  }, apiKey);

  return {
    url: response.data.url,
    error: null
  };
};

/**
 * Generate image using Straico API
 * @param {string} description - Image description
 * @param {string} apiKey - User's Straico API key
 * @param {Object} options - Image generation options
 * @returns {Promise<Object>} Generated images with metadata
 */
export const generateImage = async (description, apiKey, options = {}) => {
  console.log('🔍 generateImage called', { 
    descriptionLength: description?.length, 
    hasApiKey: !!apiKey,
    options 
  });

  const {
    model = 'openai/dall-e-3',
    size = IMAGE_SIZES.SQUARE,
    variations = 1,
    seed = null,
    enhance = false,
    customEnhancer = null
  } = options;

  const requestBody = {
    model,
    description,
    size,
    variations: Math.min(Math.max(variations, 1), 4) // Ensure 1-4 range
  };

  // Add optional parameters
  if (seed !== null) {
    requestBody.seed = seed;
  }
  if (enhance) {
    requestBody.enhance = enhance;
  }
  if (customEnhancer) {
    requestBody.customEnhancer = customEnhancer;
  }

  const response = await makeApiRequest('/image/generation', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  }, apiKey);

  return {
    images: response.data.images || [],
    zipUrl: response.data.zip || null,
    pricing: response.data.price || {},
    enhancedPrompt: response.data.promptEnhanced || description,
    enhancer: response.data.enhancer || null,
    error: null
  };
};

/**
 * Validate Straico API key format (enhanced validation)
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} Whether the key passes validation
 */
export const validateApiKeyFormat = (apiKey) => {
  console.log('🔍 validateApiKeyFormat called', { 
    hasApiKey: !!apiKey, 
    type: typeof apiKey, 
    length: apiKey?.length 
  });

  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Enhanced format validation
  const trimmedKey = apiKey.trim();
  
  // Basic checks
  if (trimmedKey.length === 0) {
    return false;
  }

  // Check for common invalid patterns
  if (trimmedKey.includes(' ') || 
      trimmedKey.includes('\n') || 
      trimmedKey.includes('\t')) {
    return false;
  }

  // Minimum length check (typical API keys are longer)
  if (trimmedKey.length < 10) {
    return false;
  }

  console.log('🔍 API key format validation result', true);
  return true;
};

/**
 * Verify API key by making a test request to the user endpoint
 * @param {string} apiKey - The API key to verify
 * @returns {Promise<Object>} Verification result with user info
 */
export const verifyApiKey = async (apiKey) => {
  console.log('🔍 verifyApiKey called', { 
    hasApiKey: !!apiKey, 
    keyLength: apiKey?.length 
  });

  if (!validateApiKeyFormat(apiKey)) {
    throw new Error('Invalid API key format. Please check your Straico API key.');
  }

  try {
    const userInfo = await getUserInfo(apiKey);
    console.log('🔍 API key verification successful', userInfo);
    
    return {
      valid: true,
      user: userInfo.user,
      error: null
    };
  } catch (error) {
    console.error('🔍 API key verification failed:', error);
    throw error;
  }
};

/**
 * Test API connectivity and get system status
 * @param {string} apiKey - User's Straico API key
 * @returns {Promise<Object>} System status and capabilities
 */
export const getSystemStatus = async (apiKey) => {
  console.log('🔍 getSystemStatus called');

  try {
    const [userInfo, models] = await Promise.all([
      getUserInfo(apiKey).catch(err => ({ error: err.message })),
      fetchModels(apiKey).catch(err => ({ error: err.message }))
    ]);

    return {
      status: 'operational',
      user: userInfo.user || null,
      userError: userInfo.error,
      modelsCount: models.models?.length || 0,
      modelsError: models.error,
      timestamp: new Date().toISOString(),
      error: null
    };
  } catch (error) {
    console.error('🔍 System status check failed:', error);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Export utility constants
export {
  STRAICO_API_BASE,
  STRAICO_API_VERSION,
  STRAICO_API_V1_VERSION
};