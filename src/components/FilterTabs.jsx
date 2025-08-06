'use client'

import { motion } from 'framer-motion';
import { Grid3X3, Type, Image, Calendar } from 'lucide-react';

const FilterTabs = ({ activeFilter = 'all', onFilterChange, counts = {} }) => {
  // Provide default values for counts
  const safeCounts = {
    all: counts.all || 0,
    text: counts.text || 0,
    image: counts.image || 0,
    event: counts.event || 0,
    ...counts
  };

  const filters = [
    { id: 'all', label: 'All', icon: Grid3X3, count: safeCounts.all },
    { id: 'text', label: 'Quotes', icon: Type, count: safeCounts.text },
    { id: 'image', label: 'Photos', icon: Image, count: safeCounts.image },
    { id: 'event', label: 'Events', icon: Calendar, count: safeCounts.event },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/20">
      <div className="flex flex-wrap gap-2 justify-center">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{filter.label}</span>
              {filter.count > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {filter.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterTabs;
