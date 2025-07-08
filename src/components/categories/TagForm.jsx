import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function TagForm({ tag, onClose, onSave }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form with tag data if editing
  useEffect(() => {
    if (tag) {
      setName(tag.name || '');
    }
  }, [tag]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a tag name');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await onSave({ name });
    } catch (err) {
      console.error("Error saving tag:", err);
      setError(err.message || 'An error occurred while saving tag');
      setIsLoading(false);
    }
  };
  
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
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FF0000] text-white flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <SafeIcon icon={FiIcons.FiTag} className="mr-2" />
            {tag ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-red-700 focus:outline-none"
          >
            <SafeIcon icon={FiIcons.FiX} className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Tag Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name"
                className="block w-full rounded-md shadow-sm focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm border-gray-300"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Tags help you organize and filter your bookmarks. Good examples: "JavaScript", "Tutorial", "Recipes"
              </p>
            </div>
            
            {/* Preview */}
            <div className="border border-gray-200 rounded-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <SafeIcon icon={FiIcons.FiTag} className="h-3 w-3 mr-1" />
                {name || 'Tag Name'}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiIcons.FiSave} className="h-4 w-4 mr-2" />
                  {tag ? 'Update Tag' : 'Create Tag'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}