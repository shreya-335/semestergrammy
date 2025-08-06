'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Users, Calendar, Plus, Copy, Share2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createSemester, generateInvitationLink } from '../services/semesterAccess';
import toast from 'react-hot-toast';

const CreateSemesterModal = ({ isOpen, onClose, onSemesterCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdSemester, setCreatedSemester] = useState(null);
  const { user } = useAuth();

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a semester name');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please set a password');
      return;
    }

    if (password.length < 4) {
      toast.error('Password should be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const semesterData = {
        name: name.trim(),
        description: description.trim(),
        password: password.trim(),
        coverImage: '/images/semester1-cover.jpg', // Default cover
        color: 'from-amber-400 to-orange-500',
        tabColor: 'bg-amber-500'
      };

      const semesterId = await createSemester(semesterData, user.uid);
      
      const newSemester = {
        id: semesterId,
        ...semesterData,
        stats: { posts: 0, photos: 0, events: 0, members: 1 }
      };

      setCreatedSemester(newSemester);
      toast.success('Semester created successfully! 🎉');
      onSemesterCreated?.(newSemester);
    } catch (error) {
      console.error('Error creating semester:', error);
      toast.error('Failed to create semester');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!createdSemester) return;
    
    const { url } = generateInvitationLink(createdSemester.id, createdSemester.name);
    navigator.clipboard.writeText(url);
    toast.success('Invitation link copied! 📋');
  };

  const shareInvite = async () => {
    if (!createdSemester) return;
    
    const { url, message } = generateInvitationLink(createdSemester.id, createdSemester.name);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${createdSemester.name}`,
          text: message,
          url: url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyInviteLink();
        }
      }
    } else {
      copyInviteLink();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPassword('');
    setShowPassword(false);
    setCreatedSemester(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleClose}
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
                {createdSemester ? 'Semester Created!' : 'Create New Semester'}
              </h2>
              <p className="text-amber-600 text-sm">
                {createdSemester 
                  ? 'Share the link and password with your friends'
                  : 'Set up a password-protected semester for your group'
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {createdSemester ? (
            /* Success State */
            <div className="space-y-4">
              {/* Semester Info */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-1">{createdSemester.name}</h3>
                <p className="text-green-700 text-sm">{createdSemester.description}</p>
              </div>

              {/* Password Display */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-700 font-medium">Semester Password:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdSemester.password);
                      toast.success('Password copied!');
                    }}
                    className="text-amber-500 hover:text-amber-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-white p-3 rounded border font-mono text-lg text-center">
                  {createdSemester.password}
                </div>
                <p className="text-amber-600 text-xs mt-2">
                  Share this password with people you want to invite
                </p>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <p className="text-amber-700 font-medium text-center">Invite Your Friends:</p>
                <div className="flex gap-2">
                  <button
                    onClick={copyInviteLink}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Invite Link
                  </button>
                  <button
                    onClick={shareInvite}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">How to invite friends:</h4>
                <ol className="text-blue-800 text-sm space-y-1">
                  <li>1. Share the invitation link above</li>
                  <li>2. Give them the password: <code className="bg-white px-1 rounded">{createdSemester.password}</code></li>
                  <li>3. They'll create an account and join your semester!</li>
                </ol>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Semester Name */}
              <div>
                <label className="block text-amber-700 text-sm font-medium mb-2">
                  Semester Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fall 2024, Spring Semester, etc."
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-amber-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this semester or group..."
                  rows={3}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-amber-700 text-sm font-medium mb-2">
                  Semester Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password for your semester"
                    className="w-full px-4 py-3 pr-20 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    required
                    minLength={4}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-amber-400 hover:text-amber-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-amber-500 text-xs">
                    Minimum 4 characters
                  </p>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-amber-500 hover:text-amber-700 text-xs underline"
                  >
                    Generate Random
                  </button>
                </div>
              </div>

              {/* Submit Button */}
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
                    <Plus className="w-4 h-4" />
                    Create Semester
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateSemesterModal;
