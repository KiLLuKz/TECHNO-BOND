import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Tag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { activitiesData, categories } from '../data/activitiesData';

const Activities = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredActivities = activeCategory === 'ALL' 
    ? activitiesData 
    : activitiesData.filter(act => act.category === activeCategory);

  return (
    <div className="min-h-screen text-white p-6 md:p-10 relative overflow-hidden font-['Rajdhani']">
      
      {/* Background Elements Removed */}

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
          <button 
            onClick={() => navigate('/')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 backdrop-blur-md text-gray-300 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold tracking-widest text-[#7ecfff] flex items-center gap-3 drop-shadow-[0_0_15px_rgba(126,207,255,0.4)]">
              <Sparkles size={36} className="text-[#ffe066] animate-pulse" />
              M.6/8 ACTIVITIES
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base tracking-widest">
              SHOWCASING OUR PROJECTS, EVENTS & ACHIEVEMENTS
            </p>
          </div>
        </div>

        {/* Categories Toggle */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-6 py-2.5 rounded-full font-bold tracking-widest text-xs md:text-sm transition-all duration-300 overflow-hidden border ${
                activeCategory === cat 
                  ? 'text-black border-transparent shadow-[0_0_20px_rgba(126,207,255,0.5)]' 
                  : 'text-gray-400 border-white/20 hover:border-white/50 hover:text-white bg-black/40 backdrop-blur-md'
              }`}
            >
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-[#7ecfff] to-[#4ECDC4] z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="group relative bg-[#08050f]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col transition-all duration-300"
                style={{ '--hover-color': act.color }}
              >
                {/* Image Section */}
                <div className="h-48 md:h-56 w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-10"></div>
                  <img 
                    src={act.image} 
                    alt={act.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  {/* Category Badge */}
                  <div 
                    className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-black text-[10px] md:text-xs font-bold tracking-wider backdrop-blur-md"
                    style={{ backgroundColor: act.color }}
                  >
                    {act.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow relative z-20 border-t border-white/5 text-center items-center">
                  <h3 className="font-['Orbitron'] text-xl font-bold mb-3 text-white group-hover:text-[var(--hover-color)] transition-colors duration-300">
                    {act.title}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-xs md:text-sm mb-4 font-bold">
                    <Calendar size={14} className="text-[var(--hover-color)]" />
                    {act.date}
                  </div>

                  <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 flex-grow text-center">
                    {act.description}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mt-auto">
                    {act.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5 group-hover:border-[var(--hover-color)]/30 transition-colors">
                        <Tag size={10} className="text-[var(--hover-color)]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Border on Hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--hover-color)] rounded-3xl transition-colors duration-300 pointer-events-none opacity-50"></div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl font-['Orbitron'] tracking-widest border border-dashed border-gray-600 rounded-3xl p-10 inline-block">
              NO ACTIVITIES FOUND IN THIS CATEGORY
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Activities;
