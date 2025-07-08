import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const TagItem = ({ tag, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center justify-between p-3 my-1 rounded-md
        ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
        border border-gray-200 shadow-sm
        transition-colors duration-200
      `}
    >
      <div className="flex items-center">
        {/* Checkbox for selection */}
        <div className="mr-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(tag.id)}
            className="h-4 w-4 text-[#FF0000] focus:ring-[#FF0000] border-gray-300 rounded"
          />
        </div>
        
        {/* Tag icon */}
        <div className="p-2 rounded-full bg-blue-100 mr-3">
          <SafeIcon icon={FiIcons.FiTag} className="h-4 w-4 text-blue-600" />
        </div>
        
        {/* Tag name */}
        <div className="font-medium text-gray-800">
          {tag.name}
        </div>
        
        {/* Tag count badge if available */}
        {tag.count !== undefined && (
          <div className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
            {tag.count}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(tag);
          }}
          className="p-1.5 text-gray-500 hover:text-[#FF0000] rounded-full hover:bg-gray-100 focus:outline-none"
          title="Edit tag"
        >
          <SafeIcon icon={FiIcons.FiEdit} className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tag);
          }}
          className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 focus:outline-none"
          title="Delete tag"
        >
          <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default function TagsList({ tags, selectedTags, onSelect, onEdit, onDelete }) {
  // Sort tags alphabetically
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="tags-list grid grid-cols-1 md:grid-cols-2 gap-3">
      {sortedTags.map(tag => (
        <TagItem
          key={tag.id}
          tag={tag}
          isSelected={selectedTags.includes(tag.id)}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}