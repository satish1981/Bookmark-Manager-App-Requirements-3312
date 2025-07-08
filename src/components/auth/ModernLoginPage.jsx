import React from 'react';
import { motion } from 'framer-motion';
import ModernAuthForm from './ModernAuthForm';
import ModernAnimatedFeatures from './ModernAnimatedFeatures';
import { Link } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function ModernLoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header for Mobile */}
      <header className="p-4 lg:hidden flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <SafeIcon icon={FiIcons.FiBookmark} className="h-6 w-6 text-[#FF0000]" />
          <span className="ml-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] to-[#FF5C36]">
            Bookmarkify
          </span>
        </Link>
        <Link to="/" className="text-gray-600 flex items-center">
          <SafeIcon icon={FiIcons.FiChevronLeft} className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </header>

      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          {/* Back to Home Link (Desktop) */}
          <div className="hidden lg:block mb-8">
            <Link to="/" className="text-gray-600 flex items-center hover:text-gray-900">
              <SafeIcon icon={FiIcons.FiChevronLeft} className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
          <ModernAuthForm />
        </div>
      </div>
      
      {/* Right Side - Animated Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 bg-gradient-to-br from-[#FF0000] via-[#FF4D00] to-[#FF8C00] flex items-center justify-center p-6 md:p-10 order-first lg:order-last"
      >
        <div className="w-full max-w-lg">
          <ModernAnimatedFeatures />
        </div>
      </motion.div>
    </div>
  );
}