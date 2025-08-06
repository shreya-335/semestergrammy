'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users, Calendar, ArrowRight, Copy, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { joinSemesterWithPassword, getSemesterData, generateInvitationLink } from '../services/semesterAccess';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

const SemesterJoin = ({ semesterId, onJoinSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [semesterData, setSemesterData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingSemester, setLoadingSemester] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSemesterInfo();
  }, [semesterId]);

  const loadSemesterInfo = async () => {
    try {
      setLoadingSemester(true);
      // Try to get basic semester info (without access check)
      const response = await fetch(`/api/semester-info/${semesterId}`);
      if (response.ok) {
        const data = await response.json();
        setSemesterData(data);
      }
    } catch (error) {
      console.error('Error loading semester info:', error);
      toast.error('Could not load semester information');
    } finally {
      setLoadingSemester(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter the semester password');
      return;
    }

    setLoading(true);

    try {
      const result = await joinSemesterWithPassword(
        semesterId, 
        password.trim(), 
        user.uid, 
        user.email
      );
      
      toast.success(result.message);
      onJoinSuccess?.(semesterId);
    } catch (error) {
      console.error('Error joining semester:', error);
      
      if (error.message === 'Incorrect password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.message === 'Semester not found') {
        toast.error('This semester invitation is invalid or expired.');
      } else {
        toast.error('Failed to join semester. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const { url } = generateInvitationLink(semesterId, semesterData?.name || 'Semester');
    navigator.clipboard.writeText(url);
    toast.success('Invitation link copied! 📋');
  };

  const shareInvite = async () => {
    const { url, message } = generateInvitationLink(semesterId, semesterData?.name || 'Semester');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${semesterData?.name || 'Semester'}`,
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

  if (loadingSemester) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-amber-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-lg">Loading semester information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden max-w-md w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Protected Semester</h1>
          <p className="text-white/90">
            {semesterData?.name || 'Semester'} requires a password to join
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Semester Info */}
          {semesterData && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">{semesterData.name}</h3>
              <p className="text-amber-700 text-sm mb-3">{semesterData.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-amber-600">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{semesterData.memberCount || 0} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(semesterData.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Auth Status */}
          {!user ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm text-center">
                🔐 You need to sign in or create an account to join this semester
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
              >
                Sign In / Create Account
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm text-center">
                ✅ Signed in as {user.email}
              </p>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-amber-700 text-sm font-medium mb-2">
                Semester Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the password provided by your friend"
                className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                required
              />
              <p className="text-amber-500 text-xs mt-1">
                Ask the semester creator for the password
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !user}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Join Semester
                </>
              )}
            </motion.button>
          </form>

          {/* Share Options */}
          <div className="mt-6 pt-6 border-t border-amber-200">
            <p className="text-amber-600 text-sm text-center mb-3">
              Want to invite others?
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyInviteLink}
                className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={shareInvite}
                className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signin"
        semesterId={semesterId}
      />
    </div>
  );
};

export default SemesterJoin;
