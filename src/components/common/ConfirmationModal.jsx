import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  danger = false
}) {
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className={`px-6 py-4 ${danger ? 'bg-red-600' : 'bg-blue-600'} text-white flex items-center`}>
          <SafeIcon 
            icon={danger ? FiIcons.FiAlertTriangle : FiIcons.FiInfo} 
            className="h-6 w-6 mr-3" 
          />
          <h2 className="text-lg font-semibold">{title || 'Confirm Action'}</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">{message}</p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 border border-transparent rounded-md text-white ${
                danger 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}