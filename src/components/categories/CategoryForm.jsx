import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function CategoryForm({ category, onClose, onSave }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setColor(category.color || '#3B82F6');
      setIcon(category.icon || '');
    }
  }, [category]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await onSave({
        name,
        color,
        icon: icon || null,
      });
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message || 'An error occurred while saving category');
      setIsLoading(false);
    }
  };
  
  // Available colors for selection
  const colorOptions = [
    { value: '#EF4444', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#10B981', label: 'Green' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#6366F1', label: 'Indigo' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#6B7280', label: 'Gray' },
  ];
  
  // Available icons from FiIcons
  const iconOptions = [
    'Folder',
    'BookOpen',
    'Video',
    'Music',
    'Code',
    'Star',
    'Heart',
    'Monitor',
    'Coffee',
    'Briefcase',
    'Globe',
    'Book',
    'Bookmark',
    'Film',
    'Image',
  ];
  
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
            <SafeIcon icon={FiIcons.FiFolder} className="mr-2" />
            {category ? 'Edit Category' : 'Create New Category'}
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
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                className="block w-full rounded-md shadow-sm focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm border-gray-300"
                required
              />
            </div>
            
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`h-8 w-full rounded-md border-2 ${
                      color === colorOption.value ? 'border-gray-800' : 'border-transparent'
                    } focus:outline-none`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.label}
                  />
                ))}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500 mr-2">Custom:</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 border-0 p-0 rounded"
                />
                <div 
                  className="ml-2 px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: color, color: isLightColor(color) ? '#000' : '#fff' }}
                >
                  {color}
                </div>
              </div>
            </div>
            
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Optional)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIcon('')}
                  className={`flex items-center justify-center h-10 rounded-md border ${
                    icon === '' ? 'border-[#FF0000] bg-red-50' : 'border-gray-300'
                  } focus:outline-none`}
                >
                  <SafeIcon icon={FiIcons.FiX} className="h-4 w-4" />
                </button>
                
                {iconOptions.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex items-center justify-center h-10 rounded-md border ${
                      icon === iconName ? 'border-[#FF0000] bg-red-50' : 'border-gray-300'
                    } focus:outline-none`}
                  >
                    <SafeIcon name={iconName} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preview */}
            <div className="border border-gray-200 rounded-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <div 
                  className="p-2 rounded-md mr-2"
                  style={{ backgroundColor: color }}
                >
                  <SafeIcon 
                    name={icon || 'Folder'} 
                    className="h-5 w-5 text-white" 
                  />
                </div>
                <span className="font-medium">{name || 'Category Name'}</span>
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
                  {category ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Helper function to determine if a color is light or dark
function isLightColor(color) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}