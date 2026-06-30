import React, { useState } from 'react';
import { Terminal, Maximize2, RefreshCw, Send } from 'lucide-react';

const SeniorClueController = ({ 
 clueData, 
 truncateText, 
 setModal, 
 handleResetClue, 
 submitClue 
}) => {
 const [newClues, setNewClues] = useState({ clue1: '', clue2: '', clue3: '' });
 const juniorId = clueData?.junior_student_id || 'UNKNOWN';

 const onSubmit = (clueField, stateKey) => {
 submitClue(clueField, newClues[stateKey], juniorId);
 setNewClues(prev => ({ ...prev, [stateKey]: '' }));
 };

 return (
 <div className="lg:col-span-2 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 shadow-xl flex flex-col mb-6">
 <h2 className="font-['Orbitron'] flex items-center gap-2 text-[#d966ff] mb-6 font-bold tracking-widest">
 <Terminal size={18} /> CLUE_CONTROLLER [JUNIOR: {juniorId}]
 </h2>
 <div className="space-y-4 flex-1">
 {['clue_1', 'clue_2', 'clue_3'].map((clueField, idx) => {
 const stateKey = clueField.replace('_', ''); // แปลงเป็น clue1, clue2, clue3
 return clueData?.[clueField] ? (
 <div key={clueField} className="p-3 bg-[#d966ff]/10 border border-[#d966ff]/20 rounded-xl flex justify-between items-center">
 <div>
 <span className="text-[#d966ff] block mb-1 text-[10px] tracking-widest">CLUE #{idx + 1} [UPLOADED]</span>
 <span className="text-gray-300 text-xs md:text-sm md:text-base">{truncateText(clueData[clueField])}</span>
 </div>
 <div className="flex items-center gap-3">
 <button 
 onClick={() => setModal({ isOpen: true, content: clueData[clueField] })} 
 className="text-[#d966ff]/60 hover:text-[#d966ff] transition-colors"
 >
 <Maximize2 size={16} />
 </button>
 <button 
 onClick={() => handleResetClue(clueField, juniorId, clueData)} 
 title="Reset Clue" 
 className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors"
 >
 <RefreshCw size={14} className="text-red-400" />
 </button>
 </div>
 </div>
 ) : (
 <div key={clueField} className="flex flex-col gap-2">
 <span className="text-[#d966ff] block text-[10px] tracking-widest">SET CLUE #{idx + 1} [PENDING]</span>
 <div className="flex gap-2">
 <input 
 className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 text-xs md:text-sm md:text-base text-white focus:outline-none focus:border-[#d966ff]/50" 
 placeholder={`Enter clue ${idx + 1}...`} 
 value={newClues[stateKey]} 
 onChange={(e) => setNewClues({...newClues, [stateKey]: e.target.value})} 
 />
 <button 
 onClick={() => onSubmit(clueField, stateKey)} 
 className="bg-[#d966ff]/20 border border-[#d966ff]/50 rounded-lg px-4 hover:bg-[#d966ff]/40 transition-all"
 >
 <Send size={14} className="text-[#d966ff]" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
};

export default SeniorClueController;