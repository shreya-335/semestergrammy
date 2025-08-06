'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, Type, Calendar, X, Upload, User, UserX, Link, Send, Camera, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { addPost } from '../services/firestore';
import CameraCapture from './CameraCapture';

const PostForm = ({ onClose, onPostAdded, semester }) => {
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Check if device has camera support
  const hasCameraSupport = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    
    // Clear URL if file is selected
    if (imageUrl) setImageUrl('');
  };

  const handleCameraCapture = (file) => {
    processImageFile(file);
    toast.success('Photo captured successfully! 📸');
  };

  const processImage = async (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size should be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (e) => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !imageFile && !imageUrl.trim() && postType !== 'event') {
      toast.error('Please add some content!');
      return;
    }

    if (postType === 'event' && (!eventTitle.trim() || !eventDate)) {
      toast.error('Please fill in event details!');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageData = '';
      
      // Handle image upload (convert to base64)
      if (imageFile) {
        finalImageData = await processImage(imageFile);
      } else if (imageUrl.trim()) {
        // Use provided URL
        finalImageData = imageUrl.trim();
      }

      const postData = {
        type: postType,
        content: content.trim(),
        author: author.trim() || 'Anonymous',
        color: getRandomColor(),
        semesterId: semester?.id || 'general',
        ...(postType === 'event' && {
          eventTitle: eventTitle.trim(),
          eventDate,
        }),
        ...(finalImageData && { imageUrl: finalImageData }),
      };

      const postId = await addPost(postData);
      
      // Add the new post to the local state immediately
      const newPost = {
        id: postId,
        ...postData,
        createdAt: new Date()
      };
      
      onPostAdded?.(newPost);
      toast.success('Post added! 🎉');
      onClose();
    } catch (error) {
      console.error('Error adding post:', error);
      if (error.message.includes('5MB')) {
        toast.error('Image too large! Please use a smaller image or compress it.');
      } else {
        toast.error('Failed to add post');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['sticky-yellow', 'sticky-pink', 'sticky-blue', 'sticky-green', 'sticky-purple', 'sticky-orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  return (
    <>
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
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-amber-900">Add New Memory</h3>
              <button
                onClick={onClose}
                className="text-amber-400 hover:text-amber-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Type Selection */}
            <div className="flex gap-2 mb-6">
              {[
                { id: 'text', icon: Type, label: 'Text' },
                { id: 'image', icon: Image, label: 'Photo' },
                { id: 'event', icon: Calendar, label: 'Event' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPostType(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    postType === id 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Author */}
              <input
                type="text"
                placeholder="Your name (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
              />

              {/* Event Fields */}
              {postType === 'event' && (
                <>
                  <input
                    type="text"
                    placeholder="Event title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    required
                  />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    required
                  />
                </>
              )}

              {/* Image Options */}
              {postType === 'image' && (
                <div className="space-y-4">
                  {/* Camera and Upload Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Camera Button */}
                    {hasCameraSupport() && (
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors"
                      >
                        <Camera className="w-8 h-8 text-amber-500 mb-2" />
                        <span className="text-sm text-amber-700 font-medium">Take Photo</span>
                        <span className="text-xs text-amber-500">📱 Use Camera</span>
                      </button>
                    )}
                    
                    {/* File Upload */}
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-amber-500 mb-2" />
                      <span className="text-sm text-amber-700 font-medium">Upload File</span>
                      <span className="text-xs text-amber-500">Max 5MB</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={!!imageUrl}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-amber-200"></div>
                    <span className="text-amber-500 text-sm">OR</span>
                    <div className="flex-1 h-px bg-amber-200"></div>
                  </div>

                  {/* Image URL Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                      <Link className="w-4 h-4" />
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) {
                          setImageFile(null);
                          setImagePreview('');
                        }
                      }}
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                      disabled={!!imageFile}
                    />
                    <p className="text-xs text-amber-500">
                      Paste a link to an image from the web
                    </p>
                  </div>

                  {/* Image Preview */}
                  {(imagePreview || imageUrl) && (
                    <div className="relative">
                      <img
                        src={imagePreview || imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-amber-200"
                        onError={(e) => {
                          if (imageUrl) {
                            e.target.style.display = 'none';
                            toast.error('Invalid image URL');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Content Textarea */}
              <textarea
                placeholder={
                  postType === 'event' 
                    ? "Event description (optional)" 
                    : "What's on your mind? Share a quote, memory, or thought..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
              />

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Add to {semester?.name || 'Semester'}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default PostForm;
