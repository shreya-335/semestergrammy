'use client'

import { motion } from 'framer-motion';
import { Calendar, Users, Image, FileText, ChevronRight } from 'lucide-react';

const SemesterCabinet = ({ onSelectSemester }) => {
  // Mock data for semesters - you can later connect this to Firebase
  const semesters = [
    {
      id: 'fall-2024',
      name: 'Fall 2024',
      label: 'Fal 24',
      description: 'Current semester - lots of memories being made!',
      coverImage: '/images/semester1-cover.jpg',
      stats: { posts: 45, photos: 23, events: 8, members: 12 },
      color: 'from-red-400 to-orange-500',
      tabColor: 'bg-red-500'
    },
    {
      id: 'spring-2024',
      name: 'Spring 2024',
      label: 'Spr 24',
      description: 'Amazing spring semester with great friends',
      coverImage: '/images/semester2-cover.jpg',
      stats: { posts: 67, photos: 34, events: 12, members: 15 },
      color: 'from-green-400 to-emerald-500',
      tabColor: 'bg-green-500'
    },
    {
      id: 'fall-2023',
      name: 'Fall 2023',
      label: 'Fal 23',
      description: 'First semester together - where it all began',
      coverImage: '/images/semester3-cover.jpg',
      stats: { posts: 89, photos: 45, events: 15, members: 18 },
      color: 'from-blue-400 to-indigo-500',
      tabColor: 'bg-blue-500'
    },
    {
      id: 'spring-2023',
      name: 'Spring 2023',
      label: 'Spr 23',
      description: 'Freshman year memories and new beginnings',
      coverImage: '/images/semester1-cover.jpg',
      stats: { posts: 34, photos: 18, events: 6, members: 10 },
      color: 'from-purple-400 to-pink-500',
      tabColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Cabinet Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-amber-900 mb-4">
          📚 Your Semester Collection
        </h2>
        <p className="text-amber-700 max-w-2xl mx-auto">
          Each semester is organized like a file in your personal cabinet. 
          Click on any semester tab to explore all the memories, photos, and events from that time.
        </p>
      </div>

      {/* File Cabinet */}
      <div className="relative">
        {/* Cabinet Background */}
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-2xl p-8 shadow-2xl border-4 border-amber-300">
          <div className="space-y-4">
            {semesters.map((semester, index) => (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* File Tab */}
                <div className="flex items-center">
                  {/* Tab Label */}
                  <div className={`${semester.tabColor} text-white px-4 py-2 rounded-t-lg font-bold text-sm shadow-lg z-10 relative`}>
                    {semester.label}
                  </div>
                  
                  {/* File Folder */}
                  <motion.button
                    onClick={() => onSelectSemester(semester)}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-white rounded-r-xl rounded-bl-xl shadow-lg border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center p-6">
                      {/* Cover Image */}
                      <div className="w-24 h-16 rounded-lg overflow-hidden shadow-md mr-6">
                        <img
                          src={semester.coverImage || "/placeholder.svg"}
                          alt={semester.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Semester Info */}
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-amber-900 mb-1">
                          {semester.name}
                        </h3>
                        <p className="text-amber-600 text-sm mb-3">
                          {semester.description}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex gap-4 text-xs text-amber-700">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{semester.stats.posts} posts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            <span>{semester.stats.photos} photos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{semester.stats.events} events</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{semester.stats.members} members</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="w-6 h-6 text-amber-500" />
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Cabinet Shadow */}
        <div className="absolute inset-0 bg-amber-300 rounded-2xl transform translate-x-2 translate-y-2 -z-10"></div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          📋 How to use your Semester Cabinet
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-amber-700">
          <div className="flex items-start gap-2">
            <span className="text-amber-500">1.</span>
            <span>Click on any semester tab to open that folder</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500">2.</span>
            <span>Browse through all memories, photos, and events</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500">3.</span>
            <span>Add new content or organize existing memories</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterCabinet;
