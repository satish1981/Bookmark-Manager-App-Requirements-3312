import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';

const ModernButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 overflow-hidden group';
  
  const variants = {
    primary: 'bg-gradient-youtube text-white shadow-glow hover:shadow-glow-lg focus:ring-red-500',
    secondary: 'bg-gradient-secondary text-white shadow-glow-secondary hover:shadow-glow-secondary-lg focus:ring-blue-500',
    accent: 'bg-gradient-accent text-white shadow-glow focus:ring-pink-500',
    glass: 'glass-effect text-white hover:bg-white/20 focus:ring-white/30',
    outline: 'border-2 border-gradient-primary text-youtube-red bg-transparent hover:bg-gradient-youtube hover:text-white hover:border-transparent',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'} ${className}`;

  const renderIcon = () => {
    if (loading) {
      return <SafeIcon icon="FiLoader" className={`${iconSizes[size]} animate-spin-3d`} />;
    }
    if (icon) {
      return <SafeIcon icon={icon} className={iconSizes[size]} />;
    }
    return null;
  };

  return (
    <motion.button
      className={classes}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.05 }}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      {/* Content */}
      <div className="relative flex items-center space-x-2">
        {icon && iconPosition === 'left' && renderIcon()}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && renderIcon()}
      </div>
    </motion.button>
  );
};

export default ModernButton;