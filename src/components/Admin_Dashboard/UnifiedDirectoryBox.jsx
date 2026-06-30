import React, { useState } from 'react';
import { Users, Search, User, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const UnifiedDirectoryBox = ({ seniors = [], juniors = [], onUploadClick }) => {
 const [viewMode, setViewMode] = useState('senior'); 
 const [searchTerm, setSearchTerm] = useState('');

 const rawData = viewMode === 'senior' ? seniors : juniors;

 // Sort ตาม ID
 const sortedData = [...rawData].sort((a, b) => {
 const idA = parseInt(viewMode === 'senior' ? (a.senior_student_id || 0) : (a.junior_student_id || 0));
 const idB = parseInt(viewMode === 'senior' ? (b.senior_student_id || 0) : (b.junior_student_id || 0));
 return idA - idB;
 });

 // Filter ข้อมูล
 const filteredData = sortedData.filter(item => {
 const term = searchTerm.toLowerCase();
 const id = String(viewMode === 'senior' ? (item.senior_student_id || '') : (item.junior_student_id || '')).toLowerCase();
 const username = (item.username || '').toLowerCase();
 const name = viewMode === 'senior' ? (item.senior_full_name || '').toLowerCase() : (item.junior_full_name || '').toLowerCase();
 const nickname = viewMode === 'senior' ? (item.senior_nickname || '').toLowerCase() : (item.junior_nickname || '').toLowerCase();

 return id.includes(term) || username.includes(term) || name.includes(term) || nickname.includes(term);
 });

 const renderUsername = (username) => {
 if (!username || username === 'NULL' || username === 'Not Registered' || username === '') {
 return (
 <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 tracking-wide">
 NOT REGISTERED
 </span>
 );
 }
 return <span className="font-mono text-gray-200 text-sm md:text-base">@{username}</span>;
 };

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.5 }}
 className="lg:col-span-4 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 md:p-8 shadow-xl"
 >
 
 <div className="flex flex-col gap-6 mb-8">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <h2 className="font-['Orbitron'] flex items-center gap-2 text-[#99eedd] font-bold tracking-widest uppercase text-lg">
 <Users size={20} /> {viewMode === 'senior' ? 'SENIOR_DB' : 'JUNIOR_DB'}
 </h2>
 
 <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 w-full md:w-auto">
 <button 
 onClick={() => setViewMode('senior')} 
 className={`flex-1 md:px-6 py-2 text-xs md:text-sm md:text-base rounded-md transition-all ${viewMode === 'senior' ? 'bg-[#99eedd] text-black font-bold' : 'text-gray-400'}`}
 >SENIOR</button>
 <button 
 onClick={() => setViewMode('junior')} 
 className={`flex-1 md:px-6 py-2 text-xs md:text-sm md:text-base rounded-md transition-all ${viewMode === 'junior' ? 'bg-[#99eedd] text-black font-bold' : 'text-gray-400'}`}
 >JUNIOR</button>
 </div>
 </div>

 <div className="relative w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
 <input 
 type="text"
 placeholder="ค้นหาด้วย ID, Username, ชื่อจริง หรือชื่อเล่น..."
 className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm md:text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#99eedd]/50"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>

 <div className="min-h-[300px]">
 {/* Table View */}
 <div className="hidden md:block overflow-x-auto custom-scrollbar">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="border-b border-white/10 text-xs md:text-sm md:text-base tracking-widest text-gray-500 uppercase">
 <th className="pb-4 pl-2 font-normal w-20">Avatar</th>
 <th className="pb-4 pl-4 font-normal">Student ID</th>
 <th className="pb-4 pl-4 font-normal">Real Name</th>
 <th className="pb-4 pl-4 font-normal">Nickname</th>
 <th className="pb-4 pl-4 font-normal">Username</th>
 {viewMode === 'senior' && <th className="pb-4 pr-4 font-normal text-right">Actions</th>}
 </tr>
 </thead>
 <tbody className="font-['Rajdhani'] text-base">
 {filteredData.map((item) => (
 <tr key={viewMode === 'senior' ? item.senior_id : item.junior_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
 <td className="py-4 pl-2">
 <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-white/10 relative group cursor-pointer">
 {item.avatar_url ? <img src={item.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={20} className="text-gray-400" />}
 </div>
 </td>
 <td className="py-4 pl-4 text-[#d966ff] font-bold">
 {viewMode === 'senior' ? item.senior_student_id : item.junior_student_id}
 </td>
 <td className="py-4 pl-4 text-gray-200 font-bold">
 {viewMode === 'senior' ? (item.senior_full_name || '-') : (item.junior_full_name || '-')}
 </td>
 <td className="py-4 pl-4 text-[#99eedd] font-bold">
 {viewMode === 'senior' ? (item.senior_nickname || '-') : (item.junior_nickname || '-')}
 </td>
 <td className="py-4 pl-4">{renderUsername(item.username)}</td>
 {viewMode === 'senior' && (
 <td className="py-4 pr-4 text-right">
 <button 
 onClick={() => onUploadClick(item)}
 className={`text-xs md:text-sm md:text-base px-3 py-1.5 rounded-lg flex items-center gap-2 ml-auto transition-colors border ${
 item.senior_photo_url 
 ?"bg-[#99eedd]/10 text-[#99eedd] hover:bg-[#99eedd]/30 border-[#99eedd]/40" 
 :"bg-[#7ecfff]/20 text-[#7ecfff] hover:bg-[#7ecfff]/40 border-[#7ecfff]/50"
 }`}
 >
 <Camera size={14} /> {item.senior_photo_url ?"EDIT PHOTO" :"ADD PHOTO"}
 </button>
 </td>
 )}
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Card View (Mobile) */}
 <div className="md:hidden flex flex-col gap-4">
 {filteredData.map((item) => (
 <div key={viewMode === 'senior' ? item.senior_id : item.junior_id} className="bg-black/20 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
 {item.avatar_url ? <img src={item.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={20} className="text-gray-400" />}
 </div>
 <div className="flex flex-col">
 <span className="text-[#d966ff] font-bold">
 ID: {viewMode === 'senior' ? item.senior_student_id : item.junior_student_id}
 </span>
 <span className="text-lg text-[#99eedd]">
 {viewMode === 'senior' ? (item.senior_nickname || '-') : (item.junior_nickname || '-')}
 </span>
 </div>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-gray-400 text-sm md:text-base">
 {viewMode === 'senior' ? (item.senior_full_name || '-') : (item.junior_full_name || '-')}
 </span>
 <div>{renderUsername(item.username)}</div>
 </div>
 
 {viewMode === 'senior' && (
 <button 
 onClick={() => onUploadClick(item)}
 className={`absolute top-4 right-4 p-2 rounded-full transition-colors border z-10 ${
 item.senior_photo_url 
 ?"bg-[#99eedd]/10 text-[#99eedd] hover:bg-[#99eedd]/30 border-[#99eedd]/40" 
 :"bg-[#7ecfff]/20 text-[#7ecfff] hover:bg-[#7ecfff]/40 border-[#7ecfff]/50"
 }`}
 >
 <Camera size={16} />
 </button>
 )}
 </div>
 ))}
 {filteredData.length === 0 && (
 <div className="text-center py-10 text-gray-500">ไม่พบข้อมูล</div>
 )}
 </div>
 </div>
 </motion.div>
 );
};

export default UnifiedDirectoryBox;