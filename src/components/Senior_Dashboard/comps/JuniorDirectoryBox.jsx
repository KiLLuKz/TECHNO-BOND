import React, { useState } from 'react';
import { Users, Search, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import HoloIDModal from '../../common/HoloIDModal';

const JuniorDirectoryBox = ({ allJuniors, myJuniorIds = [] }) => {
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedProfile, setSelectedProfile] = useState(null);

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 10 },
 visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
 };

 const filteredJuniors = allJuniors.filter(jr => {
 const term = searchTerm.toLowerCase();
 return (jr.junior_student_id && jr.junior_student_id.toLowerCase().includes(term)) ||
 (jr.junior_full_name && jr.junior_full_name.toLowerCase().includes(term)) ||
 (jr.junior_nickname && jr.junior_nickname.toLowerCase().includes(term)) || // เพิ่มการค้นหาชื่อเล่น
 (jr.username && jr.username.toLowerCase().includes(term));
 });

 const renderUsername = (username) => {
 if (!username || username === 'NULL' || username === 'Not Registered' || username === '') {
 return (
 <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 tracking-wide">
 NOT REGISTERED
 </span>
 );
 }
 return <span className="font-mono text-gray-400 text-sm md:text-base">@{username}</span>;
 };


  const handleAvatarClick = (jr) => {
   setSelectedProfile({
     username: (jr.username && jr.username !== 'NULL' && jr.username !== 'Not Registered') ? jr.username : jr.junior_student_id,
     avatar_url: jr.avatar_url,
     banner_url: jr.banner_url,
     student_id: jr.junior_student_id,
     exp: jr.exp || 0,
     role: jr.role || 'JUNIOR',
     equipped_tags: jr.equipped_tags || []
   });
  };

 return (
 <>
 <motion.div 

 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.5 }}
 className="lg:col-span-4 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 md:p-8 shadow-xl h-full flex flex-col"
 >
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
 <h2 className="font-['Orbitron'] flex items-center gap-3 text-[#99eedd] text-xl font-bold tracking-widest">
 <Users size={24} /> JUNIOR_DATABASE
 </h2>
 <div className="relative w-full md:w-72">
 <input 
 type="text" 
 placeholder="ค้นหา ชื่อ, รหัส, ชื่อเล่น..." 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full bg-black/40 border border-[#99eedd]/30 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#99eedd]/70"
 />
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99eedd]/50" />
 </div>
 </div>

 <div className="min-h-[300px] flex-1">
 {/* Desktop Table View */}
 <div className="hidden md:block overflow-x-auto pb-4 custom-scrollbar">
 <table className="w-full min-w-[700px] text-left border-collapse">
 <thead>
 <tr className="border-b border-white/10 text-xs md:text-sm md:text-base tracking-widest text-gray-400 uppercase">
 <th className="pb-4 pl-4 font-normal">ID</th>
 <th className="pb-4 pl-6 font-normal">Avatar</th>
 <th className="pb-4 pl-6 font-normal">Real Name</th>
 <th className="pb-4 pl-4 font-normal">Nickname</th>
 <th className="pb-4 pl-4 font-normal">Username</th>
 <th className="pb-4 pl-4 font-normal">Status</th>
 </tr>
 </thead>
 <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
 {filteredJuniors.map((jr) => {
 const isMyJunior = myJuniorIds.includes(jr.junior_id);
 return (
 <motion.tr variants={itemVariants} key={jr.junior_id} className={`border-b transition-colors cursor-pointer ${isMyJunior ? 'bg-[#99eedd]/5 border-[#99eedd]/20 hover:bg-[#99eedd]/10' : 'border-white/5 hover:bg-white/5'}`} onClick={() => handleAvatarClick(jr)}>
 <td className="py-4 pl-4 font-bold text-[#d966ff]">{jr.junior_student_id}</td>
 <td className="py-4 pl-6">
 <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10">
 {jr.avatar_url ? <img src={jr.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={20} className="text-gray-400 m-auto mt-2" />}
 </div>
 </td>
 <td className="py-4 pl-6 font-bold text-gray-300">{jr.junior_full_name || '-'}</td>
 <td className="py-4 pl-4 text-[#99eedd] font-bold">{jr.junior_nickname || '-'}</td>
 <td className="py-4 pl-4">{renderUsername(jr.username)}</td>
 <td className="py-4 pl-4">
 {isMyJunior && (
 <span className="flex items-center gap-1 text-[#99eedd] text-xs md:text-sm md:text-base font-bold bg-[#99eedd]/10 px-2 py-1 rounded">
 <Star size={12} fill="#99eedd" /> MY JUNIOR
 </span>
 )}
 </td>
 </motion.tr>
 );
 })}
 </motion.tbody>
 </table>
 </div>

 {/* Mobile Card View */}
 <motion.div variants={containerVariants} initial="hidden" animate="visible" className="md:hidden flex flex-col gap-3">
 {filteredJuniors.length > 0 ? (
 filteredJuniors.map(jr => {
 const isMyJunior = myJuniorIds.includes(jr.junior_id);
 return (
 <motion.div variants={itemVariants} key={jr.junior_id} onClick={() => handleAvatarClick(jr)} className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors ${isMyJunior ? 'bg-[#99eedd]/5 border-[#99eedd]/20' : 'bg-white/5 border-white/5'}`}>
 <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
 {jr.avatar_url && <img src={jr.avatar_url} className="w-full h-full object-cover" alt="" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-center">
 <span className="text-[#d966ff] font-bold text-sm md:text-base">{jr.junior_student_id}</span>
 {isMyJunior && <Star size={14} className="text-[#99eedd]" fill="#99eedd" />}
 </div>
 <div className="text-gray-200 font-bold truncate">{jr.junior_full_name || '-'}</div>
 <div className="text-[#99eedd] text-sm md:text-base font-bold">{jr.junior_nickname || '-'}</div>
 <div>{renderUsername(jr.username)}</div>
 </div>
 </motion.div>
 )
 })
 ) : (
 <div className="text-center py-10 text-gray-500">ไม่พบข้อมูล</div>
 )}
 
 </motion.div>
 </div>
 </motion.div>
 
 <HoloIDModal 
  isOpen={!!selectedProfile} 
  onClose={() => setSelectedProfile(null)}
  profile={selectedProfile}
  role="JUNIOR"
 />
 </>
 );
};

export default JuniorDirectoryBox;