import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function LandingHero() {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <motion.h1 
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="block">Organize your digital</span>{' '}
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] to-[#FF5C36]">
                  world with ease
                </span>
              </motion.h1>
              <motion.p 
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Bookmarkify is the smartest way to organize, discover, and access your online content. 
                Save articles, videos, and websites with AI-powered summaries and intelligent organization.
              </motion.p>
              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#FF0000] to-[#FF5C36] hover:from-[#FF0000] hover:to-[#FF7C56] md:py-4 md:text-lg md:px-10 shadow-lg"
                  >
                    Get started free
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#features"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#FF0000] bg-white border-[#FF0000] hover:bg-red-50 md:py-4 md:text-lg md:px-10"
                  >
                    Learn more
                  </a>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-6 sm:mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-sm text-gray-500 flex items-center justify-center lg:justify-start">
                  <SafeIcon icon={FiIcons.FiShield} className="h-4 w-4 mr-1 text-green-500" />
                  No credit card required to start
                </p>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <motion.div
          className="h-56 w-full relative sm:h-72 md:h-96 lg:w-full lg:h-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-blue-50 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5">
            <motion.div
              className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="h-10 bg-gray-100 flex items-center px-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto pr-12">
                  <div className="bg-gray-200 h-5 w-40 rounded-full"></div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <motion.div 
                  className="col-span-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-2/3 h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-1">
                      <div className="w-full h-3 bg-gray-200 rounded"></div>
                      <div className="w-full h-3 bg-gray-200 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="col-span-2 space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="bg-blue-50 p-3 rounded-lg flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                      <div className="h-4 w-4 bg-blue-500 rounded-sm"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="w-3/4 h-4 bg-blue-200 rounded mb-2"></div>
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-blue-200 rounded"></div>
                        <div className="w-full h-3 bg-blue-200 rounded"></div>
                        <div className="w-2/3 h-3 bg-blue-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg flex items-start">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                      <div className="h-4 w-4 bg-purple-500 rounded-sm"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="w-1/2 h-4 bg-purple-200 rounded mb-2"></div>
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-purple-200 rounded"></div>
                        <div className="w-3/4 h-3 bg-purple-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg flex items-start">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center">
                      <div className="h-4 w-4 bg-green-500 rounded-sm"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="w-2/3 h-4 bg-green-200 rounded mb-2"></div>
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-green-200 rounded"></div>
                        <div className="w-1/2 h-3 bg-green-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-5 -right-5 bg-white p-3 rounded-lg shadow-lg border border-gray-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="flex items-center text-sm">
                <SafeIcon icon={FiIcons.FiCpu} className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-gray-800 font-medium">AI Summary Generated</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}