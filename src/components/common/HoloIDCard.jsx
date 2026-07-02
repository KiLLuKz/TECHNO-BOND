import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { calculateLevel, calculateExpProgress } from '../../utils/levelUtils';
import { getTagConfig } from '../../config/tagsConfig';

const HoloIDCard = ({ 
  profile, 
  exp = 0, 
  isEditable = false, 
  onAvatarClick, 
  onBannerClick, 
  role = 'USER',
  defaultAvatar = null
}) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);


  const level = calculateLevel(exp);
  const { currentLevelExp, maxLevelExp } = calculateExpProgress(exp);
  const progressPercent = Math.min(100, Math.max(0, (currentLevelExp / maxLevelExp) * 100));

  // Visual Assets
  const bannerUrl = profile?.banner_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop";
  const avatarUrl = profile?.avatar_url || defaultAvatar;

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full max-w-sm md:max-w-2xl aspect-[3/4] md:aspect-[21/9] rounded-2xl cursor-pointer group"
    >
      {/* Glow Effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7ecfff] to-[#d966ff] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-2xl -z-10" />

      {/* Card Body */}
      <div 
        className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-[#08050f] shadow-2xl transition-all duration-300 group-hover:border-[#7ecfff]/50 flex flex-col md:flex-row"
        style={{ transformStyle: "preserve-3d" }}
      >
        
        {/* Banner Section */}
        <div 
          className="relative h-2/5 md:h-full md:w-2/5 w-full shrink-0 bg-cover bg-center border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center"
          style={{ backgroundImage: `url(${bannerUrl})`, transform: "translateZ(20px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#08050f] to-transparent opacity-80" />
          
          {isEditable && (
            <div 
              onClick={(e) => { e.stopPropagation(); onBannerClick?.(); }}
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg hover:bg-[#99eedd]/20 border border-white/20 hover:border-[#99eedd] transition-colors z-20 flex items-center gap-2"
            >
              <ImageIcon size={16} className="text-white" />
              <span className="text-xs font-bold text-white tracking-widest">BANNER</span>
            </div>
          )}

          {/* Glitch Overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none mix-blend-overlay"
               style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, white 3px, white 3px)' }}
          />

          {/* Avatar Section */}
          <div 
            className="z-30 relative"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className="relative group/avatar">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-[#08050f] shadow-[0_0_15px_rgba(126,207,255,0.4)] overflow-hidden bg-slate-800">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-white/50">?</div>
                )}
              </div>

              {isEditable && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onAvatarClick?.(); }}
                  className="absolute -bottom-1 -right-1 bg-[#99eedd] p-2 rounded-full border-2 border-[#08050f] cursor-pointer hover:scale-110 transition-transform shadow-lg z-40"
                >
                  <Camera size={16} className="text-[#08050f]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div 
          className="flex-1 p-6 flex flex-col justify-between items-center md:items-start relative z-20"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="w-full text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-wider truncate uppercase">
              {profile?.username || 'UNKNOWN'}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
              {/* Primary Role Tag */}
              {(() => {
                const displayRole = (profile?.role || role || 'PLAYER').toUpperCase();
                let roleColor = "text-[#99eedd] bg-white/10"; // Default Junior/Player
                if (displayRole === 'ADMIN') {
                  roleColor = "text-red-500 bg-red-500/10 font-bold border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
                } else if (displayRole === 'SENIOR') {
                  roleColor = "text-[#d966ff] bg-[#d966ff]/10 border-white/5";
                } else {
                  roleColor = "text-[#99eedd] bg-white/10 border-white/5";
                }
                return (
                  <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-mono tracking-widest border ${roleColor}`}>
                    {displayRole}
                  </span>
                );
              })()}
              
              {/* Test ID Tag */}
              {(profile?.student_id === '99999' || profile?.student_id === '99998') && (
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-[10px] md:text-xs font-bold tracking-widest whitespace-nowrap">
                  TEST-ID
                </span>
              )}

              {/* Custom Equipped Tags */}
              {(profile?.equipped_tags || []).map((tagId, i) => {
                const tagStyle = getTagConfig(tagId);
                return (
                  <span key={i} className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-mono tracking-widest border whitespace-nowrap ${tagStyle.colorClass}`}>
                    {tagStyle.label}
                  </span>
                );
              })}
            </div>
            
            <div className="text-xs text-white/50 font-mono text-center md:text-left mt-1">
              ID: {profile?.student_id || '----'}
            </div>
          </div>

          {/* Level Progress */}
          <div className="w-full mt-6 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-[#7ecfff]">LVL {level}</span>
              <span className="text-xs text-white/50 font-mono">{Math.floor(currentLevelExp)} / {maxLevelExp} EXP</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#7ecfff] to-[#99eedd] relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]" />
              </motion.div>
            </div>
          </div>

          {/* Cyberpunk Barcode Footer */}
          <div className="w-full mt-8 flex flex-col items-center md:items-start opacity-60">
            <div className="h-6 w-3/4 flex gap-1 justify-center md:justify-start">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-full bg-white ${Math.random() > 0.5 ? 'w-2' : 'w-1'} ${Math.random() > 0.8 ? 'opacity-30' : 'opacity-100'}`} />
              ))}
            </div>
            <span className="text-[10px] text-white/40 mt-1 font-mono tracking-[0.2em]">AUTH-SEC-ID-{Math.floor(Math.random() * 9000) + 1000}</span>
          </div>
        </div>

        {/* Glitch Overlay styling for css - injected globally or component level */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes stripes {
            0% { background-position: 1rem 0; }
            100% { background-position: 0 0; }
          }
        `}} />
      </div>
    </motion.div>
  );
};

export default HoloIDCard;
