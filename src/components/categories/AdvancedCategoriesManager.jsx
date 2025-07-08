import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBookmarks } from '../../context/BookmarkContext';
import CategoryTree from './CategoryTree';
import TagsList from './TagsList';
import CategoryForm from './CategoryForm';
import TagForm from './TagForm';
import ConfirmationModal from '../common/ConfirmationModal';

export default function AdvancedCategoriesManager() {
  const {
    categories,
    tags,
    categoryRelationships,
    fetchCategories,
    fetchTags,
    fetchCategoryRelationships,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteCategoryRelationship,
    updateCategoryRelationship,
    addCategoryRelationship,
    addTag,
    updateTag,
    deleteTag,
    loading
  } = useBookmarks();
  
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryTree, setCategoryTree] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchTags(),
          fetchCategoryRelationships()
        ]);
      } catch (err) {
        console.error("Error loading categories and tags:", err);
        setError("Failed to load categories and tags data");
      }
    };
    
    loadData();
  }, [fetchCategories, fetchTags, fetchCategoryRelationships]);

  // Build category tree whenever categories or relationships change
  useEffect(() => {
    if (categories.length === 0) return;
    
    // Initialize with expanded state based on category settings
    const newExpandedState = {};
    categories.forEach(cat => {
      if (expandedCategories[cat.id] === undefined) {
        newExpandedState[cat.id] = cat.is_expanded !== false; // Default to true if not set
      } else {
        newExpandedState[cat.id] = expandedCategories[cat.id];
      }
    });
    
    setExpandedCategories(prev => ({...prev, ...newExpandedState}));
    
    // Build the tree
    buildCategoryTree();
  }, [categories, categoryRelationships]);

  const buildCategoryTree = () => {
    // Create a map of parent to children relationships
    const relationshipMap = {};
    
    // Initialize with all categories as potential root nodes
    const rootCategories = [...categories];
    
    // Process all relationships
    if (categoryRelationships && categoryRelationships.length > 0) {
      categoryRelationships.forEach(rel => {
        if (!relationshipMap[rel.parent_id]) {
          relationshipMap[rel.parent_id] = [];
        }
        relationshipMap[rel.parent_id].push({
          ...categories.find(c => c.id === rel.child_id),
          relationshipId: rel.id,
          position: rel.position
        });
        
        // Remove child categories from root list
        const childIndex = rootCategories.findIndex(c => c.id === rel.child_id);
        if (childIndex !== -1) {
          rootCategories.splice(childIndex, 1);
        }
      });
    }
    
    // Sort each level by position
    Object.keys(relationshipMap).forEach(parentId => {
      relationshipMap[parentId].sort((a, b) => a.position - b.position);
    });
    
    // Sort root categories by position
    rootCategories.sort((a, b) => a.position - b.position);
    
    // Recursive function to build tree
    const buildTree = (categories) => {
      return categories.map(category => {
        const children = relationshipMap[category.id] || [];
        return {
          ...category,
          children: buildTree(children)
        };
      });
    };
    
    const tree = buildTree(rootCategories);
    setCategoryTree(tree);
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    // Persist the expanded state to the database
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      updateCategory(categoryId, {
        is_expanded: !expandedCategories[categoryId]
      });
    }
  };

  const handleAddCategory = async (categoryData) => {
    setError('');
    setSuccess('');
    
    try {
      const { success, category, error } = await addCategory(categoryData);
      
      if (success) {
        setSuccess('Category added successfully');
        setShowCategoryForm(false);
        await fetchCategories();
      } else {
        setError(error || 'Failed to add category');
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.message || 'An error occurred while adding category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    setError('');
    setSuccess('');
    
    try {
      const { success, error } = await updateCategory(categoryId, categoryData);
      
      if (success) {
        setSuccess('Category updated successfully');
        setShowCategoryForm(false);
        setEditingCategory(null);
        await fetchCategories();
      } else {
        setError(error || 'Failed to update category');
      }
    } catch (err) {
      console.error("Error updating category:", err);
      setError(err.message || 'An error occurred while updating category');
    }
  };

  const handleDeleteCategory = (category) => {
    setConfirmDelete({
      type: 'category',
      item: category,
      message: `Are you sure you want to delete the category "${category.name}"? This will also delete all nested categories and remove category assignments from bookmarks.`
    });
  };

  const handleBulkDeleteCategories = () => {
    if (selectedCategories.length === 0) return;
    
    setConfirmDelete({
      type: 'categories',
      items: selectedCategories,
      message: `Are you sure you want to delete ${selectedCategories.length} categories? This will also delete all nested categories and remove category assignments from bookmarks.`
    });
  };

  const confirmDeleteAction = async () => {
    setError('');
    setSuccess('');
    
    try {
      if (confirmDelete.type === 'category') {
        await deleteCategory(confirmDelete.item.id);
        setSuccess('Category deleted successfully');
      } else if (confirmDelete.type === 'categories') {
        // Delete multiple categories
        for (const categoryId of confirmDelete.items) {
          await deleteCategory(categoryId);
        }
        setSelectedCategories([]);
        setSuccess(`${confirmDelete.items.length} categories deleted successfully`);
      } else if (confirmDelete.type === 'tag') {
        await deleteTag(confirmDelete.item.id);
        setSuccess('Tag deleted successfully');
      } else if (confirmDelete.type === 'tags') {
        // Delete multiple tags
        for (const tagId of confirmDelete.items) {
          await deleteTag(tagId);
        }
        setSelectedTags([]);
        setSuccess(`${confirmDelete.items.length} tags deleted successfully`);
      }
      
      // Refresh data
      await Promise.all([
        fetchCategories(),
        fetchTags(),
        fetchCategoryRelationships()
      ]);
    } catch (err) {
      console.error("Error deleting:", err);
      setError(err.message || 'An error occurred during deletion');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleAddTag = async (tagData) => {
    setError('');
    setSuccess('');
    
    try {
      const { success, tag, error } = await addTag(tagData.name);
      
      if (success) {
        setSuccess('Tag added successfully');
        setShowTagForm(false);
        await fetchTags();
      } else {
        setError(error || 'Failed to add tag');
      }
    } catch (err) {
      console.error("Error adding tag:", err);
      setError(err.message || 'An error occurred while adding tag');
    }
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setShowTagForm(true);
  };

  const handleUpdateTag = async (tagId, tagData) => {
    setError('');
    setSuccess('');
    
    try {
      const { success, error } = await updateTag(tagId, tagData.name);
      
      if (success) {
        setSuccess('Tag updated successfully');
        setShowTagForm(false);
        setEditingTag(null);
        await fetchTags();
      } else {
        setError(error || 'Failed to update tag');
      }
    } catch (err) {
      console.error("Error updating tag:", err);
      setError(err.message || 'An error occurred while updating tag');
    }
  };

  const handleDeleteTag = (tag) => {
    setConfirmDelete({
      type: 'tag',
      item: tag,
      message: `Are you sure you want to delete the tag "${tag.name}"? This will remove the tag from all bookmarks.`
    });
  };

  const handleBulkDeleteTags = () => {
    if (selectedTags.length === 0) return;
    
    setConfirmDelete({
      type: 'tags',
      items: selectedTags,
      message: `Are you sure you want to delete ${selectedTags.length} tags? This will remove these tags from all bookmarks.`
    });
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleTagSelect = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  const handleSelectAllTags = () => {
    if (selectedTags.length === tags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(tags.map(t => t.id));
    }
  };

  const handleMoveCategory = async (draggedId, targetId, position) => {
    try {
      // Check if this would create a cycle
      if (wouldCreateCycle(draggedId, targetId)) {
        setError("Cannot move a category into its own descendant");
        return;
      }
      
      // Find existing relationship if any
      const existingRelationship = categoryRelationships.find(
        rel => rel.child_id === draggedId
      );
      
      if (existingRelationship) {
        // If moving to root level (no target)
        if (!targetId) {
          await deleteCategoryRelationship(existingRelationship.id);
        } else {
          // If changing parent
          if (existingRelationship.parent_id !== targetId) {
            await deleteCategoryRelationship(existingRelationship.id);
            await addCategoryRelationship({
              parent_id: targetId,
              child_id: draggedId,
              position
            });
          } else {
            // Just updating position under same parent
            await updateCategoryRelationship(existingRelationship.id, {
              position
            });
          }
        }
      } else if (targetId) {
        // No existing relationship but we're adding one
        await addCategoryRelationship({
          parent_id: targetId,
          child_id: draggedId,
          position
        });
      }
      
      // Update position for root level categories
      if (!targetId) {
        await updateCategory(draggedId, { position });
      }
      
      // Refresh data
      await Promise.all([
        fetchCategories(),
        fetchCategoryRelationships()
      ]);
      
      setSuccess("Category moved successfully");
    } catch (err) {
      console.error("Error moving category:", err);
      setError(err.message || "Failed to move category");
    }
  };
  
  // Helper to check if moving would create a cycle in the tree
  const wouldCreateCycle = (draggedId, targetId) => {
    if (!targetId || draggedId === targetId) return false;
    
    // Check if target is a descendant of dragged
    const isDescendant = (parentId, childId) => {
      const directChildren = categoryRelationships
        .filter(rel => rel.parent_id === parentId)
        .map(rel => rel.child_id);
        
      if (directChildren.includes(childId)) return true;
      
      return directChildren.some(id => isDescendant(id, childId));
    };
    
    return isDescendant(draggedId, targetId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-600">Loading categories and tags...</span>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full overflow-hidden flex flex-col"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiIcons.FiLayers} className="mr-2 text-[#FF0000]" />
            Advanced Categories Manager
          </h2>
          <p className="text-gray-600 mb-4">
            Organize your bookmarks with nested categories and tags. Drag and drop to rearrange.
          </p>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('categories')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'categories'
                    ? 'border-[#FF0000] text-[#FF0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiIcons.FiFolder} className="mr-2 h-5 w-5" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab('tags')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'tags'
                    ? 'border-[#FF0000] text-[#FF0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiIcons.FiTag} className="mr-2 h-5 w-5" />
                Tags
              </button>
            </div>
          </div>
          
          {/* Feedback messages */}
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
          
          {/* Categories Management */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleSelectAllCategories}
                    className="flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === categories.length && categories.length > 0}
                      onChange={handleSelectAllCategories}
                      className="h-4 w-4 text-[#FF0000] focus:ring-[#FF0000] border-gray-300 rounded"
                    />
                    <span className="ml-2">Select All</span>
                  </button>
                  
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={handleBulkDeleteCategories}
                      className="flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedCategories.length})
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none"
                >
                  <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                  Add Category
                </button>
              </div>
              
              {/* Categories Tree */}
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 min-h-[300px] max-h-[600px] overflow-auto">
                {categoryTree.length > 0 ? (
                  <CategoryTree
                    categories={categoryTree}
                    selectedCategories={selectedCategories}
                    onSelect={handleCategorySelect}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onMove={handleMoveCategory}
                    expandedCategories={expandedCategories}
                    toggleExpand={toggleCategoryExpand}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <SafeIcon icon={FiIcons.FiFolder} className="h-12 w-12 mb-2 text-gray-300" />
                    <p>No categories yet</p>
                    <p className="text-sm">Create your first category to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tags Management */}
          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleSelectAllTags}
                    className="flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.length === tags.length && tags.length > 0}
                      onChange={handleSelectAllTags}
                      className="h-4 w-4 text-[#FF0000] focus:ring-[#FF0000] border-gray-300 rounded"
                    />
                    <span className="ml-2">Select All</span>
                  </button>
                  
                  {selectedTags.length > 0 && (
                    <button
                      onClick={handleBulkDeleteTags}
                      className="flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedTags.length})
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setShowTagForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none"
                >
                  <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                  Add Tag
                </button>
              </div>
              
              {/* Tags List */}
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 min-h-[300px] max-h-[600px] overflow-auto">
                {tags.length > 0 ? (
                  <TagsList
                    tags={tags}
                    selectedTags={selectedTags}
                    onSelect={handleTagSelect}
                    onEdit={handleEditTag}
                    onDelete={handleDeleteTag}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <SafeIcon icon={FiIcons.FiTag} className="h-12 w-12 mb-2 text-gray-300" />
                    <p>No tags yet</p>
                    <p className="text-sm">Create your first tag to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* How to Use Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiIcons.FiHelpCircle} className="mr-2 text-[#FF0000]" />
            How to Use
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Categories</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><strong>Create nested categories</strong> by dragging and dropping one category onto another</li>
                <li><strong>Reorder categories</strong> by dragging them to a new position</li>
                <li><strong>Expand/collapse</strong> nested categories by clicking the arrow icon</li>
                <li><strong>Edit or delete</strong> categories using the action buttons</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Tags</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><strong>Create tags</strong> to label your bookmarks for easy filtering</li>
                <li><strong>Bulk select</strong> multiple tags to delete them together</li>
                <li><strong>Edit tags</strong> to rename them (updates across all bookmarks)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <div className="flex items-start">
              <SafeIcon icon={FiIcons.FiInfo} className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Pro tip:</strong> Organize your bookmarks hierarchically with nested categories for better organization.
                For example, create a "Coding" category with nested "JavaScript", "Python", and "CSS" subcategories.
              </p>
            </div>
          </div>
        </div>
        
        {/* Category Form Modal */}
        <AnimatePresence>
          {showCategoryForm && (
            <CategoryForm
              category={editingCategory}
              onClose={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }}
              onSave={editingCategory ? 
                (data) => handleUpdateCategory(editingCategory.id, data) : 
                handleAddCategory
              }
            />
          )}
        </AnimatePresence>
        
        {/* Tag Form Modal */}
        <AnimatePresence>
          {showTagForm && (
            <TagForm
              tag={editingTag}
              onClose={() => {
                setShowTagForm(false);
                setEditingTag(null);
              }}
              onSave={editingTag ? 
                (data) => handleUpdateTag(editingTag.id, data) : 
                handleAddTag
              }
            />
          )}
        </AnimatePresence>
        
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!confirmDelete}
          title={confirmDelete?.type === 'category' || confirmDelete?.type === 'categories' ? 
            'Delete Category' : 'Delete Tag'
          }
          message={confirmDelete?.message}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
          danger
        />
      </motion.div>
    </DndProvider>
  );
}