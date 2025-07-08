import React from 'react';
import { motion } from 'framer-motion';
import AuthForm from './AuthForm';
import AnimatedFeatures from './AnimatedFeatures';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>

      {/* Right Side - Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4 md:p-8 order-first lg:order-last"
      >
        <div className="w-full max-w-md">
          <AnimatedFeatures />
        </div>
      </motion.div>
    </div>
  );
}