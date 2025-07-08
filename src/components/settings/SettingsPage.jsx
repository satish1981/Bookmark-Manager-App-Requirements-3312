import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ApiKeyManager from './ApiKeyManager';
import ModelSelector from './ModelSelector';

export default function SettingsPage() {
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
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="bg-white shadow hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <SafeIcon icon={FiIcons.FiSettings} className="h-6 w-6 text-gray-700 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
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
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
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
                    ? 'border-blue-500 text-blue-600'
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
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiKey} className="mr-2 text-blue-500" />
                API Key Management
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <ApiKeyManager />
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
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiCpu} className="mr-2 text-purple-500" />
                AI Model Selection
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <ModelSelector />
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
                  <div className="min-w-0 sm:min-w-32 text-sm font-medium text-gray-500 mb-1 sm:mb-0">Email</div>
                  <div className="text-sm text-gray-900 break-all">{user.email}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="min-w-0 sm:min-w-32 text-sm font-medium text-gray-500 mb-1 sm:mb-0">Account ID</div>
                  <div className="text-sm text-gray-900 break-all font-mono">{user.id}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="min-w-0 sm:min-w-32 text-sm font-medium text-gray-500 mb-1 sm:mb-0">Created</div>
                  <div className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}