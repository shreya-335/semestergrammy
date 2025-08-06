'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, mode = 'signin', semesterId = null }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (authMode === 'signup') {
        if (!displayName.trim()) {
          toast.error('Please enter your name');
          return;
        }
        await signUp(email, password, displayName.trim());
        onClose();
      } else if (authMode === 'reset') {
        await resetPassword(email);
        setAuthMode('signin');
      }
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setShowPassword(false);
  };

  const switchMode = (newMode) => {
    setAuthMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-amber-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-amber-900">
                {authMode === 'signin' && 'Welcome Back'}
                {authMode === 'signup' && 'Create Account'}
                {authMode === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-amber-600 text-sm">
                {authMode === 'signin' && 'Sign in to access your semesters'}
                {authMode === 'signup' && 'Join the semester collaboration'}
                {authMode === 'reset' && 'Enter your email to reset password'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field for signup */}
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password field */}
            {authMode !== 'reset' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'signin' && <LogIn className="w-4 h-4" />}
                  {authMode === 'signup' && <UserPlus className="w-4 h-4" />}
                  {authMode === 'reset' && <Mail className="w-4 h-4" />}
                  
                  {authMode === 'signin' && 'Sign In'}
                  {authMode === 'signup' && 'Create Account'}
                  {authMode === 'reset' && 'Send Reset Email'}
                </>
              )}
            </motion.button>
          </form>

          {/* Mode switching */}
          <div className="mt-6 text-center space-y-2">
            {authMode === 'signin' && (
              <>
                <p className="text-amber-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-amber-500 hover:text-amber-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <button
                  onClick={() => switchMode('reset')}
                  className="text-amber-500 hover:text-amber-700 text-sm"
                >
                  Forgot password?
                </button>
              </>
            )}
            
            {authMode === 'signup' && (
              <p className="text-amber-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-amber-500 hover:text-amber-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            
            {authMode === 'reset' && (
              <p className="text-amber-600 text-sm">
                Remember your password?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-amber-500 hover:text-amber-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Semester info if joining via invite */}
          {semesterId && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-700 text-sm text-center">
                🎓 You're joining a protected semester. Sign in or create an account to continue.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
