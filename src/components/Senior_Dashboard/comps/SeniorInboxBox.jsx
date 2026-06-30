import React from 'react';
import { MessageSquare, Maximize2, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const SeniorInboxBox = ({ 
 setInboxModal, 
 realMessages, 
 getDefaultAvatar, 
 formatTime 
}) => {
 const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 10 },
 visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
 };

 return (
 <div className="bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col h-[300px]">
 <div className="flex justify-between items-center mb-4">
 <h2 className="font-['Orbitron'] flex items-center gap-2 text-[#7eb8ff] font-bold tracking-widest">
 <MessageSquare size={18} /> INBOX_LOGS
 </h2>
 <button 
 onClick={() => setInboxModal(true)} 
 className="text-[10px] flex items-center gap-1 text-[#7eb8ff]/60 hover:text-[#7eb8ff] transition-colors"
 >
 <Maximize2 size={12}/> EXPAND
 </button>
 </div>
 <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#7eb8ff]/20">
 {realMessages.length === 0 && (
 <p className="text-xs md:text-sm md:text-base text-gray-500 text-center mt-10">NO TRANSMISSIONS YET</p>
 )}
 {realMessages.map((msg) => (
 <motion.div variants={itemVariants} key={msg.id} className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-lg p-3">
 {/* 2. ปรับการแสดงผลรูป Profile */}
 <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden flex-shrink-0 bg-[#08050f] flex items-center justify-center">
 {msg.avatar_url ? (
 <img 
 src={msg.avatar_url} 
 className="w-full h-full object-cover" 
 alt="sender"
 onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
 />
 ) : null}
 <div className={`w-full h-full items-center justify-center bg-slate-800 ${msg.avatar_url ? 'hidden' : 'flex'}`}>
 <User size={16} className="text-gray-400" />
 </div>
 </div>
 
 <div className="flex-1">
 <div className="flex justify-between items-center mb-1">
 <span className="text-[10px] text-[#7eb8ff] tracking-widest font-bold">
 {msg.display_name}
 </span>
 <span className="text-[9px] text-gray-500 font-['Rajdhani'] flex items-center gap-1">
 <Clock size={10} /> {formatTime(msg.created_at).split(' ')[1]}
 </span>
 </div>
 <p className="text-xs md:text-sm md:text-base text-gray-300 font-['Rajdhani'] leading-relaxed">
 {msg.message}
 </p>
 </div>
 </motion.div>
 ))}
 </motion.div>
 </div>
 );
};

export default SeniorInboxBox;