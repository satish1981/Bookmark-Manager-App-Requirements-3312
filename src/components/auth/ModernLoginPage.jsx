import React from 'react';
import { motion } from 'framer-motion';
import ModernAuthForm from './ModernAuthForm';
import ModernAnimatedFeatures from './ModernAnimatedFeatures';

export default function ModernLoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <ModernAuthForm />
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