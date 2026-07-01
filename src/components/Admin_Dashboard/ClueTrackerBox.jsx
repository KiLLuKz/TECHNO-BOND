import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, FileSearch, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClueTrackerBox = ({ seniors }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSeniors = seniors.filter(senior => {
    const term = searchTerm.toLowerCase();
    const idMatch = senior.senior_student_id?.toLowerCase().includes(term);
    const nameMatch = senior.senior_full_name?.toLowerCase().includes(term);
    const nickMatch = senior.senior_nickname?.toLowerCase().includes(term);
    return idMatch || nameMatch || nickMatch;
  });

  return (
    <div className="bg-[#08050f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] mb-10 w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 text-white font-['Orbitron'] tracking-widest">
            <FileSearch size={32} className="text-[#ffe066] animate-pulse" /> CLUE TRACKER
          </h2>
          <p className="text-gray-400 text-base md:text-lg font-['Inter']">
            ตรวจสอบสถานะการส่งคำใบ้ของพี่รหัส
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full xl:w-80 group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ffe066] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ID, Name or Nickname..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 md:py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffe066]/50 focus:ring-1 focus:ring-[#ffe066]/50 transition-all text-base md:text-lg"
          />
        </div>
      </div>

      <div className="w-full">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/10 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-gray-300 text-lg tracking-wider font-['Orbitron'] border-b border-white/10 whitespace-nowrap">
                <th className="p-5 font-semibold">SENIOR ID</th>
                <th className="p-5 font-semibold">NAME / NICKNAME</th>
                <th className="p-5 font-semibold text-center">CLUE 1</th>
                <th className="p-5 font-semibold text-center">CLUE 2</th>
                <th className="p-5 font-semibold text-center">CLUE 3</th>
              </tr>
            </thead>
            <tbody className="text-lg font-['Inter']">
              <AnimatePresence>
                {filteredSeniors.map((senior, index) => {
                  const hasClue1 = !!senior.clue_1;
                  const hasClue2 = !!senior.clue_2;
                  const hasClue3 = !!senior.clue_3;

                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.02 }}
                      key={senior.senior_id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5 font-mono text-[#d966ff] font-bold">
                        {senior.senior_student_id}
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <div className="text-white font-semibold">{senior.senior_full_name || 'N/A'}</div>
                        <div className="text-gray-400 text-base mt-1">AKA: <span className="text-[#99eedd]">{senior.senior_nickname || 'Unknown'}</span></div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          {hasClue1 ? <CheckCircle size={28} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> : <XCircle size={28} className="text-red-500/50" />}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          {hasClue2 ? <CheckCircle size={28} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> : <XCircle size={28} className="text-red-500/50" />}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          {hasClue3 ? <CheckCircle size={28} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> : <XCircle size={28} className="text-red-500/50" />}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredSeniors.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 tracking-widest text-lg font-bold">
                    NO SENIOR DATA FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          <AnimatePresence>
            {filteredSeniors.map((senior, index) => {
              const hasClue1 = !!senior.clue_1;
              const hasClue2 = !!senior.clue_2;
              const hasClue3 = !!senior.clue_3;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  key={senior.senior_id} 
                  className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="flex flex-col border-b border-white/10 pb-4">
                    <span className="font-mono text-[#d966ff] font-bold text-lg mb-1 tracking-widest">
                      ID: {senior.senior_student_id}
                    </span>
                    <span className="text-white font-semibold text-lg">{senior.senior_full_name || 'N/A'}</span>
                    <span className="text-gray-400 text-base mt-1">AKA: <span className="text-[#99eedd]">{senior.senior_nickname || 'Unknown'}</span></span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-gray-400 font-['Orbitron'] text-xs tracking-widest mb-2">CLUE 1</span>
                      {hasClue1 ? <CheckCircle size={28} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> : <XCircle size={28} className="text-red-500/50" />}
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-gray-400 font-['Orbitron'] text-xs tracking-widest mb-2">CLUE 2</span>
                      {hasClue2 ? <CheckCircle size={28} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> : <XCircle size={28} className="text-red-500/50" />}
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-gray-400 font-['Orbitron'] text-xs tracking-widest mb-2">CLUE 3</span>
                      {hasClue3 ? <CheckCircle size={28} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> : <XCircle size={28} className="text-red-500/50" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredSeniors.length === 0 && (
            <div className="p-10 text-center text-gray-500 tracking-widest text-lg font-bold border border-white/10 rounded-2xl">
              NO SENIOR DATA FOUND
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClueTrackerBox;
