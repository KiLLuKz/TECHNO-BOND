import React, { useState } from 'react';
import { Users, Search, User } from 'lucide-react';

const UnifiedDirectoryBox = ({ seniors = [], juniors = [] }) => {
  const [viewMode, setViewMode] = useState('senior'); 
  const [searchTerm, setSearchTerm] = useState('');

  const rawData = viewMode === 'senior' ? seniors : juniors;

  // Sort ตาม student_id
  const sortedData = [...rawData].sort((a, b) => {
    return parseInt(a.student_id || 0) - parseInt(b.student_id || 0);
  });

  const filteredData = sortedData.filter(item => {
    const term = searchTerm.toLowerCase();
    const id = String(item.student_id || '').toLowerCase();
    const username = (item.username || '').toLowerCase();
    const nameOrNickname = viewMode === 'senior' 
      ? (item.senior_nickname || '').toLowerCase() 
      : (item.full_name || '').toLowerCase();

    return id.includes(term) || username.includes(term) || nameOrNickname.includes(term);
  });

  const renderUsername = (username) => {
    if (!username || username === 'NULL' || username === 'Not Registered' || username === '') {
      return (
        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-['Chakra_Petch']">
          N/A
        </span>
      );
    }
    return <span className="font-mono text-gray-200 text-sm md:text-base">@{username}</span>;
  };

  return (
    <div className="lg:col-span-4 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 md:p-8 shadow-xl animate__animated animate__fadeIn">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="flex items-center gap-2 text-[#99eedd] font-bold tracking-widest uppercase text-lg">
            <Users size={20} /> {viewMode === 'senior' ? 'SENIOR_DB' : 'JUNIOR_DB'}
            </h2>
            
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 w-full md:w-auto">
                <button 
                  onClick={() => setViewMode('senior')} 
                  className={`flex-1 md:px-6 py-2 text-xs md:text-sm rounded-md transition-all ${viewMode === 'senior' ? 'bg-[#99eedd] text-black font-bold' : 'text-gray-400'}`}
                >SENIOR</button>
                <button 
                  onClick={() => setViewMode('junior')} 
                  className={`flex-1 md:px-6 py-2 text-xs md:text-sm rounded-md transition-all ${viewMode === 'junior' ? 'bg-[#99eedd] text-black font-bold' : 'text-gray-400'}`}
                >JUNIOR</button>
            </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
                type="text"
                placeholder="ค้นหาด้วย ID, Username หรือชื่อ..."
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#99eedd]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {/* Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-white/10 text-xs tracking-widest text-gray-500 uppercase">
                <th className="pb-4 pl-2 font-normal w-20">Avatar</th>
                <th className="pb-4 pl-4 font-normal">ID</th>
                <th className="pb-4 pl-4 font-normal">{viewMode === 'senior' ? 'Nickname' : 'Full Name'}</th>
                <th className="pb-4 font-normal">Username</th>
                </tr>
            </thead>
            <tbody className="font-['Rajdhani'] text-base">
                {filteredData.map(renderRow)}
            </tbody>
            </table>
        </div>

        {/* Card View (Visible only on mobile) */}
        <div className="md:hidden flex flex-col gap-3">
            {filteredData.length > 0 ? (
                filteredData.map(item => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                            {item.avatar_url && <img src={item.avatar_url} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[#d966ff] font-['Orbitron'] font-bold text-sm">{item.student_id}</div>
                            <div className="text-[#99eedd] font-bold truncate">{viewMode === 'senior' ? (item.senior_nickname || '-') : (item.full_name || '-')}</div>
                            <div>{renderUsername(item.username)}</div>
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

  // Helper render row for Table
  function renderRow(item) {
    return (
        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="py-4 pl-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-white/10">
                {item.avatar_url ? <img src={item.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={20} className="text-gray-400" />}
            </div>
            </td>
            <td className="py-4 pl-4 text-[#d966ff] font-['Orbitron'] font-bold">{item.student_id}</td>
            <td className="py-4 pl-4 text-[#99eedd] font-bold">{viewMode === 'senior' ? (item.senior_nickname || '-') : (item.full_name || '-')}</td>
            <td className="py-4 pl-4">{renderUsername(item.username)}</td>
        </tr>
    );
  }
};

export default UnifiedDirectoryBox;