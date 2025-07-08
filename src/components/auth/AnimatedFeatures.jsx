import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const features = [
  {
    icon: FiIcons.FiBookmark,
    title: 'Save Bookmarks',
    description: 'Save YouTube videos and websites with a single click',
    color: 'bg-blue-500',
  },
  {
    icon: FiIcons.FiTag,
    title: 'Organize with Tags',
    description: 'Categorize and tag your bookmarks for easy retrieval',
    color: 'bg-green-500',
  },
  {
    icon: FiIcons.FiCpu,
    title: 'AI Summaries',
    description: 'Generate AI summaries of your bookmarked content',
    color: 'bg-purple-500',
  },
  {
    icon: FiIcons.FiPieChart,
    title: 'Analytics Dashboard',
    description: 'View insights about your bookmarking habits',
    color: 'bg-orange-500',
  },
  {
    icon: FiIcons.FiStar,
    title: 'Rate Content',
    description: 'Rate your bookmarks to remember what you enjoyed',
    color: 'bg-yellow-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } },
};

export default function AnimatedFeatures() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-md space-y-6 p-6"
    >
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-bold text-white"
        >
          Bookmark Smarter
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-2 text-white text-opacity-80"
        >
          Organize your online content in one place
        </motion.p>
      </div>

      <motion.div variants={container} className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={item}
            className="flex items-start p-4 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg"
          >
            <div
              className={`${feature.color} p-3 rounded-full flex items-center justify-center mr-4`}
            >
              <SafeIcon icon={feature.icon} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{feature.title}</h3>
              <p className="text-sm text-white text-opacity-80">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 relative"
      >
        <div className="relative mx-auto w-full max-w-xs">
          <div className="rounded-lg overflow-hidden shadow-2xl transform rotate-2 bg-white p-1">
            <div className="rounded bg-gray-100 p-2">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="h-4 bg-gray-200 rounded flex-1" />
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-blue-100 rounded flex items-center px-2">
                  <SafeIcon icon={FiIcons.FiYoutube} className="text-red-600 mr-2" />
                  <div className="h-3 bg-gray-300 rounded flex-1" />
                </div>
                <div className="h-8 bg-green-100 rounded flex items-center px-2">
                  <SafeIcon icon={FiIcons.FiGlobe} className="text-blue-600 mr-2" />
                  <div className="h-3 bg-gray-300 rounded flex-1" />
                </div>
                <div className="h-8 bg-purple-100 rounded flex items-center px-2">
                  <SafeIcon icon={FiIcons.FiBook} className="text-purple-600 mr-2" />
                  <div className="h-3 bg-gray-300 rounded flex-1" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 transform -rotate-3 rounded-lg overflow-hidden shadow-xl bg-white p-1 w-full max-w-xs">
            <div className="rounded bg-gray-100 p-2 h-16 flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiCheckCircle} className="text-green-500 h-8 w-8" />
              <span className="ml-2 text-sm font-medium text-gray-800">Content Saved!</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}