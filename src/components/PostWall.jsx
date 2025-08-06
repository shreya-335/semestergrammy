'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToPosts, deletePost } from '../services/firestore';
import PostCard from './PostCard';
import toast from 'react-hot-toast';

const PostWall = ({ posts, onPostsChange, loading }) => {
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    console.log('📡 Setting up posts subscription...');
    
    const unsubscribe = subscribeToPosts((snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📦 Received posts:', postsData.length);
      onPostsChange(postsData);
      setLocalLoading(false);
    });

    return () => {
      console.log('🔌 Cleaning up posts subscription');
      unsubscribe();
    };
  }, [onPostsChange]);

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      toast.success('Post deleted! 🗑️');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (localLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
        <span className="ml-3 text-white">Loading posts...</span>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-white/20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-semibold text-white mb-4">
            No posts yet!
          </h3>
          <p className="text-white/70 mb-6">
            Be the first to add a memory, quote, or event to your semester wall.
          </p>
          <p className="text-white/50 text-sm">
            Click the + button to get started!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      <AnimatePresence>
        {posts.map((post, index) => (
          <div key={post.id} className="break-inside-avoid">
            <PostCard
              post={post}
              onDelete={handleDeletePost}
              index={index}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PostWall;
