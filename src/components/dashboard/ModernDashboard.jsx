import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBookmarks } from '../../context/BookmarkContext';
import { useAuth } from '../../context/AuthContext';
import ModernBookmarkCard from '../bookmarks/ModernBookmarkCard';
import BookmarkForm from '../bookmarks/BookmarkForm';
import AISummaryModal from '../bookmarks/AISummaryModal';
import EnhancedAISummaryModal from '../bookmarks/EnhancedAISummaryModal';
import Analytics from './Analytics';
import CategoryManager from './CategoryManager';
import SettingsPage from '../settings/SettingsPage';
import AISettingsPage from '../settings/AISettingsPage';

export default function ModernDashboard() {
  const { user, signOut } = useAuth();
  const {
    bookmarks,
    categories,
    tags,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    deleteMultipleBookmarks,
    updateMultipleBookmarkStatus,
    updateBookmarkSummary
  } = useBookmarks();

  const [activeTab, setActiveTab] = useState('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryBookmark, setSummaryBookmark] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortMethod, setSortMethod] = useState('newest'); // 'newest', 'oldest', 'alphabetical'
  const [useEnhancedAI, setUseEnhancedAI] = useState(true);

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

  // Filter and sort bookmarks based on search, filters, and sort method
  const filteredBookmarks = useMemo(() => {
    // First filter bookmarks based on search query and filters
    const filtered = bookmarks.filter(bookmark => {
      const matchesSearch = !searchQuery || 
        bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        bookmark.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || bookmark.category_id === selectedCategory;
      const matchesStatus = !selectedStatus || bookmark.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Then sort the filtered bookmarks
    return filtered.sort((a, b) => {
      if (sortMethod === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortMethod === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortMethod === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      } else {
        return 0;
      }
    });
  }, [bookmarks, searchQuery, selectedCategory, selectedStatus, sortMethod]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAddBookmark = () => {
    setEditingBookmark(null);
    setShowBookmarkForm(true);
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setShowBookmarkForm(true);
  };

  const handleSaveBookmark = async (bookmarkData) => {
    try {
      let result;
      if (editingBookmark) {
        result = await updateBookmark(editingBookmark.id, bookmarkData);
      } else {
        result = await addBookmark(bookmarkData);
      }
      return result;
    } catch (error) {
      console.error('Error in handleSaveBookmark:', error);
      return { success: false, error: error.message };
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      await deleteBookmark(bookmarkId);
    }
  };

  const handleToggleStatus = async (bookmarkId, newStatus) => {
    await updateBookmark(bookmarkId, { status: newStatus });
  };

  const handleGenerateSummary = (bookmark) => {
    setSummaryBookmark(bookmark);
    setShowSummaryModal(true);
  };

  const handleSaveSummary = async (summary) => {
    if (summaryBookmark) {
      await updateBookmarkSummary(summaryBookmark.id, summary);
      setShowSummaryModal(false);
      setSummaryBookmark(null);
    }
  };

  const handleSelectBookmark = (bookmarkId) => {
    setSelectedBookmarks(prev => {
      if (prev.includes(bookmarkId)) {
        return prev.filter(id => id !== bookmarkId);
      } else {
        return [...prev, bookmarkId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredBookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(filteredBookmarks.map(b => b.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookmarks.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedBookmarks.length} bookmarks?`)) {
      await deleteMultipleBookmarks(selectedBookmarks);
      setSelectedBookmarks([]);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedBookmarks.length === 0) return;
    await updateMultipleBookmarkStatus(selectedBookmarks, status);
    setSelectedBookmarks([]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const tabs = [
    { id: 'home', name: 'Home', icon: FiIcons.FiHome },
    { id: 'categories', name: 'Categories', icon: FiIcons.FiFolder },
    { id: 'analytics', name: 'Analytics', icon: FiIcons.FiPieChart },
    { id: 'settings', name: 'Settings', icon: FiIcons.FiSettings },
  ];

  const settingsTabs = [
    { id: 'general', name: 'General', icon: FiIcons.FiSettings },
    { id: 'ai-settings', name: 'AI API Settings', icon: FiIcons.FiCpu },
    { id: 'account', name: 'Account', icon: FiIcons.FiUser },
  ];

  // Loading animation
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, ease: "easeInOut", times: [0, 0.5, 1], repeat: Infinity }}
          className="mb-8"
        >
          <SafeIcon icon={FiIcons.FiBookmark} className="h-16 w-16 text-[#FF0000]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your bookmarks...</h2>
          <p className="text-gray-600 text-center">Preparing your personalized bookmark experience</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} font-[Roboto,Arial,sans-serif]`}>
      {/* Fixed Header with Blur Effect */}
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
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  <SafeIcon
                    icon={isMobileMenuOpen ? FiIcons.FiX : FiIcons.FiMenu}
                    className="h-6 w-6"
                  />
                </motion.div>
              </button>
              <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                    onClick={() => {
                      setActiveTab(tab.id);
                      if(tab.id === 'settings') {
                        setActiveSettingsTab('general');
                      }
                    }}
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
                    <SafeIcon
                      icon={FiIcons.FiSearch}
                      className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                    />
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
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
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
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-t ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="px-4 py-3 space-y-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if(tab.id === 'settings') {
                        setActiveSettingsTab('general');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? 'bg-[#FF0000] text-white'
                          : 'bg-[#FF0000] text-white'
                        : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
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
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content with padding for fixed header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-20 lg:py-8 lg:pt-24">
        {activeTab === 'home' && (
          <div className="space-y-4 lg:space-y-6">
            {/* Mobile Search and Filters */}
            <div className="md:hidden space-y-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon
                    icon={FiIcons.FiSearch}
                    className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Filters Toggle */}
              <motion.button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`w-full flex items-center justify-between px-4 py-2 border rounded-md text-sm font-medium focus:outline-none ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center">
                  <SafeIcon icon={FiIcons.FiFilter} className="h-4 w-4 mr-2" />
                  <span>Filters & Sort</span>
                </div>
                <SafeIcon
                  icon={isFiltersOpen ? FiIcons.FiChevronUp : FiIcons.FiChevronDown}
                  className="h-4 w-4"
                />
              </motion.button>

              {/* Mobile Filters */}
              <AnimatePresence>
                {isFiltersOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">All Status</option>
                        <option value="unwatched">Unwatched</option>
                        <option value="watching">Watching</option>
                        <option value="watched">Watched</option>
                      </select>
                    </div>

                    {/* Sort options */}
                    <select
                      value={sortMethod}
                      onChange={(e) => setSortMethod(e.target.value)}
                      className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>

                    {/* Mobile View Mode Toggle */}
                    <div className="flex rounded-md shadow-sm">
                      <motion.button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border focus:outline-none ${
                          viewMode === 'grid'
                            ? theme === 'dark'
                              ? 'bg-[#FF0000] text-white border-[#FF0000]'
                              : 'bg-[#FF0000] text-white border-[#FF0000]'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SafeIcon icon={FiIcons.FiGrid} className="h-4 w-4 mx-auto" />
                      </motion.button>
                      <motion.button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 focus:outline-none ${
                          viewMode === 'list'
                            ? theme === 'dark'
                              ? 'bg-[#FF0000] text-white border-[#FF0000]'
                              : 'bg-[#FF0000] text-white border-[#FF0000]'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SafeIcon icon={FiIcons.FiList} className="h-4 w-4 mx-auto" />
                      </motion.button>
                    </div>
                    
                    {/* AI Mode Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <div className="text-sm font-medium">
                        {theme === 'dark' ? (
                          <span className="text-white">Enhanced AI</span>
                        ) : (
                          <span className="text-gray-700">Enhanced AI</span>
                        )}
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="toggle-ai-mode-mobile"
                          className="absolute w-6 h-6 opacity-0"
                          checked={useEnhancedAI}
                          onChange={() => setUseEnhancedAI(!useEnhancedAI)}
                        />
                        <label
                          htmlFor="toggle-ai-mode-mobile"
                          className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                            useEnhancedAI
                              ? 'bg-gradient-to-r from-[#FF0000] to-[#FF5C36]'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                              useEnhancedAI ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`block w-auto pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`block w-auto pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Status</option>
                  <option value="unwatched">Unwatched</option>
                  <option value="watching">Watching</option>
                  <option value="watched">Watched</option>
                </select>

                <select
                  value={sortMethod}
                  onChange={(e) => setSortMethod(e.target.value)}
                  className={`block w-auto pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                
                {/* AI Mode Toggle - Desktop */}
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Enhanced AI
                  </span>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="toggle-ai-mode"
                      className="absolute w-6 h-6 opacity-0"
                      checked={useEnhancedAI}
                      onChange={() => setUseEnhancedAI(!useEnhancedAI)}
                    />
                    <label
                      htmlFor="toggle-ai-mode"
                      className={`block h-6 overflow-hidden rounded-full cursor-pointer ${
                        useEnhancedAI
                          ? 'bg-gradient-to-r from-[#FF0000] to-[#FF5C36]'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute block w-6 h-6 rounded-full transform transition-transform duration-200 ease-in-out bg-white ${
                          useEnhancedAI ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* View Mode Toggle - Desktop */}
              <div className="hidden md:flex rounded-md shadow-sm">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border focus:outline-none flex items-center ${
                    viewMode === 'grid'
                      ? theme === 'dark'
                        ? 'bg-[#FF0000] text-white border-[#FF0000]'
                        : 'bg-[#FF0000] text-white border-[#FF0000]'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={FiIcons.FiGrid} className="h-4 w-4 mr-2" />
                  Grid
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 focus:outline-none flex items-center ${
                    viewMode === 'list'
                      ? theme === 'dark'
                        ? 'bg-[#FF0000] text-white border-[#FF0000]'
                        : 'bg-[#FF0000] text-white border-[#FF0000]'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SafeIcon icon={FiIcons.FiList} className="h-4 w-4 mr-2" />
                  List
                </motion.button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookmarks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gradient-to-r from-pink-50 to-red-50 border-red-100'
                } border shadow-md`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div
                    className={`flex items-center space-x-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <SafeIcon icon={FiIcons.FiCheckSquare} className="h-5 w-5 text-[#FF0000]" />
                    <span className="font-medium">
                      {selectedBookmarks.length} bookmark{selectedBookmarks.length !== 1 ? 's' : ''}{' '}
                      selected
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      onClick={() => handleBulkStatusUpdate('unwatched')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiIcons.FiClock} className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Unwatched
                    </motion.button>
                    <motion.button
                      onClick={() => handleBulkStatusUpdate('watching')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiIcons.FiPlay} className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Watching
                    </motion.button>
                    <motion.button
                      onClick={() => handleBulkStatusUpdate('watched')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiIcons.FiCheck} className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Watched
                    </motion.button>
                    <motion.button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiIcons.FiTrash2} className="h-3 w-3 mr-1" />
                      Delete
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedBookmarks([])}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md focus:outline-none shadow-sm ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiIcons.FiX} className="h-3 w-3 mr-1" />
                      Clear
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Select All */}
            {filteredBookmarks.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={handleSelectAll}
                    className={`flex items-center space-x-2 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    } hover:text-[#FF0000]`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBookmarks.length === filteredBookmarks.length && filteredBookmarks.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-[#FF0000] focus:ring-[#FF0000]"
                    />
                    <span>Select All ({filteredBookmarks.length})</span>
                  </motion.button>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filteredBookmarks.length} of {bookmarks.length} bookmarks
                </div>
              </div>
            )}

            {/* Bookmarks Grid/List */}
            {filteredBookmarks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`text-center py-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, -5, 0, 5, 0] }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.4, 0.6, 1],
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="inline-block mb-6"
                >
                  <SafeIcon icon={FiIcons.FiBookmark} className="h-16 w-16 mx-auto text-[#FF0000]" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">No bookmarks found</h3>
                <p className="mb-6 max-w-md mx-auto">
                  {searchQuery || selectedCategory || selectedStatus
                    ? "Try adjusting your filters or search query to find what you're looking for."
                    : "Start building your collection by adding your first bookmark!"}
                </p>
                {!searchQuery && !selectedCategory && !selectedStatus && (
                  <motion.button
                    onClick={handleAddBookmark}
                    className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-gradient-to-r from-[#FF0000] to-[#FF5C36] hover:from-[#FF0000] hover:to-[#FF7C56] focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiIcons.FiPlus} className="h-5 w-5 mr-2" />
                    Add Your First Bookmark
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6' : 'space-y-4'}
              >
                {filteredBookmarks.map((bookmark) => (
                  <ModernBookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={handleEditBookmark}
                    onDelete={handleDeleteBookmark}
                    onToggleStatus={handleToggleStatus}
                    onGenerateSummary={handleGenerateSummary}
                    isSelected={selectedBookmarks.includes(bookmark.id)}
                    onSelect={handleSelectBookmark}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'categories' && <CategoryManager />}
        
        {activeTab === 'analytics' && <Analytics />}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Settings Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex flex-wrap space-x-8">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeSettingsTab === tab.id
                        ? 'border-[#FF0000] text-[#FF0000]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="mr-2 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Settings Content */}
            {activeSettingsTab === 'general' && <SettingsPage />}
            {activeSettingsTab === 'ai-settings' && <AISettingsPage />}
            {activeSettingsTab === 'account' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating add button on mobile */}
      {activeTab === 'home' && (
        <motion.div
          className="fixed bottom-6 right-6 md:hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.button
            onClick={handleAddBookmark}
            className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-[#FF0000] to-[#FF5C36] text-white flex items-center justify-center"
            whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(255,0,0,0.4)" }}
            whileTap={{ scale: 0.9 }}
          >
            <SafeIcon icon={FiIcons.FiPlus} className="h-7 w-7" />
          </motion.button>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showBookmarkForm && (
          <BookmarkForm
            bookmark={editingBookmark}
            onClose={() => {
              setShowBookmarkForm(false);
              setEditingBookmark(null);
            }}
            onSave={handleSaveBookmark}
          />
        )}
        
        {showSummaryModal && summaryBookmark && (
          useEnhancedAI ? (
            <EnhancedAISummaryModal
              bookmark={summaryBookmark}
              onClose={() => {
                setShowSummaryModal(false);
                setSummaryBookmark(null);
              }}
              onSave={handleSaveSummary}
            />
          ) : (
            <AISummaryModal
              bookmark={summaryBookmark}
              onClose={() => {
                setShowSummaryModal(false);
                setSummaryBookmark(null);
              }}
              onSave={handleSaveSummary}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}