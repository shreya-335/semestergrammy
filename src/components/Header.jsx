'use client'

import { motion } from 'framer-motion';
import { GraduationCap, Users, Calendar, Image, MessageSquare } from 'lucide-react';

const Header = () => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="glass rounded-2xl p-6 mb-8 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <GraduationCap className="w-8 h-8 text-yellow-300" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white font-display">
          Sem Collab Wall
        </h1>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <Users className="w-8 h-8 text-pink-300" />
        </motion.div>
      </div>
      
      <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
        Your shared semester scrapbook! Post memories, quotes, memes, and track events together 🎓✨
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span>Photos & Memes</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>Quotes & Memories</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Events & Deadlines</span>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
