import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../context/AuthContext';
import * as FiIcons from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ModernAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  
  // Form variants for animations
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        staggerChildren: 0.1, 
        delayChildren: 0.2 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    try {
      // Validate inputs
      if (!validateEmail(email)) {
        setFormError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      if (!validatePassword(password) && !resetPasswordSent) {
        setFormError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      
      if (!isLogin && password !== confirmPassword) {
        setFormError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      // Reset password
      if (resetPasswordSent) {
        const { success, error } = await resetPassword(email);
        if (success) {
          setFormError('');
          alert('Password reset instructions have been sent to your email');
          setResetPasswordSent(false);
        } else {
          setFormError(error || 'Failed to send reset email');
        }
        setLoading(false);
        return;
      }
      
      // Login or register
      if (isLogin) {
        const { success, error } = await signIn(email, password);
        if (!success) {
          setFormError(error || 'Invalid credentials');
        }
      } else {
        const { success, error } = await signUp(email, password);
        if (success) {
          setFormError('');
          alert('Registration successful! Please check your email to confirm your account.');
        } else {
          setFormError(error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setFormError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormError('');
    setResetPasswordSent(false);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setResetPasswordSent(true);
    setFormError('');
  };

  const cancelResetPassword = () => {
    setResetPasswordSent(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl"
    >
      {/* Form Header */}
      <motion.div className="text-center" variants={itemVariants}>
        <motion.div 
          className="flex justify-center mb-4" 
          whileHover={{ scale: 1.05, rotate: 5 }} 
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiIcons.FiBookmark} className="h-12 w-12 text-[#FF0000]" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          {resetPasswordSent ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {resetPasswordSent
            ? "Enter your email to receive reset instructions"
            : isLogin
            ? "Sign in to access your bookmarks"
            : "Sign up to start saving bookmarks"}
        </p>
      </motion.div>

      {/* Error Message */}
      {formError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
        >
          <SafeIcon icon={FiIcons.FiAlertCircle} className="inline-block mr-2" />
          {formError}
        </motion.div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiIcons.FiMail} className="text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] text-gray-900"
              placeholder="you@example.com"
              required
            />
          </div>
        </motion.div>

        {/* Password Field */}
        {!resetPasswordSent && (
          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon icon={FiIcons.FiLock} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] text-gray-900"
                placeholder="••••••••"
                required={!resetPasswordSent}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SafeIcon
                    icon={showPassword ? FiIcons.FiEyeOff : FiIcons.FiEye}
                    className="h-5 w-5"
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirm Password Field (Sign Up only) */}
        {!isLogin && !resetPasswordSent && (
          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon icon={FiIcons.FiLock} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-[#FF0000] text-gray-900"
                placeholder="••••••••"
                required={!isLogin && !resetPasswordSent}
              />
            </div>
          </motion.div>
        )}

        {/* Forgot Password Link */}
        {isLogin && !resetPasswordSent && (
          <motion.div variants={itemVariants} className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#FF0000] hover:text-red-700 focus:outline-none font-medium"
            >
              Forgot password?
            </button>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-[#FF0000] to-[#FF5C36] hover:from-[#FF0000] hover:to-[#FF7C56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000] ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <SafeIcon icon={FiIcons.FiLoader} className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            {resetPasswordSent
              ? "Send Reset Instructions"
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </motion.button>
        </motion.div>
      </form>

      {/* Toggle Auth Mode / Back to Login */}
      <motion.div variants={itemVariants} className="mt-4 text-center">
        {resetPasswordSent ? (
          <motion.button
            onClick={cancelResetPassword}
            className="text-sm text-[#FF0000] hover:text-red-700 focus:outline-none font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to login
          </motion.button>
        ) : (
          <motion.button
            onClick={toggleAuthMode}
            className="text-sm text-[#FF0000] hover:text-red-700 focus:outline-none font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </motion.button>
        )}
      </motion.div>

      {/* Divider and Social Sign In Options */}
      {!resetPasswordSent && (
        <motion.div variants={itemVariants} className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <svg className="h-5 w-5 mr-2" fill="#4285F4" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
              Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <svg className="h-5 w-5 mr-2" fill="#3b5998" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Back to Home Link */}
      <motion.div variants={itemVariants} className="text-center text-sm text-gray-500">
        <Link to="/" className="text-[#FF0000] hover:text-red-700">
          Return to home page
        </Link>
      </motion.div>
    </motion.div>
  );
}