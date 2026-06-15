import React, { useState } from 'react';
import { Users, Search, X, User } from 'lucide-react';

const SeniorDirectoryBox = ({ seniors }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSeniors = seniors.filter(sr => {
    const term = searchTerm.toLowerCase();
    return (sr.senior_student_id && sr.senior_student_id.toLowerCase().includes(term)) ||
           (sr.senior_full_name && sr.senior_full_name.toLowerCase().includes(term)) ||
           (sr.senior_nickname && sr.senior_nickname.toLowerCase().includes(term)) ||
           (sr.username && sr.username.toLowerCase().includes(term));
  });

  const renderUsername = (username) => {
    if (!username || username === 'NULL' || username === 'Not Registered' || username === '') {
      return (
        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-['Chakra_Petch'] tracking-wide">
          NOT REGISTERED
        </span>
      );
    }
    return <span className="font-mono text-gray-400 text-sm md:text-base">@{username}</span>;
  };

  return (
    <div className="lg:col-span-4 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 md:p-8 shadow-xl animate__animated animate__fadeIn h-full flex flex-col">
        
        {/* หัวข้อและช่องค้นหา */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <h2 className="flex items-center gap-3 text-[#99eedd] text-xl font-bold tracking-widest uppercase">
                <Users size={24} /> SENIOR_DATABASE
            </h2>
            
            <div className="relative w-full md:w-96">
                <input 
                    type="text" 
                    placeholder="ค้นหา รหัส, ชื่อจริง, ชื่อเล่น..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-[#99eedd]/30 rounded-xl py-3 pl-11 pr-10 text-base text-white focus:outline-none focus:border-[#99eedd]/70 transition-colors placeholder:text-gray-500 font-['Rajdhani']"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99eedd]/50" />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff5f56] transition-colors p-1"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>

        <div className="min-h-[300px] flex-1">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-xs tracking-widest text-gray-400 uppercase">
                            <th className="pb-4 pl-4 font-normal">Avatar</th>
                            <th className="pb-4 pl-6 font-normal">ID</th>
                            <th className="pb-4 pl-6 font-normal">Real Name</th>
                            <th className="pb-4 pl-6 font-normal">Nickname</th>
                            <th className="pb-4 pl-4 font-normal">Username</th>
                        </tr>
                    </thead>
                    <tbody className="font-['Rajdhani']">
                        {seniors.length === 0 ? (
                            <tr><td colSpan="5" className="py-10 text-center text-gray-500 text-sm">กำลังดึงข้อมูลพี่รหัส...</td></tr>
                        ) : filteredSeniors.length === 0 ? (
                            <tr><td colSpan="5" className="py-10 text-center text-gray-500 text-sm">ไม่พบข้อมูลที่ค้นหา</td></tr>
                        ) : (
                            filteredSeniors.map((sr) => (
                                <tr key={sr.senior_id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-white/10">
                                            {sr.avatar_url ? <img src={sr.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <User size={20} className="text-gray-400" />}
                                        </div>
                                    </td>
                                    <td className="py-4 pl-6 text-[#d966ff] font-['Orbitron'] font-bold">{sr.senior_student_id}</td>
                                    <td className="py-4 pl-6 text-gray-300 font-bold">{sr.senior_full_name || '-'}</td>
                                    <td className="py-4 pl-6 text-[#99eedd] font-bold">{sr.senior_nickname || '-'}</td>
                                    <td className="py-4 pl-4 text-gray-400">{renderUsername(sr.username)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
                {filteredSeniors.length > 0 ? (
                    filteredSeniors.map(sr => (
                        <div key={sr.senior_id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                                {sr.avatar_url && <img src={sr.avatar_url} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[#d966ff] font-['Orbitron'] font-bold text-sm">{sr.senior_student_id}</div>
                                <div className="text-gray-200 font-bold truncate">{sr.senior_full_name || '-'}</div>
                                <div className="text-[#99eedd] text-sm font-bold">{sr.senior_nickname || '-'}</div>
                                <div>{renderUsername(sr.username)}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">ไม่พบข้อมูล</div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SeniorDirectoryBox;