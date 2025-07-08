import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBookmarks } from '../../context/BookmarkContext';
import { fetchUrlMetadata } from '../../lib/metadata';

export default function BookmarkForm({ bookmark = null, onClose, onSave }) {
  const { categories, tags: allTags, addCategory } = useBookmarks();
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    thumbnail_url: '',
    category_id: '',
    rating: 0,
    status: 'unwatched',
    notes: '',
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form with bookmark data if editing
  useEffect(() => {
    if (bookmark) {
      console.log('Editing bookmark:', bookmark);
      setFormData({
        url: bookmark.url || '',
        title: bookmark.title || '',
        description: bookmark.description || '',
        thumbnail_url: bookmark.thumbnail_url || '',
        category_id: bookmark.category_id || '',
        rating: bookmark.rating || 0,
        status: bookmark.status || 'unwatched',
        notes: bookmark.notes || '',
        tags: bookmark.tags || []
      });
    }
  }, [bookmark]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle URL input and fetch metadata
  const handleUrlChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      url: value
    }));
    // Clear error for this field
    if (errors.url) {
      setErrors(prev => ({
        ...prev,
        url: ''
      }));
    }
  };

  // Fetch metadata for URL
  const handleFetchMetadata = async () => {
    if (!formData.url) {
      setErrors(prev => ({
        ...prev,
        url: 'Please enter a URL'
      }));
      return;
    }

    setIsFetchingMetadata(true);
    try {
      console.log('Fetching metadata for:', formData.url);
      const metadata = await fetchUrlMetadata(formData.url);
      if (metadata.error) {
        setErrors(prev => ({
          ...prev,
          url: metadata.error
        }));
      } else {
        console.log('Metadata received:', metadata);
        setFormData(prev => ({
          ...prev,
          title: metadata.title || prev.title,
          description: metadata.description || prev.description,
          thumbnail_url: metadata.image || prev.thumbnail_url
        }));
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setErrors(prev => ({
        ...prev,
        url: 'Failed to fetch metadata'
      }));
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setFormData(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    const isSelected = formData.tags.some(t => t.id === tag.id);
    if (isSelected) {
      // Remove tag
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t.id !== tag.id)
      }));
    } else {
      // Add tag
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Handle new tag addition
  const handleAddTag = () => {
    if (!newTag.trim()) return;

    // Check if tag already exists in selected tags
    const tagExists = formData.tags.some(
      tag => tag.name.toLowerCase() === newTag.toLowerCase()
    );
    if (tagExists) {
      setNewTag('');
      return;
    }

    // Check if tag exists in all tags
    const existingTag = allTags.find(
      tag => tag.name.toLowerCase() === newTag.toLowerCase()
    );

    if (existingTag) {
      handleTagSelect(existingTag);
    } else {
      // Add new tag
      const tempTag = {
        id: `temp-${Date.now()}`,
        name: newTag
      };
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag]
      }));
    }
    setNewTag('');
  };

  // Handle new category addition
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setIsLoading(true);
    try {
      const { success, category, error } = await addCategory({
        name: newCategory,
        color: newCategoryColor,
      });

      if (success && category) {
        setFormData(prev => ({
          ...prev,
          category_id: category.id
        }));
        setNewCategory('');
      } else {
        setErrors(prev => ({
          ...prev,
          category: error
        }));
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setErrors(prev => ({
        ...prev,
        category: 'Failed to add category'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.url) {
      newErrors.url = 'URL is required';
    } else if (!formData.url.startsWith('http')) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    if (!formData.title) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('===FORM SUBMISSION START===');
    console.log('Form data being submitted:', formData);

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling onSave with:', formData);
      const result = await onSave(formData);
      console.log('onSave result:', result);

      if (result && result.success === false) {
        console.error('Save failed:', result.error);
        setErrors(prev => ({
          ...prev,
          form: result.error
        }));
      } else {
        console.log('Save successful, closing form');
        onClose();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to save bookmark'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: FiIcons.FiInfo },
    { id: 'details', name: 'Details', icon: FiIcons.FiEdit },
    { id: 'tags', name: 'Tags & Category', icon: FiIcons.FiTag },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            {bookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-blue-500 focus:outline-none"
          >
            <SafeIcon icon={FiIcons.FiX} className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SafeIcon icon={tab.icon} className="h-4 w-4 mx-auto mb-1" />
                <div className="truncate">{tab.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <form onSubmit={handleSubmit}>
            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errors.form}
              </div>
            )}

            {/* Desktop Layout */}
            <div className="hidden sm:block">
              <div className="space-y-6">
                {/* URL with metadata fetch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleUrlChange}
                      placeholder="https://example.com or YouTube URL"
                      className={`flex-1 block w-full rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                        errors.url ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleFetchMetadata}
                      disabled={isFetchingMetadata}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none"
                    >
                      {isFetchingMetadata ? (
                        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />
                      ) : (
                        <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4" />
                      )}
                      <span className="ml-2">Fetch</span>
                    </button>
                  </div>
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a YouTube or website URL and click "Fetch" to auto-populate details
                  </p>
                </div>

                {/* Two columns layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Bookmark title"
                        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Brief description of the content"
                        className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                      >
                        <option value="">No Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Thumbnail URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thumbnail URL
                      </label>
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          name="thumbnail_url"
                          value={formData.thumbnail_url}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                        />
                        {formData.thumbnail_url && (
                          <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={formData.thumbnail_url}
                              alt="Thumbnail preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = '';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('unwatched')}
                          className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
                            formData.status === 'unwatched'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <SafeIcon icon={FiIcons.FiClock} className="h-4 w-4 mr-1" />
                          Unwatched
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('watching')}
                          className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
                            formData.status === 'watching'
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <SafeIcon icon={FiIcons.FiPlay} className="h-4 w-4 mr-1" />
                          Watching
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('watched')}
                          className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
                            formData.status === 'watched'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <SafeIcon icon={FiIcons.FiCheckCircle} className="h-4 w-4 mr-1" />
                          Watched
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleRatingChange(i + 1)}
                            className="p-1 focus:outline-none text-xl"
                          >
                            <SafeIcon
                              icon={FiIcons.FiStar}
                              className={`h-6 w-6 ${
                                i < formData.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        {formData.rating > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRatingChange(0)}
                            className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tags"
                      className="flex-1 block w-full rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none disabled:opacity-50"
                    >
                      <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
                      <span className="ml-2">Add</span>
                    </button>
                  </div>

                  {/* Selected tags */}
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <div
                          key={tag.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            <SafeIcon icon={FiIcons.FiX} className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested tags */}
                  {allTags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Suggested tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {allTags
                          .filter(tag => !formData.tags.some(t => t.id === tag.id))
                          .slice(0, 10)
                          .map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleTagSelect(tag)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              {tag.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add your personal notes about this bookmark"
                    className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Tabbed Layout */}
            <div className="sm:hidden">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  {/* URL with metadata fetch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="url"
                        value={formData.url}
                        onChange={handleUrlChange}
                        placeholder="https://example.com"
                        className={`flex-1 block w-full rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                          errors.url ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleFetchMetadata}
                        disabled={isFetchingMetadata}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none"
                      >
                        {isFetchingMetadata ? (
                          <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4" />
                        ) : (
                          <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.url && (
                      <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Bookmark title"
                      className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Brief description"
                      className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail URL
                    </label>
                    <input
                      type="text"
                      name="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    />
                    {formData.thumbnail_url && (
                      <div className="mt-2 h-32 w-full bg-gray-100 rounded overflow-hidden">
                        <img
                          src={formData.thumbnail_url}
                          alt="Thumbnail preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange('unwatched')}
                        className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
                          formData.status === 'unwatched'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <SafeIcon icon={FiIcons.FiClock} className="h-4 w-4 mr-2" />
                        Unwatched
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange('watching')}
                        className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
                          formData.status === 'watching'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <SafeIcon icon={FiIcons.FiPlay} className="h-4 w-4 mr-2" />
                        Watching
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange('watched')}
                        className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
                          formData.status === 'watched'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <SafeIcon icon={FiIcons.FiCheckCircle} className="h-4 w-4 mr-2" />
                        Watched
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleRatingChange(i + 1)}
                          className="p-2 focus:outline-none"
                        >
                          <SafeIcon
                            icon={FiIcons.FiStar}
                            className={`h-8 w-8 ${
                              i < formData.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {formData.rating > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRatingChange(0)}
                        className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear Rating
                      </button>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Personal notes"
                      className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tags' && (
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                    >
                      <option value="">No Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {/* Add new category */}
                    <div className="mt-2 space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                          className="flex-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                        />
                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="h-10 w-10 rounded border border-gray-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim() || isLoading}
                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                      >
                        <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                        Add Category
                      </button>
                      {errors.category && (
                        <p className="text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tags"
                        className="flex-1 block w-full rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none disabled:opacity-50"
                      >
                        <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Selected tags */}
                    {formData.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <div
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag.id)}
                              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                            >
                              <SafeIcon icon={FiIcons.FiX} className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested tags */}
                    {allTags.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                        <div className="flex flex-wrap gap-1">
                          {allTags
                            .filter(tag => !formData.tags.some(t => t.id === tag.id))
                            .slice(0, 8)
                            .map(tag => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagSelect(tag)}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 hover:bg-gray-200"
                              >
                                {tag.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 text-right flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-5 w-5 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <SafeIcon icon={FiIcons.FiSave} className="h-5 w-5 mr-2" />
                {bookmark ? 'Update Bookmark' : 'Save Bookmark'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}