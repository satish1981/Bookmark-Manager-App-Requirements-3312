import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const features = [
  {
    icon: FiIcons.FiYoutube,
    title: 'Save YouTube Videos',
    description: 'Bookmark your favorite YouTube videos with a single click',
    color: 'bg-gradient-to-r from-white/20 to-white/10',
  },
  {
    icon: FiIcons.FiTag,
    title: 'Smart Organization',
    description: 'Categorize and tag your bookmarks for easy retrieval',
    color: 'bg-gradient-to-r from-white/20 to-white/10',
  },
  {
    icon: FiIcons.FiCpu,
    title: 'AI-Powered Summaries',
    description: 'Generate intelligent summaries of your bookmarked content',
    color: 'bg-gradient-to-r from-white/20 to-white/10',
  },
  {
    icon: FiIcons.FiPieChart,
    title: 'Visual Analytics',
    description: 'Track your viewing habits with beautiful interactive charts',
    color: 'bg-gradient-to-r from-white/20 to-white/10',
  },
  {
    icon: FiIcons.FiShare2,
    title: 'Cross-Device Sync',
    description: 'Access your bookmarks from any device, anywhere',
    color: 'bg-gradient-to-r from-white/20 to-white/10',
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
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300 }
  },
};

export default function ModernAnimatedFeatures() {
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const controls = useAnimation();
  
  // Rotate through demo items every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDemoIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Animate when demo index changes
  useEffect(() => {
    controls.start({
      opacity: [0, 1],
      y: [20, 0],
      transition: { duration: 0.5 }
    });
  }, [currentDemoIndex, controls]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full space-y-8 p-6"
    >
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
        >
          Bookmarkify
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-3 text-xl text-white text-opacity-90"
        >
          The smartest way to organize your online content
        </motion.p>
      </div>

      {/* Feature Cards with 3D Effect */}
      <motion.div variants={container} className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ scale: 1.03, rotateX: 2, rotateY: 2, boxShadow: "0 20px 30px -10px rgba(0,0,0,0.2)" }}
            className={`flex items-start p-5 ${feature.color} backdrop-blur-lg rounded-xl border border-white/20 shadow-xl`}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          >
            <div
              className="p-3 rounded-full bg-white/20 flex items-center justify-center mr-4"
              style={{ transform: "translateZ(10px)" }}
            >
              <SafeIcon icon={feature.icon} className="h-6 w-6 text-white" />
            </div>
            <div style={{ transform: "translateZ(5px)" }}>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-white text-opacity-90">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Demo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-10 relative"
        style={{ transformStyle: "preserve-3d", perspective: 1000, transformOrigin: "center center" }}
        whileHover={{ rotateX: 5, rotateY: 5, }}
      >
        <motion.div
          className="relative mx-auto w-full max-w-md"
          animate={{ rotateY: [-2, 2, -2], rotateX: [1, -1, 1] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        >
          {/* Demo Browser Window */}
          <div
            className="rounded-xl overflow-hidden shadow-2xl transform bg-white p-1"
            style={{ transform: "translateZ(50px)" }}
          >
            <div className="rounded-lg bg-gray-100 p-3">
              {/* Browser Controls */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="h-6 bg-white rounded-md flex-1 flex items-center px-3 text-xs text-gray-500">
                  bookmarkify.app
                </div>
              </div>

              {/* Demo Content */}
              <motion.div animate={controls} className="space-y-3">
                {currentDemoIndex === 0 && (
                  <>
                    {/* YouTube video bookmark example */}
                    <div className="h-12 bg-red-50 rounded-lg flex items-center px-3">
                      <SafeIcon icon={FiIcons.FiYoutube} className="text-red-600 mr-2" />
                      <div className="flex-1 h-4 bg-red-200 rounded-md"></div>
                      <SafeIcon icon={FiIcons.FiBookmark} className="ml-2 text-red-600" />
                    </div>
                    <div className="h-12 bg-red-50 rounded-lg flex items-center px-3">
                      <SafeIcon icon={FiIcons.FiYoutube} className="text-red-600 mr-2" />
                      <div className="flex-1 h-4 bg-red-200 rounded-md"></div>
                      <SafeIcon icon={FiIcons.FiBookmark} className="ml-2 text-red-600" />
                    </div>
                  </>
                )}

                {currentDemoIndex === 1 && (
                  <>
                    {/* Tag organization example */}
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs flex items-center">
                        <SafeIcon icon={FiIcons.FiTag} className="mr-1 h-3 w-3" />
                        Technology
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs flex items-center">
                        <SafeIcon icon={FiIcons.FiTag} className="mr-1 h-3 w-3" />
                        Tutorial
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs flex items-center">
                        <SafeIcon icon={FiIcons.FiTag} className="mr-1 h-3 w-3" />
                        Programming
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs flex items-center">
                        <SafeIcon icon={FiIcons.FiTag} className="mr-1 h-3 w-3" />
                        Design
                      </span>
                    </div>
                  </>
                )}

                {currentDemoIndex === 2 && (
                  <>
                    {/* AI Summary example */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center mb-1">
                        <SafeIcon icon={FiIcons.FiCpu} className="text-purple-600 mr-1" />
                        <div className="text-xs font-medium text-purple-800">AI Summary</div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 bg-purple-200 rounded-full w-full"></div>
                        <div className="h-2 bg-purple-200 rounded-full w-5/6"></div>
                        <div className="h-2 bg-purple-200 rounded-full w-4/6"></div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Notification Badge */}
          <div
            className="absolute -right-4 -bottom-4 transform rounded-lg overflow-hidden shadow-xl bg-white p-2 min-w-[180px]"
            style={{ transform: "translateZ(80px) rotate(-3deg)" }}
          >
            <div className="rounded bg-green-50 p-2 flex items-center">
              <SafeIcon
                icon={FiIcons.FiCheckCircle}
                className="text-green-500 h-6 w-6 flex-shrink-0"
              />
              <span className="ml-2 text-sm font-medium text-green-800">Bookmark Saved!</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}