import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useBookmarks } from '../../context/BookmarkContext';
import { useAuth } from '../../context/AuthContext';
import BookmarkCard from '../bookmarks/BookmarkCard';
import BookmarkForm from '../bookmarks/BookmarkForm';
import AISummaryModal from '../bookmarks/AISummaryModal';
import Analytics from './Analytics';
import CategoryManager from './CategoryManager';
import SettingsPage from '../settings/SettingsPage';

export default function Dashboard() {
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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

  // Filter bookmarks based on search and filters
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      const matchesSearch = !searchQuery ||
        bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !selectedCategory || bookmark.category_id === selectedCategory;
      const matchesStatus = !selectedStatus || bookmark.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [bookmarks, searchQuery, selectedCategory, selectedStatus]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm lg:hidden`}>
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <SafeIcon icon={isMobileMenuOpen ? FiIcons.FiX : FiIcons.FiMenu} className="h-6 w-6" />
              </button>
              <div className="ml-3 flex items-center">
                <SafeIcon icon={FiIcons.FiBookmark} className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h1 className={`ml-2 text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  BookmarkHub
                </h1>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {activeTab === 'home' && (
                <button
                  onClick={handleAddBookmark}
                  className="inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  <SafeIcon icon={FiIcons.FiPlus} className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <SafeIcon icon={theme === 'dark' ? FiIcons.FiSun : FiIcons.FiMoon} className="h-5 w-5" />
              </button>
              <button
                onClick={handleSignOut}
                className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <SafeIcon icon={FiIcons.FiLogOut} className="h-5 w-5" />
              </button>
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
              className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
            >
              <div className="px-4 py-3 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.id
                        ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                        : theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
                <div className={`border-t pt-3 mt-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Desktop Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm hidden lg:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <SafeIcon icon={FiIcons.FiBookmark} className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h1 className={`ml-2 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  BookmarkHub
                </h1>
              </div>
              
              {/* Desktop Tabs */}
              <nav className="flex space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                        : theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Desktop Search and Actions */}
            {activeTab === 'home' && (
              <div className="flex items-center space-x-4">
                {/* Search - Hidden on small screens, shown on medium+ */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiIcons.FiSearch} className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`block w-64 xl:w-80 pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* View Mode Toggle - Hidden on mobile */}
                <div className="hidden md:flex rounded-md shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium rounded-l-md border focus:outline-none ${
                      viewMode === 'grid'
                        ? theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <SafeIcon icon={FiIcons.FiGrid} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 focus:outline-none ${
                      viewMode === 'list'
                        ? theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <SafeIcon icon={FiIcons.FiList} className="h-4 w-4" />
                  </button>
                </div>

                {/* Add Bookmark Button */}
                <button
                  onClick={handleAddBookmark}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Add Bookmark</span>
                  <span className="lg:hidden">Add</span>
                </button>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <SafeIcon icon={theme === 'dark' ? FiIcons.FiSun : FiIcons.FiMoon} className="h-5 w-5" />
              </button>
              <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <div className="text-sm hidden lg:block">
                  <p className="font-medium">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  title="Sign out"
                >
                  <SafeIcon icon={FiIcons.FiLogOut} className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {activeTab === 'home' && (
          <div className="space-y-4 lg:space-y-6">
            {/* Mobile Search and Filters */}
            <div className="md:hidden space-y-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiIcons.FiSearch} className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`w-full flex items-center justify-between px-4 py-2 border rounded-md text-sm font-medium focus:outline-none ${
                  theme === 'dark' ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <span>Filters</span>
                <SafeIcon icon={isFiltersOpen ? FiIcons.FiChevronUp : FiIcons.FiChevronDown} className="h-4 w-4" />
              </button>

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
                        className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                        className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">All Status</option>
                        <option value="unwatched">Unwatched</option>
                        <option value="watching">Watching</option>
                        <option value="watched">Watched</option>
                      </select>
                    </div>

                    {/* Mobile View Mode Toggle */}
                    <div className="flex rounded-md shadow-sm">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border focus:outline-none ${
                          viewMode === 'grid'
                            ? theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <SafeIcon icon={FiIcons.FiGrid} className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 focus:outline-none ${
                          viewMode === 'list'
                            ? theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-600 text-white border-blue-600'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <SafeIcon icon={FiIcons.FiList} className="h-4 w-4 mx-auto" />
                      </button>
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
                  className={`block w-auto pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                  className={`block w-auto pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Status</option>
                  <option value="unwatched">Unwatched</option>
                  <option value="watching">Watching</option>
                  <option value="watched">Watched</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookmarks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} border ${theme === 'dark' ? 'border-gray-700' : 'border-blue-200'}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>
                    <SafeIcon icon={FiIcons.FiCheckSquare} className="h-5 w-5" />
                    <span className="font-medium">
                      {selectedBookmarks.length} bookmark(s) selected
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate('unwatched')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      <SafeIcon icon={FiIcons.FiClock} className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Unwatched
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('watching')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                    >
                      <SafeIcon icon={FiIcons.FiPlay} className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Watching
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('watched')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                    >
                      <SafeIcon icon={FiIcons.FiCheck} className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Watched
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                    >
                      <SafeIcon icon={FiIcons.FiTrash2} className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedBookmarks([])}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded focus:outline-none ${
                        theme === 'dark' ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <SafeIcon icon={FiIcons.FiX} className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Select All */}
            {filteredBookmarks.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className={`flex items-center space-x-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-600`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBookmarks.length === filteredBookmarks.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Select All ({filteredBookmarks.length})</span>
                  </button>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filteredBookmarks.length} of {bookmarks.length} bookmarks
                </div>
              </div>
            )}

            {/* Bookmarks Grid/List */}
            {filteredBookmarks.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <SafeIcon icon={FiIcons.FiBookmark} className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookmarks found</h3>
                <p className="mb-4">
                  {searchQuery || selectedCategory || selectedStatus
                    ? 'Try adjusting your filters or search query.'
                    : 'Start by adding your first bookmark!'}
                </p>
                {!searchQuery && !selectedCategory && !selectedStatus && (
                  <button
                    onClick={handleAddBookmark}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    <SafeIcon icon={FiIcons.FiPlus} className="h-4 w-4 mr-2" />
                    Add Your First Bookmark
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
                    : 'space-y-4'
                }
              >
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
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
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Modals */}
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
        <AISummaryModal
          bookmark={summaryBookmark}
          onClose={() => {
            setShowSummaryModal(false);
            setSummaryBookmark(null);
          }}
          onSave={handleSaveSummary}
        />
      )}
    </div>
  );
}