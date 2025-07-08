import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

// The individual category item that can be dragged
const DraggableCategoryItem = ({ 
  category, 
  level = 0, 
  selectedCategories,
  onSelect,
  onEdit,
  onDelete,
  onMove,
  expandedCategories,
  toggleExpand
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories[category.id];
  
  // Set up drag
  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { id: category.id, level },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Set up drop
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (item, monitor) => {
      // Only handle if it's dropped directly on this component, not on children
      if (monitor.didDrop()) {
        return;
      }
      
      // Don't allow dropping on itself
      if (item.id === category.id) {
        return;
      }
      
      // Find position to insert
      const position = category.children ? category.children.length : 0;
      
      // Handle the drop by calling parent's onMove
      onMove(item.id, category.id, position);
    },
    canDrop: (item) => item.id !== category.id,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // Combine drag and drop refs
  const dragDropRef = (el) => {
    drag(el);
    drop(el);
  };
  
  // Visual feedback for drag and drop
  const isActive = isOver && canDrop;
  const opacity = isDragging ? 0.4 : 1;
  const paddingLeft = `${level * 1.5 + 0.75}rem`;
  
  // Animation variants for expand/collapse
  const variants = {
    hidden: { 
      height: 0, 
      opacity: 0, 
      transition: { duration: 0.2 } 
    },
    visible: { 
      height: 'auto', 
      opacity: 1, 
      transition: { duration: 0.3 } 
    },
  };
  
  return (
    <div className="category-item">
      <div 
        ref={dragDropRef}
        className={`
          relative flex items-center py-2 px-3 my-1 rounded-md cursor-pointer
          ${isActive ? 'bg-blue-100 border-2 border-blue-400' : 'hover:bg-gray-100'}
          ${selectedCategories.includes(category.id) ? 'bg-blue-50' : ''}
          transition-colors duration-200
        `}
        style={{ opacity, paddingLeft }}
      >
        {/* Expand/collapse control */}
        <div 
          className={`w-5 h-5 mr-2 flex-shrink-0 ${hasChildren ? 'cursor-pointer' : 'opacity-0 pointer-events-none'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleExpand(category.id);
          }}
        >
          {hasChildren && (
            <motion.div 
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <SafeIcon icon={FiIcons.FiChevronRight} className="h-5 w-5 text-gray-500" />
            </motion.div>
          )}
        </div>
        
        {/* Checkbox for selection */}
        <div className="mr-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={() => onSelect(category.id)}
            className="h-4 w-4 text-[#FF0000] focus:ring-[#FF0000] border-gray-300 rounded"
          />
        </div>
        
        {/* Folder icon */}
        <div className="mr-2 text-[#FF0000]">
          <SafeIcon icon={hasChildren ? FiIcons.FiFolder : FiIcons.FiFolderPlus} className="h-5 w-5" />
        </div>
        
        {/* Category name */}
        <div 
          className="flex-1 font-medium text-gray-800 truncate"
          style={{ backgroundColor: category.color }}
        >
          {category.name}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="p-1 text-gray-500 hover:text-[#FF0000] rounded-full hover:bg-gray-100 focus:outline-none"
            title="Edit category"
          >
            <SafeIcon icon={FiIcons.FiEdit} className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
            className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 focus:outline-none"
            title="Delete category"
          >
            <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
          </button>
        </div>
        
        {/* Drag indicator */}
        <div className="ml-1 text-gray-400 cursor-move">
          <SafeIcon icon={FiIcons.FiMenu} className="h-4 w-4" />
        </div>
        
        {/* Drop indicator overlay */}
        {isActive && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-md bg-blue-100 bg-opacity-50 flex items-center justify-center">
            <SafeIcon icon={FiIcons.FiArrowDown} className="h-6 w-6 text-blue-500" />
          </div>
        )}
      </div>
      
      {/* Children */}
      {hasChildren && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden"
            >
              {category.children.map(child => (
                <DraggableCategoryItem
                  key={child.id}
                  category={child}
                  level={level + 1}
                  selectedCategories={selectedCategories}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMove={onMove}
                  expandedCategories={expandedCategories}
                  toggleExpand={toggleExpand}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Root drop target for moving items to the root level
const RootDropTarget = ({ onMove, categories }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (item) => {
      // Find the max position of root categories
      const maxPosition = categories.reduce((max, cat) => 
        Math.max(max, cat.position || 0), 0);
      
      // Move to root level with position after all existing categories
      onMove(item.id, null, maxPosition + 1);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  return (
    <div 
      ref={drop}
      className={`mt-2 h-12 border-2 border-dashed rounded-md flex items-center justify-center ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <div className="flex items-center text-gray-500">
        <SafeIcon icon={FiIcons.FiArrowUp} className="h-4 w-4 mr-2" />
        <span>Drop here to move to root level</span>
      </div>
    </div>
  );
};

// Main CategoryTree component
export default function CategoryTree({ 
  categories, 
  selectedCategories, 
  onSelect, 
  onEdit, 
  onDelete, 
  onMove,
  expandedCategories,
  toggleExpand
}) {
  return (
    <div className="category-tree">
      {categories.map(category => (
        <DraggableCategoryItem
          key={category.id}
          category={category}
          selectedCategories={selectedCategories}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          expandedCategories={expandedCategories}
          toggleExpand={toggleExpand}
        />
      ))}
      
      <RootDropTarget onMove={onMove} categories={categories} />
    </div>
  );
}