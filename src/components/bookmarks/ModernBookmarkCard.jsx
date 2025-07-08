import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

export default function ModernBookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateSummary,
  isSelected,
  onSelect,
  viewMode = 'grid'
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  // 3D tilt effect values - define these unconditionally
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth springs for fluid animation - define these unconditionally
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 400, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 400, damping: 25 });
  const scale = useSpring(hovered ? 1.03 : 1, { stiffness: 500, damping: 25 });
  const brightness = useSpring(hovered ? 1.1 : 1, { stiffness: 400, damping: 25 });
  
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
  const statusColor = status === 'watched' ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                      status === 'watching' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                      'bg-gradient-to-r from-blue-500 to-blue-400';
  const statusText = status === 'watched' ? 'Watched' : 
                    status === 'watching' ? 'Watching' : 'Unwatched';
  const statusIcon = status === 'watched' ? FiIcons.FiCheckCircle : 
                    status === 'watching' ? FiIcons.FiPlay : FiIcons.FiClock;
                    
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width - 0.5) * 2;
    const yPct = (mouseY / height - 0.5) * 2;
    x.set(xPct * 50);
    y.set(yPct * 50);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleCardClick = (e) => {
    // Prevent triggering card click when clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || 
        e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    
    if (onSelect) {
      onSelect(id);
    }
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    const newStatus = status === 'unwatched' ? 'watched' : 
                      status === 'watched' ? 'watching' : 'unwatched';
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

  // Grid view card with 3D effects
  if (viewMode === 'grid') {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
        style={{
          scale,
          rotateX,
          rotateY,
          filter: `brightness(${brightness})`,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 transform-gpu ${
          isSelected 
            ? 'ring-3 ring-[#FF0000] shadow-xl' 
            : 'hover:shadow-xl'
        }`}
        whileTap={{ scale: 0.98 }}
      >
        {/* Selection checkbox with animated container */}
        <motion.div 
          className="absolute top-2 left-2 z-10"
          style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(id)}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded-md border-gray-300 text-[#FF0000] focus:ring-[#FF0000] shadow-md cursor-pointer"
            />
          </motion.div>
        </motion.div>

        {/* Thumbnail with gradient overlay */}
        <div className="relative h-40 sm:h-44 bg-gray-200 overflow-hidden">
          {thumbnail_url ? (
            <>
              <motion.img
                src={thumbnail_url}
                alt={title}
                className="w-full h-full object-cover transform-gpu"
                style={{ 
                  transformStyle: "preserve-3d",
                  scale: hovered ? 1.05 : 1
                }}
                transition={{ duration: 0.4 }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <SafeIcon
                  icon={isYouTube ? FiIcons.FiYoutube : FiIcons.FiGlobe}
                  className={`h-12 w-12 sm:h-16 sm:w-16 ${isYouTube ? 'text-[#FF0000]' : 'text-blue-500'}`}
                />
              </motion.div>
            </div>
          )}

          {/* Status badge with gradient */}
          <motion.div 
            className="absolute top-2 right-2"
            style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-md ${statusColor}`}>
              <SafeIcon icon={statusIcon} className="mr-1 h-3.5 w-3.5" />
              <span>{statusText}</span>
            </span>
          </motion.div>

          {/* Category badge */}
          {category && (
            <motion.div 
              className="absolute bottom-2 left-2"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${category.color || '#4B5563'}, ${category.color ? adjustColorBrightness(category.color, 20) : '#6B7280'})` 
                }}
              >
                {category.icon && (
                  <SafeIcon name={category.icon} className="mr-1 h-3.5 w-3.5" />
                )}
                <span>{category.name}</span>
              </span>
            </motion.div>
          )}

          {/* Play button for YouTube videos */}
          {isYouTube && (
            <motion.button
              onClick={handleOpenUrl}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#FF0000] hover:bg-white"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <SafeIcon icon={FiIcons.FiPlay} className="h-6 w-6 ml-1" />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <motion.h3 
              className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 flex-1 mr-2" 
              title={title}
              style={{ transformStyle: "preserve-3d", transform: "translateZ(10px)" }}
            >
              {title || 'Untitled Bookmark'}
            </motion.h3>
            
            {/* Rating stars - 3D effect */}
            <motion.div 
              className="flex items-center flex-shrink-0"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(15px)" }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <SafeIcon
                    icon={FiIcons.FiStar}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Description */}
          {description && (
            <motion.p 
              className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2" 
              title={description}
              style={{ transformStyle: "preserve-3d", transform: "translateZ(5px)" }}
            >
              {description}
            </motion.p>
          )}

          {/* Tags with 3D pop effect */}
          {tags.length > 0 && (
            <motion.div 
              className="mb-3 flex flex-wrap gap-1.5"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(10px)" }}
            >
              {tags.slice(0, window.innerWidth < 640 ? 2 : 3).map(tag => (
                <motion.span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {tag.name}
                </motion.span>
              ))}
              {tags.length > (window.innerWidth < 640 ? 2 : 3) && (
                <motion.span 
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                  whileHover={{ scale: 1.05 }}
                >
                  +{tags.length - (window.innerWidth < 640 ? 2 : 3)}
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Date and AI indicator */}
          <div className="flex justify-between items-center mt-2">
            <motion.div 
              className="text-xs text-gray-500"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(5px)" }}
            >
              {formatDate(created_at)}
            </motion.div>
            
            {ai_summary && (
              <motion.div 
                className="inline-flex items-center text-xs text-purple-600 font-medium"
                style={{ transformStyle: "preserve-3d", transform: "translateZ(10px)" }}
                whileHover={{ scale: 1.05 }}
              >
                <SafeIcon icon={FiIcons.FiCpu} className="h-3 w-3 mr-1" />
                AI Summary
              </motion.div>
            )}
          </div>
        </div>

        {/* Action buttons overlay with 3D effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end justify-center p-4"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div 
            className="flex flex-wrap justify-center gap-2"
            style={{ transformStyle: "preserve-3d", transform: "translateZ(40px)" }}
          >
            <ActionButton
              onClick={handleOpenUrl}
              icon={FiIcons.FiExternalLink}
              tooltip="Open URL"
              color="bg-gradient-to-br from-blue-600 to-blue-500"
            />
            <ActionButton
              onClick={handleToggleStatus}
              icon={statusIcon}
              tooltip={`Mark as ${status === 'unwatched' ? 'Watched' : status === 'watched' ? 'Watching' : 'Unwatched'}`}
              color="bg-gradient-to-br from-green-600 to-green-500"
            />
            <ActionButton
              onClick={handleEdit}
              icon={FiIcons.FiEdit}
              tooltip="Edit"
              color="bg-gradient-to-br from-yellow-600 to-yellow-500"
            />
            <ActionButton
              onClick={handleDelete}
              icon={FiIcons.FiTrash2}
              tooltip="Delete"
              color="bg-gradient-to-br from-red-600 to-red-500"
            />
            <ActionButton
              onClick={handleGenerateSummary}
              icon={FiIcons.FiCpu}
              tooltip={ai_summary ? "View/edit AI summary" : "Generate AI summary"}
              color="bg-gradient-to-br from-purple-600 to-purple-500"
            />
          </motion.div>
        </motion.div>

        {/* AI Summary preview (if available) */}
        {ai_summary && hovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent"
            style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
          >
            <div className="text-xs text-white line-clamp-2">
              <span className="font-bold text-purple-300">AI Summary: </span>
              {ai_summary}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // List view card - optimized for mobile with subtle 3D effects
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        scale: scale, // Use the same spring that was defined unconditionally at the top
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200 transform-gpu ${
        isSelected ? 'ring-2 ring-[#FF0000] shadow-lg' : 'hover:shadow-lg'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex p-3 sm:p-4">
        {/* Selection checkbox */}
        <motion.div 
          className="mr-3 flex items-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded-md border-gray-300 text-[#FF0000] focus:ring-[#FF0000] shadow-sm"
          />
        </motion.div>

        {/* Thumbnail with hover effect */}
        <div className="relative h-16 w-20 sm:h-20 sm:w-28 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {thumbnail_url ? (
              <img
                src={thumbnail_url}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
                <SafeIcon
                  icon={isYouTube ? FiIcons.FiYoutube : FiIcons.FiGlobe}
                  className={`h-8 w-8 ${isYouTube ? 'text-[#FF0000]' : 'text-blue-500'}`}
                />
              </div>
            )}
          </motion.div>

          {/* Status indicator */}
          <div className="absolute top-0 right-0 m-1">
            <motion.span 
              className={`inline-flex items-center p-1 rounded-full text-white shadow-sm ${statusColor}`}
              whileHover={{ scale: 1.1 }}
            >
              <SafeIcon
                icon={statusIcon}
                className="h-3 w-3"
              />
            </motion.span>
          </div>
        </div>

        {/* Content */}
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <motion.h3 
                className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 sm:line-clamp-2" 
                title={title}
              >
                {title || 'Untitled Bookmark'}
              </motion.h3>
              
              {/* Description - hidden on very small screens */}
              {description && (
                <p className="hidden sm:block mt-1 text-sm text-gray-600 line-clamp-1" title={description}>
                  {description}
                </p>
              )}
            </div>

            {/* Rating stars */}
            <div className="hidden sm:flex items-center ml-2 mt-1 sm:mt-0 space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <SafeIcon
                  key={i}
                  icon={FiIcons.FiStar}
                  className={`h-4 w-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Category */}
              {category && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color || '#4B5563'}, ${category.color ? adjustColorBrightness(category.color, 20) : '#6B7280'})` 
                  }}
                >
                  {category.icon && (
                    <SafeIcon name={category.icon} className="mr-1 h-3 w-3" />
                  )}
                  {category.name}
                </motion.span>
              )}

              {/* Tags - limited on mobile */}
              {tags.slice(0, window.innerWidth < 640 ? 1 : 2).map(tag => (
                <motion.span
                  key={tag.id}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {tag.name}
                </motion.span>
              ))}
              {tags.length > (window.innerWidth < 640 ? 1 : 2) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
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

        {/* Action buttons - responsive layout with hover effect */}
        <div className="ml-2 sm:ml-4 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <ListActionButton onClick={handleOpenUrl} icon={FiIcons.FiExternalLink} color="text-blue-600" tooltip="Open URL" />
          <ListActionButton onClick={handleToggleStatus} icon={statusIcon} color={
            status === 'watched' ? 'text-green-600' : 
            status === 'watching' ? 'text-yellow-600' : 'text-blue-600'
          } tooltip={`Mark as ${status === 'unwatched' ? 'Watched' : status === 'watched' ? 'Watching' : 'Unwatched'}`} />
          <ListActionButton onClick={handleEdit} icon={FiIcons.FiEdit} color="text-yellow-600" tooltip="Edit" />
          <ListActionButton onClick={handleDelete} icon={FiIcons.FiTrash2} color="text-red-600" tooltip="Delete" />
          <ListActionButton onClick={handleGenerateSummary} icon={FiIcons.FiCpu} color="text-purple-600" tooltip={ai_summary ? "View/edit AI summary" : "Generate AI summary"} />
        </div>
      </div>

      {/* AI Summary if available */}
      {ai_summary && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
          <motion.details
            className="text-sm rounded-lg overflow-hidden"
            initial={false}
            animate={hovered ? { backgroundColor: "rgba(124, 58, 237, 0.05)" } : { backgroundColor: "rgba(124, 58, 237, 0)" }}
          >
            <summary className="cursor-pointer text-purple-600 font-medium flex items-center py-2">
              <SafeIcon icon={FiIcons.FiCpu} className="mr-2" />
              AI Summary
              <motion.span
                className="ml-1.5 inline-block"
                animate={{ rotate: hovered ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <SafeIcon icon={FiIcons.FiChevronDown} className="h-4 w-4" />
              </motion.span>
            </summary>
            <p className="mt-2 text-gray-700 bg-purple-50 p-3 rounded text-xs sm:text-sm">{ai_summary}</p>
          </motion.details>
        </div>
      )}
    </motion.div>
  );
}

// Helper component for action buttons in grid view
const ActionButton = ({ onClick, icon, tooltip, color }) => (
  <motion.button
    onClick={onClick}
    className={`p-2.5 rounded-full text-white shadow-lg ${color} backdrop-blur-sm`}
    title={tooltip}
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: "spring", stiffness: 400 }}
  >
    <SafeIcon icon={icon} className="h-5 w-5" />
  </motion.button>
);

// Helper component for action buttons in list view
const ListActionButton = ({ onClick, icon, color, tooltip }) => (
  <motion.button
    onClick={onClick}
    className={`p-1.5 hover:bg-gray-100 rounded-full ${color} focus:outline-none transition-colors`}
    title={tooltip}
    whileHover={{ scale: 1.15, backgroundColor: "rgba(0,0,0,0.05)" }}
    whileTap={{ scale: 0.9 }}
  >
    <SafeIcon icon={icon} className="h-4 w-4" />
  </motion.button>
);

// Helper function to adjust color brightness for gradients
function adjustColorBrightness(hexColor, percent) {
  if (!hexColor) return '#6B7280';
  
  // Convert hex to RGB
  let r = parseInt(hexColor.substring(1, 3), 16);
  let g = parseInt(hexColor.substring(3, 5), 16);
  let b = parseInt(hexColor.substring(5, 7), 16);
  
  // Adjust brightness
  r = Math.min(255, Math.max(0, r + (r * percent / 100)));
  g = Math.min(255, Math.max(0, g + (g * percent / 100)));
  b = Math.min(255, Math.max(0, b + (b * percent / 100)));
  
  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}