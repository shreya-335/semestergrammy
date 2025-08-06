'use client'

import { motion } from 'framer-motion';
import { Calendar, Trash2, User, UserX, Clock } from 'lucide-react';
import { format, isValid } from 'date-fns';

const PostCard = ({ post, onDelete, index, viewMode = 'grid' }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return isValid(date) ? format(date, 'MMM dd, yyyy') : '';
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM dd, yyyy') : dateString;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl shadow-md border border-amber-200 p-4 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex gap-4">
          {post.imageUrl && (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={post.imageUrl || "/placeholder.svg"}
                alt="Post content"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {post.type === 'event' && post.eventTitle && (
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-amber-900">{post.eventTitle}</h3>
                {post.eventDate && (
                  <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                    {formatEventDate(post.eventDate)}
                  </span>
                )}
              </div>
            )}
            
            {post.content && (
              <p className="text-amber-800 text-sm leading-relaxed mb-3 line-clamp-3">
                {post.content}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-amber-600">
              <div className="flex items-center gap-2">
                {post.isAnonymous ? (
                  <UserX className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                <span>{post.author || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onDelete(post.id)}
            className="text-amber-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid view (sticky note style)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 10 - 5 }}
      animate={{ opacity: 1, scale: 1, rotate: Math.random() * 6 - 3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        zIndex: 10,
        transition: { duration: 0.2 }
      }}
      className={`${post.color} p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative group min-h-[200px] max-w-sm`}
      style={{
        transform: `rotate(${Math.random() * 6 - 3}deg)`,
      }}
    >
      {/* Delete Button */}
      <button
        onClick={() => onDelete(post.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200 z-20"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Post Content */}
      <div className="space-y-3">
        {/* Event Title */}
        {post.type === 'event' && post.eventTitle && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <h3 className="font-semibold text-lg">{post.eventTitle}</h3>
          </div>
        )}

        {/* Event Date */}
        {post.type === 'event' && post.eventDate && (
          <div className="bg-black/10 rounded-lg p-2 text-center">
            <p className="font-medium">{formatEventDate(post.eventDate)}</p>
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt="Post content"
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Text Content */}
        {post.content && (
          <p className="text-sm leading-relaxed break-words">
            {post.content}
          </p>
        )}

        {/* Author and Date */}
        <div className="flex items-center justify-between text-xs opacity-75 mt-auto">
          <div className="flex items-center gap-1">
            {post.isAnonymous ? (
              <UserX className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            <span className="font-medium">
              {post.author || 'Anonymous'}
            </span>
          </div>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
