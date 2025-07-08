/**
 * Utility functions for extracting metadata from URLs
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube video ID or null if not a valid YouTube URL
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Regular expression to match YouTube video IDs from various URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[7].length === 11) ? match[7] : null;
};

/**
 * Get YouTube video thumbnail URL from video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} - URL to the video thumbnail
 */
export const getYouTubeThumbnailUrl = (videoId) => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Fetch metadata for a URL (title, description, image)
 * @param {string} url - Any URL
 * @returns {Promise<{title: string, description: string, image: string, error: string|null}>}
 */
export const fetchUrlMetadata = async (url) => {
  try {
    // Check if it's a YouTube URL first
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      // For YouTube, use the YouTube API or oEmbed to get metadata
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      const data = await response.json();
      
      return {
        title: data.title || '',
        description: data.author_name ? `By ${data.author_name}` : '',
        image: getYouTubeThumbnailUrl(videoId),
        error: null
      };
    }
    
    // For non-YouTube URLs, we would normally use a server-side proxy to fetch metadata
    // Since we're client-side only, we'll use a mock response for non-YouTube URLs
    return {
      title: url.split('/').pop() || 'Website Bookmark',
      description: 'Website content',
      image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2Vic2l0ZXxlbnwwfHwwfHx8MA%3D%3D',
      error: null
    };
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return {
      title: '',
      description: '',
      image: null,
      error: 'Failed to fetch metadata'
    };
  }
};