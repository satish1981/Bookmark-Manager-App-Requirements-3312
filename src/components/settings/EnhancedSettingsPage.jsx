import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import EnhancedApiKeyManager from './EnhancedApiKeyManager';
import EnhancedModelSelector from './EnhancedModelSelector';

export default function EnhancedSettingsPage() {
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
    { id: 'api-keys', name: 'API Configuration', icon: FiIcons.FiKey },
    { id: 'models', name: 'AI Models', icon: FiIcons.FiCpu },
    { id: 'account', name: 'Account', icon: FiIcons.FiUser }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-white shadow lg:hidden">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <SafeIcon icon={FiIcons.FiSettings} className="h-6 w-6 text-gray-700 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Enhanced Settings</h1>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="bg-white shadow hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <SafeIcon icon={FiIcons.FiSettings} className="h-6 w-6 text-gray-700 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Settings</h1>
            <div className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Enhanced Straico Integration
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Mobile Tab navigation */}
        <div className="mb-6 lg:hidden">
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-200 last:border-b-0 ${
                  activeTab === tab.id 
                    ? 'bg-purple-50 text-purple-600 border-purple-200' 
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
                    ? 'border-purple-500 text-purple-600'
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
          {/* Enhanced API Keys Tab */}
          {activeTab === 'api-keys' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiKey} className="mr-2 text-blue-500" />
                Enhanced API Configuration
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <EnhancedApiKeyManager />
              </div>
            </motion.div>
          )}

          {/* Enhanced Models Tab */}
          {activeTab === 'models' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiCpu} className="mr-2 text-purple-500" />
                Enhanced AI Model Selection
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <EnhancedModelSelector />
              </div>
            </motion.div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiUser} className="mr-2 text-gray-500" />
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="min-w-0 sm:min-w-32 text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                    Email
                  </div>
                  <div className="text-sm text-gray-900 break-all">{user.email}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="min-w-0 sm:min-w-32 text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                    Account ID
                  </div>
                  <div className="text-sm text-gray-900 break-all font-mono">{user.id}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="min-w-0 sm:min-w-32 text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                    Created
                  </div>
                  <div className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Enhanced Features Info */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Enhanced Integration Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-medium text-purple-800 mb-2">Smart AI Features</h5>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Smart model selection</li>
                      <li>• Enhanced error handling</li>
                      <li>• Real-time usage tracking</li>
                      <li>• Advanced generation parameters</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Security & Performance</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Comprehensive API validation</li>
                      <li>• Secure credential storage</li>
                      <li>• Optimized request handling</li>
                      <li>• Detailed logging & debugging</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Information */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <h4 className="font-medium text-gray-800 mb-2">Enhanced Straico Integration</h4>
            <p className="text-sm text-gray-600 mb-3">
              This enhanced integration provides full access to Straico's API capabilities with improved
              error handling, smart model selection, and comprehensive user experience enhancements.
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a 
                href="https://straico.ai/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <SafeIcon icon={FiIcons.FiExternalLink} className="h-4 w-4 mr-1" />
                Straico Dashboard
              </a>
              <a 
                href="https://docs.straico.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <SafeIcon icon={FiIcons.FiBook} className="h-4 w-4 mr-1" />
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}