import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function ModernHeader({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  handleAddBookmark,
  searchQuery,
  setSearchQuery
}) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Create spring animation for header shadow
  const scrollY = useMotionValue(0);
  const scrollYRange = [0, 50];
  const headerShadow = useTransform(
    scrollY,
    scrollYRange,
    ['0px 0px 0px rgba(0,0,0,0)', '0px 10px 20px rgba(0,0,0,0.1)']
  );
  const headerBackground = useTransform(
    scrollY,
    scrollYRange,
    ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.95)']
  );

  // Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  const handleSignOut = async () => {
    await signOut();
  };

  const tabs = [
    { id: 'home', name: 'Home', icon: FiIcons.FiHome },
    { id: 'categories', name: 'Categories', icon: FiIcons.FiFolder },
    { id: 'analytics', name: 'Analytics', icon: FiIcons.FiPieChart },
    { id: 'settings', name: 'Settings', icon: FiIcons.FiSettings },
  ];

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-40 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'border-gray-200 backdrop-blur-md'
      } border-b`}
      style={{ 
        boxShadow: headerShadow,
        backgroundColor: theme === 'dark' ? '#1f2937' : headerBackground
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md lg:hidden ${
                theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
              >
                <SafeIcon icon={isMobileMenuOpen ? FiIcons.FiX : FiIcons.FiMenu} className="h-6 w-6" />
              </motion.div>
            </button>
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon 
                icon={FiIcons.FiBookmark} 
                className={`h-8 w-8 ${theme === 'dark' ? 'text-[#FF0000]' : 'text-[#FF0000]'}`} 
              />
              <h1 className={`ml-2 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                TubeMark
              </h1>
            </motion.div>
            
            {/* Desktop Tabs */}
            <nav className="hidden lg:flex ml-8 space-x-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? theme === 'dark' 
                        ? 'bg-[#FF0000] text-white' 
                        : 'bg-[#FF0000] text-white'
                      : theme === 'dark' 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={tab.icon} className="h-4 w-4 mr-2" />
                  {tab.name}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Desktop Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Hidden on small screens, shown on medium+ */}
            {activeTab === 'home' && (
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiIcons.FiSearch} className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-64 xl:w-80 pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            )}

            {/* Add Bookmark Button */}
            {activeTab === 'home' && (
              <motion.button
                onClick={handleAddBookmark}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-[#FF0000] to-[#FF5C36] hover:from-[#FF0000] hover:to-[#FF7C56] focus:outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Add Bookmark</span>
                <span className="md:hidden">Add</span>
              </motion.button>
            )}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              } focus:outline-none`}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <SafeIcon icon={theme === 'dark' ? FiIcons.FiSun : FiIcons.FiMoon} className="h-5 w-5" />
            </motion.button>

            {/* User Menu */}
            <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="text-sm hidden lg:block">
                <p className="font-medium">{user?.email}</p>
              </div>
              <motion.button
                onClick={handleSignOut}
                className={`p-2 rounded-full ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Sign out"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SafeIcon icon={FiIcons.FiLogOut} className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`border-t overflow-hidden ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
      >
        <div className="px-4 py-3 space-y-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === tab.id
                  ? theme === 'dark' ? 'bg-[#FF0000] text-white' : 'bg-[#FF0000] text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.97 }}
            >
              <SafeIcon icon={tab.icon} className="h-5 w-5 mr-3" />
              {tab.name}
            </motion.button>
          ))}
          <div className={`border-t pt-3 mt-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {user?.email}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}