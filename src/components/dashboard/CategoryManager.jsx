import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBookmarks } from '../../context/BookmarkContext';

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useBookmarks();
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { success, error } = await addCategory({
        name: newCategory,
        color: newCategoryColor,
      });
      
      if (success) {
        setNewCategory('');
        setNewCategoryColor('#3B82F6');
      } else {
        setError(error || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditCategory = (category) => {
    setEditingCategory({
      ...category,
      name: category.name,
      color: category.color || '#3B82F6',
    });
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory.name.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { success, error } = await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        color: editingCategory.color,
      });
      
      if (success) {
        setEditingCategory(null);
      } else {
        setError(error || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will unassign the category from all bookmarks but won\'t delete the bookmarks.')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { success, error } = await deleteCategory(categoryId);
      
      if (!success) {
        setError(error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-4 overflow-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiFolder} className="mr-2" />
          Category Manager
        </h2>
        <p className="text-gray-600">
          Create, edit, and manage categories to organize your bookmarks
        </p>
      </div>
      
      {/* Add new category form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300"
                />
                <div 
                  className="h-10 w-10 rounded border border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: newCategoryColor }}
                >
                  <SafeIcon icon={FiIcons.FiFolder} className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !newCategory.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-4 w-4 mr-2" />
                Adding...
              </>
            ) : (
              <>
                <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                Add Category
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Categories list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Categories ({categories.length})
          </h3>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <SafeIcon icon={FiIcons.FiFolder} className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No categories created yet.</p>
            <p className="text-sm">Create your first category above to organize your bookmarks.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-6">
                {editingCategory && editingCategory.id === category.id ? (
                  /* Edit mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            name: e.target.value
                          })}
                          className="block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={editingCategory.color}
                            onChange={(e) => setEditingCategory({
                              ...editingCategory,
                              color: e.target.value
                            })}
                            className="h-10 w-16 rounded border border-gray-300"
                          />
                          <div 
                            className="h-10 w-10 rounded border border-gray-300 flex items-center justify-center"
                            style={{ backgroundColor: editingCategory.color }}
                          >
                            <SafeIcon icon={FiIcons.FiFolder} className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateCategory}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                      >
                        <SafeIcon icon={FiIcons.FiCheck} className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <SafeIcon icon={FiIcons.FiX} className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="h-8 w-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#4B5563' }}
                      >
                        <SafeIcon icon={FiIcons.FiFolder} className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Created {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        disabled={isLoading}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full focus:outline-none"
                        title="Edit category"
                      >
                        <SafeIcon icon={FiIcons.FiEdit} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full focus:outline-none"
                        title="Delete category"
                      >
                        <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}