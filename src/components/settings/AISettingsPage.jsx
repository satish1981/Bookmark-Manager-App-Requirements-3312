import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import EnhancedApiKeyManager from './EnhancedApiKeyManager';
import EnhancedModelSelector from './EnhancedModelSelector';

export default function AISettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('api-keys');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view settings</p>
      </div>
    );
  }

  const tabs = [
    { id: 'api-keys', name: 'API Keys', icon: FiIcons.FiKey },
    { id: 'models', name: 'AI Models', icon: FiIcons.FiCpu }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <SafeIcon icon={FiIcons.FiCpu} className="mr-2 text-[#FF0000]" />
            AI API Settings
          </h2>
          <p className="text-gray-600">
            Configure your AI API keys and model preferences for enhanced features
          </p>
        </div>

        {/* Mobile Tab navigation */}
        <div className="mb-6 lg:hidden">
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-200 last:border-b-0 ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-[#FF0000] border-red-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <SafeIcon icon={tab.icon} className="mr-3 h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
                <SafeIcon icon={FiIcons.FiChevronRight} className="ml-auto h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tab navigation */}
        <div className="mb-6 hidden lg:block border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-[#FF0000] text-[#FF0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <SafeIcon icon={tab.icon} className="mr-2 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiKey} className="mr-2 text-blue-500" />
                Enhanced API Configuration
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <EnhancedApiKeyManager />
              </div>
            </motion.div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiCpu} className="mr-2 text-purple-500" />
                Enhanced AI Model Selection
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <EnhancedModelSelector />
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Information */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <h4 className="font-medium text-gray-800 mb-2">Enhanced Straico Integration</h4>
            <p className="text-sm text-gray-600 mb-3">
              This integration provides full access to Straico's API capabilities with smart model selection, 
              improved error handling, and comprehensive user experience enhancements.
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a
                href="https://straico.ai/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#FF0000] hover:text-red-800"
              >
                <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4 mr-1" />
                Straico Dashboard
              </a>
              <a
                href="https://docs.straico.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#FF0000] hover:text-red-800"
              >
                <SafeIcon icon={FiIcons.FiBook} className="h-4 w-4 mr-1" />
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}