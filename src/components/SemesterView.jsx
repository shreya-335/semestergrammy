'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Filter, Grid, List, Search, Calendar, Users, ImageIcon, FileText } from 'lucide-react';
import PostCard from './PostCard';
import PostForm from './PostForm';

const SemesterView = ({ semester, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock posts for testing - replace with Firebase data later
  useEffect(() => {
    const mockPosts = [
      {
        id: '1',
        type: 'image',
        content: 'First day of classes! So excited for this semester 📚',
        author: 'Sarah M.',
        imageUrl: '/images/test-memory1.jpg',
        createdAt: new Date('2024-01-15'),
        color: 'sticky-blue'
      },
      {
        id: '2',
        type: 'text',
        content: 'Professor Johnson said something profound today: "Learning is not about memorizing facts, but about connecting ideas." This really resonated with me.',
        author: 'Mike K.',
        createdAt: new Date('2024-01-20'),
        color: 'sticky-yellow'
      },
      {
        id: '3',
        type: 'event',
        eventTitle: 'Study Group Session',
        eventDate: '2024-02-15',
        content: 'Weekly study group for Advanced Calculus. Bring your notes and questions!',
        author: 'Emma L.',
        createdAt: new Date('2024-02-10'),
        color: 'sticky-green'
      },
      {
        id: '4',
        type: 'image',
        content: 'Late night study session with the crew! Coffee and determination ☕',
        author: 'Alex R.',
        imageUrl: '/images/test-memory2.jpg',
        createdAt: new Date('2024-02-20'),
        color: 'sticky-pink'
      },
      {
        id: '5',
        type: 'text',
        content: 'Just realized I\'ve been pronouncing "epitome" wrong my entire life. College is really opening my eyes! 😅',
        author: 'Anonymous',
        createdAt: new Date('2024-02-25'),
        color: 'sticky-orange'
      }
    ];
    setPosts(mockPosts);
  }, [semester]);

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.type === filter;
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: posts.length,
    text: posts.filter(p => p.type === 'text').length,
    image: posts.filter(p => p.type === 'image').length,
    event: posts.filter(p => p.type === 'event').length
  };

  return (
    <div className="space-y-6">
      {/* Semester Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${semester.color} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{semester.name}</h1>
              <p className="text-white/90">{semester.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-white/80">Total Memories</div>
            </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="bg-white p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{stats.text}</span>
              </div>
              <div className="text-xs text-amber-500">Quotes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                <ImageIcon className="w-4 h-4" />
                <span className="font-semibold">{stats.image}</span>
              </div>
              <div className="text-xs text-amber-500">Photos</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{stats.event}</span>
              </div>
              <div className="text-xs text-amber-500">Events</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{semester.stats?.members || 0}</span>
              </div>
              <div className="text-xs text-amber-500">Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All', icon: Filter },
              { id: 'text', label: 'Quotes', icon: FileText },
              { id: 'image', label: 'Photos', icon: ImageIcon },
              { id: 'event', label: 'Events', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filter === id
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-amber-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4 text-amber-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts Grid/List */}
      <div className={viewMode === 'grid' 
        ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        : "space-y-4"
      }>
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <div key={post.id} className={viewMode === 'list' ? '' : 'break-inside-avoid'}>
              <PostCard
                post={post}
                onDelete={() => {}} // Add delete functionality later
                index={index}
                viewMode={viewMode}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-amber-800 mb-2">No memories found</h3>
          <p className="text-amber-600">
            {searchTerm ? 'Try a different search term' : 'Be the first to add a memory to this semester!'}
          </p>
        </div>
      )}

      {/* Add Post Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Post Form Modal */}
      {showForm && (
        <PostForm 
          onClose={() => setShowForm(false)}
          onPostAdded={(newPost) => {
            setPosts(prev => [newPost, ...prev]);
            setShowForm(false);
          }}
          semester={semester}
        />
      )}
    </div>
  );
};

export default SemesterView;
