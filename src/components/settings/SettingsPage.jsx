import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [appearance, setAppearance] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiSettings} className="mr-2 text-gray-500" />
          General Settings
        </h3>
        
        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setAppearance('light')}
                className={`px-4 py-3 border rounded-md text-sm font-medium focus:outline-none ${
                  appearance === 'light'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={FiIcons.FiSun} className="h-5 w-5 mx-auto mb-1" />
                <div>Light</div>
              </button>
              <button
                onClick={() => setAppearance('dark')}
                className={`px-4 py-3 border rounded-md text-sm font-medium focus:outline-none ${
                  appearance === 'dark'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={FiIcons.FiMoon} className="h-5 w-5 mx-auto mb-1" />
                <div>Dark</div>
              </button>
              <button
                onClick={() => setAppearance('system')}
                className={`px-4 py-3 border rounded-md text-sm font-medium focus:outline-none ${
                  appearance === 'system'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={FiIcons.FiMonitor} className="h-5 w-5 mx-auto mb-1" />
                <div>System</div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications for bookmark updates</p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
              <input
                type="checkbox"
                id="toggle-notifications"
                className="absolute w-6 h-6 opacity-0"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <label
                htmlFor="toggle-notifications"
                className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                  notifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                    notifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </label>
            </div>
          </div>

          {/* Autoplay */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Autoplay Videos</h4>
              <p className="text-sm text-gray-500">Automatically play videos when viewing bookmarks</p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
              <input
                type="checkbox"
                id="toggle-autoplay"
                className="absolute w-6 h-6 opacity-0"
                checked={autoplay}
                onChange={() => setAutoplay(!autoplay)}
              />
              <label
                htmlFor="toggle-autoplay"
                className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                  autoplay ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                    autoplay ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </label>
            </div>
          </div>

          {/* Default View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default View Mode
            </label>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option>Grid View</option>
              <option>List View</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiIcons.FiDatabase} className="mr-2 text-gray-500" />
          Data Management
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Manage your bookmark data and export options
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <SafeIcon icon={FiIcons.FiDownload} className="h-4 w-4 mr-2" />
              Export Bookmarks
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <SafeIcon icon={FiIcons.FiUpload} className="h-4 w-4 mr-2" />
              Import Bookmarks
            </button>
            
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              <SafeIcon icon={FiIcons.FiTrash2} className="h-4 w-4 mr-2" />
              Clear All Bookmarks
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}