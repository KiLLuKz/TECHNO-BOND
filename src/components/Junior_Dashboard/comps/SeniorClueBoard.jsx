import React from 'react';
import { Terminal, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const SeniorClueBoard = ({ clueData, isClue2Unlocked, isClue3Unlocked, setModal, truncateClue }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <div className="lg:col-span-2 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 shadow-xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2 text-[#d966ff] font-bold tracking-widest"><Terminal size={18} /> SENIOR_CLUES</h2>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 flex-1">
        {/* Clue #1 */}
        <motion.div variants={itemVariants} className="p-4 bg-[#99eedd]/10 border border-[#99eedd]/20 rounded-xl text-sm cursor-pointer hover:bg-[#99eedd]/20 transition-all" 
             onClick={() => setModal({ isOpen: true, content: clueData?.clue_1 })}>
          <span className="text-[#99eedd] block mb-1 text-xs">CLUE #1 [DECRYPTED]</span>
          {truncateClue(clueData?.clue_1)}
        </motion.div>
        
        {/* Clue #2 */}
        <motion.div variants={itemVariants} className={`p-4 border rounded-xl text-sm flex items-center justify-between transition-all ${isClue2Unlocked ? 'bg-[#99eedd]/10 border-[#99eedd]/20 cursor-pointer hover:bg-[#99eedd]/20' : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'}`} 
             onClick={() => isClue2Unlocked && setModal({ isOpen: true, content: clueData.clue_2 })}>
          <div>
             <span className={`block mb-1 text-xs ${isClue2Unlocked ? 'text-[#99eedd]' : 'text-gray-500'}`}>
                {isClue2Unlocked ? "CLUE #2 [DECRYPTED]" : !clueData?.clue_2 ? "CLUE #2 [PENDING SENIOR]" : "CLUE #2 [LOCKED]"}
             </span>
             <span>
                {isClue2Unlocked ? truncateClue(clueData.clue_2) : 
                 !clueData?.clue_2 ? "Waiting for transmission..." : 
                 "Requires: July 2nd + Passed Quiz"}
             </span>
          </div>
          {!isClue2Unlocked && <Lock size={16} />}
        </motion.div>

        {/* Clue #3 */}
        <motion.div variants={itemVariants} className={`p-4 border rounded-xl text-sm flex items-center justify-between transition-all ${isClue3Unlocked ? 'bg-[#99eedd]/10 border-[#99eedd]/20 cursor-pointer hover:bg-[#99eedd]/20' : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'}`} 
             onClick={() => isClue3Unlocked && setModal({ isOpen: true, content: clueData.clue_3 })}>
          <div>
             <span className={`block mb-1 text-xs ${isClue3Unlocked ? 'text-[#99eedd]' : 'text-gray-500'}`}>
                {isClue3Unlocked ? "CLUE #3 [DECRYPTED]" : !clueData?.clue_3 ? "CLUE #3 [PENDING SENIOR]" : "CLUE #3 [LOCKED]"}
             </span>
             <span>
                {isClue3Unlocked ? truncateClue(clueData.clue_3) : 
                 !clueData?.clue_3 ? "Waiting for transmission..." : 
                 "Requires: August 12th + Passed Quest"}
             </span>
          </div>
          {!isClue3Unlocked && <Lock size={16} />}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SeniorClueBoard;