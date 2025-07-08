import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

export default function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateSummary,
  isSelected,
  onSelect,
  viewMode = 'grid'
}) {
  const [showActions, setShowActions] = useState(false);
  const {
    id,
    title,
    description,
    thumbnail_url,
    url,
    category,
    tags = [],
    rating = 0,
    status,
    created_at,
    ai_summary
  } = bookmark;

  const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');
  const statusColor = status === 'watched' ? 'bg-green-500' : status === 'watching' ? 'bg-yellow-500' : 'bg-blue-500';

  const handleCardClick = (e) => {
    // Prevent triggering card click when clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    if (onSelect) {
      onSelect(id);
    }
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    const newStatus = status === 'unwatched' ? 'watched' : status === 'watched' ? 'watching' : 'unwatched';
    onToggleStatus(id, newStatus);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(bookmark);
  };

  const handleOpenUrl = (e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGenerateSummary = (e) => {
    e.stopPropagation();
    onGenerateSummary(bookmark);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Grid view card
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onClick={handleCardClick}
        className={`relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Selection checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Thumbnail */}
        <div className="relative h-32 sm:h-40 bg-gray-200">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <SafeIcon
                icon={isYouTube ? FiIcons.FiYoutube : FiIcons.FiGlobe}
                className={`h-8 w-8 sm:h-12 sm:w-12 ${isYouTube ? 'text-red-500' : 'text-blue-500'}`}
              />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-0 right-0 m-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}>
              {status === 'watched' ? (
                <>
                  <SafeIcon icon={FiIcons.FiCheckCircle} className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Watched</span>
                </>
              ) : status === 'watching' ? (
                <>
                  <SafeIcon icon={FiIcons.FiPlay} className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Watching</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiIcons.FiClock} className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Unwatched</span>
                </>
              )}
            </span>
          </div>

          {/* Category badge */}
          {category && (
            <div className="absolute bottom-0 left-0 m-2">
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: category.color || '#4B5563' }}
              >
                {category.icon && (
                  <SafeIcon name={category.icon} className="mr-1 h-3 w-3" />
                )}
                <span className="hidden sm:inline">{category.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 flex-1 mr-2" title={title}>
              {title || 'Untitled Bookmark'}
            </h3>
            
            {/* Rating stars - responsive sizing */}
            <div className="flex items-center flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <SafeIcon
                  key={i}
                  icon={FiIcons.FiStar}
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2" title={description}>
              {description}
            </p>
          )}

          {/* Tags - responsive display */}
          {tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {tags.slice(0, window.innerWidth < 640 ? 2 : 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > (window.innerWidth < 640 ? 2 : 3) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  +{tags.length - (window.innerWidth < 640 ? 2 : 3)}
                </span>
              )}
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-500">
            {formatDate(created_at)}
          </div>
        </div>

        {/* Action buttons overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showActions ? 1 : 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
        >
          <div className="flex flex-wrap justify-center gap-2 p-2">
            <button
              onClick={handleOpenUrl}
              className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Open URL"
            >
              <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4" />
            </button>
            <button
              onClick={handleToggleStatus}
              className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              title="Toggle watch status"
            >
              <SafeIcon
                icon={status === 'watched' ? FiIcons.FiCheck : status === 'watching' ? FiIcons.FiPlay : FiIcons.FiClock}
                className="h-4 w-4"
              />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 bg-yellow-600 rounded-full text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
              title="Edit bookmark"
            >
              <SafeIcon icon={FiIcons.FiEdit} className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              title="Delete bookmark"
            >
              <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
            </button>
            <button
              onClick={handleGenerateSummary}
              className="p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              title={ai_summary ? "View/edit AI summary" : "Generate AI summary (requires API key)"}
            >
              <SafeIcon icon={FiIcons.FiCpu} className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // List view card - optimized for mobile
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex p-3 sm:p-4">
        {/* Selection checkbox */}
        <div className="mr-3 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Thumbnail */}
        <div className="relative h-16 w-20 sm:h-20 sm:w-28 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <SafeIcon
                icon={isYouTube ? FiIcons.FiYoutube : FiIcons.FiGlobe}
                className={`h-6 w-6 sm:h-8 sm:w-8 ${isYouTube ? 'text-red-500' : 'text-blue-500'}`}
              />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-0 right-0 m-1">
            <span className={`inline-flex items-center p-1 rounded-full text-white ${statusColor}`}>
              <SafeIcon
                icon={status === 'watched' ? FiIcons.FiCheckCircle : status === 'watching' ? FiIcons.FiPlay : FiIcons.FiClock}
                className="h-3 w-3"
              />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1 sm:line-clamp-2" title={title}>
                {title || 'Untitled Bookmark'}
              </h3>
              
              {/* Description - hidden on very small screens */}
              {description && (
                <p className="hidden sm:block mt-1 text-sm text-gray-500 line-clamp-1" title={description}>
                  {description}
                </p>
              )}
            </div>

            {/* Rating stars */}
            <div className="hidden sm:flex items-center ml-2 mt-1 sm:mt-0">
              {[...Array(5)].map((_, i) => (
                <SafeIcon
                  key={i}
                  icon={FiIcons.FiStar}
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {/* Category */}
              {category && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: category.color || '#4B5563' }}
                >
                  {category.icon && (
                    <SafeIcon name={category.icon} className="mr-1 h-3 w-3" />
                  )}
                  {category.name}
                </span>
              )}

              {/* Tags - limited on mobile */}
              {tags.slice(0, window.innerWidth < 640 ? 1 : 2).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > (window.innerWidth < 640 ? 1 : 2) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  +{tags.length - (window.innerWidth < 640 ? 1 : 2)}
                </span>
              )}
            </div>

            {/* Date */}
            <span className="text-xs text-gray-500 mt-1 sm:mt-0 sm:ml-auto">
              {formatDate(created_at)}
            </span>
          </div>
        </div>

        {/* Action buttons - responsive layout */}
        <div className="ml-2 sm:ml-4 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <button
            onClick={handleOpenUrl}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full focus:outline-none transition-colors"
            title="Open URL"
          >
            <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleStatus}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded-full focus:outline-none transition-colors"
            title="Toggle watch status"
          >
            <SafeIcon
              icon={status === 'watched' ? FiIcons.FiCheck : status === 'watching' ? FiIcons.FiPlay : FiIcons.FiClock}
              className="h-4 w-4"
            />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-full focus:outline-none transition-colors"
            title="Edit bookmark"
          >
            <SafeIcon icon={FiIcons.FiEdit} className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-full focus:outline-none transition-colors"
            title="Delete bookmark"
          >
            <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4" />
          </button>
          <button
            onClick={handleGenerateSummary}
            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-full focus:outline-none transition-colors"
            title={ai_summary ? "View/edit AI summary" : "Generate AI summary (requires API key)"}
          >
            <SafeIcon icon={FiIcons.FiCpu} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Summary if available */}
      {ai_summary && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
          <details className="text-sm">
            <summary className="cursor-pointer text-purple-600 font-medium flex items-center">
              <SafeIcon icon={FiIcons.FiCpu} className="mr-1" />
              AI Summary
            </summary>
            <p className="mt-2 text-gray-700 bg-purple-50 p-3 rounded text-xs sm:text-sm">{ai_summary}</p>
          </details>
        </div>
      )}
    </motion.div>
  );
}