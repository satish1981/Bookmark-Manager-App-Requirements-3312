import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../context/AuthContext';
import * as FiIcons from 'react-icons/fi';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

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
        return;
      }

      if (!validatePassword(password) && !resetPasswordSent) {
        setFormError('Password must be at least 6 characters');
        return;
      }

      if (!isLogin && password !== confirmPassword) {
        setFormError('Passwords do not match');
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          {resetPasswordSent 
            ? "Reset Password" 
            : isLogin 
              ? "Login" 
              : "Create Account"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {resetPasswordSent 
            ? "Enter your email to receive reset instructions" 
            : isLogin 
              ? "Sign in to access your bookmarks" 
              : "Sign up to start saving bookmarks"}
        </p>
      </div>

      {formError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 text-sm text-red-700 bg-red-100 rounded-md"
        >
          <SafeIcon icon={FiIcons.FiAlertCircle} className="inline-block mr-2" />
          {formError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        {!resetPasswordSent && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required={!resetPasswordSent}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <SafeIcon 
                    icon={showPassword ? FiIcons.FiEyeOff : FiIcons.FiEye} 
                    className="h-5 w-5" 
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLogin && !resetPasswordSent && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required={!isLogin && !resetPasswordSent}
              />
            </div>
          </div>
        )}

        {isLogin && !resetPasswordSent && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
        )}

        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
        </div>
      </form>

      <div className="mt-4 text-center">
        {resetPasswordSent ? (
          <button
            onClick={cancelResetPassword}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Back to login
          </button>
        ) : (
          <button
            onClick={toggleAuthMode}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        )}
      </div>
    </motion.div>
  );
}