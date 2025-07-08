import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ModernCard = ({ 
  children, 
  className = '', 
  hover3d = true, 
  glassEffect = false,
  gradient = false,
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = 'relative rounded-3xl p-6 transition-all duration-500 transform-gpu';
  
  const effectClasses = glassEffect 
    ? 'glass-effect' 
    : gradient 
    ? 'bg-gradient-secondary' 
    : 'bg-white shadow-card';

  const hoverClasses = hover3d 
    ? 'hover:shadow-elevated card-3d perspective-1000' 
    : 'hover:shadow-lg';

  const classes = `${baseClasses} ${effectClasses} ${hoverClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`;

  return (
    <motion.div
      className={classes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={hover3d ? { 
        rotateY: 5, 
        rotateX: 5, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      } : { scale: 1.02 }}
      style={{
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transition-transform duration-1000 ${
            isHovered ? 'translate-x-full' : '-translate-x-full'
          }`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating particles effect */}
      {hover3d && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`,
              }}
              animate={isHovered ? {
                y: [-5, -15, -5],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ModernCard;