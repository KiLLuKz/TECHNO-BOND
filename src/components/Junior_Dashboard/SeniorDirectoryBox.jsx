import React, { useState } from 'react';
import { Users, Search, X, User } from 'lucide-react';

const seniorNicknames = {
  '37209': 'พี่วิน (1)', '37212': 'พี่ซัน', '37215': 'พี่ภูมิ', '37218': 'พี่เบ็น',
  '37222': 'พี่ภีม', '37236': 'พี่เดล', '37251': 'พี่พัด', '37253': 'พี่อาร์ม',
  '37256': 'พี่หยุง', '37259': 'พี่คิว', '37292': 'พี่วิน (12)', '37325': 'พี่ชิ',
  '37336': 'พี่ลุค', '37405': 'พี่ปุ้ง', '37444': 'พี่การ์ตูน', '37445': 'พี่ซีน',
  '37446': 'พี่แม็ก', '37457': 'พี่ปกป้อง', '37543': 'พี่สบายดี', '37574': 'พี่อั้ม',
  '37600': 'พี่ที', '37627': 'พี่ซันเป่า', '37629': 'พี่ไนท์', '37636': 'พี่ลาส',
  '39632': 'พี่ปูเล', '39637': 'พี่กัน', '39645': 'พี่เฟส', '39692': 'พี่กัสใจ๋',
  '39702': 'พี่เปาเปา', '39709': 'พี่โต้', '37273': 'พี่โม', '37299': 'พี่เทค',
  '37311': 'พี่เนย (34)', '37344': 'พี่ลีน่า', '37347': 'พี่ธิชา', '37396': 'พี่นุ่น',
  '37441': 'พี่วุ้นเส้น', '39643': 'พี่เนย (39)', '39694': 'พี่พีค'
};

const SeniorDirectoryBox = ({ seniors, getDefaultAvatar }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSeniors = seniors.filter(sr => {
    const nickname = seniorNicknames[sr.student_id] || '-';
    const term = searchTerm.toLowerCase();
    return sr.student_id.toLowerCase().includes(term) ||
           (sr.username && sr.username.toLowerCase().includes(term)) ||
           nickname.toLowerCase().includes(term);
  });

  return (
    <div className="lg:col-span-4 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 md:p-8 shadow-xl animate__animated animate__fadeIn">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <h2 className="flex items-center gap-3 text-[#99eedd] text-xl font-bold tracking-widest">
                <Users size={24} /> SENIOR_DATABASE
            </h2>
            <div className="flex w-full md:w-auto gap-3">
                <div className="relative flex-1 md:w-72">
                    <input 
                        type="text" 
                        placeholder="ค้นหา รหัส, ชื่อเล่น..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-[#99eedd]/30 rounded-xl py-3 pl-11 pr-10 text-base text-white focus:outline-none focus:border-[#99eedd]/70 transition-colors placeholder:text-gray-500 font-['Rajdhani']"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99eedd]/50" />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff5f56] transition-colors p-1"><X size={16} /></button>
                    )}
                </div>
                <button className="bg-[#99eedd]/10 border border-[#99eedd]/30 text-[#99eedd] px-6 py-3 rounded-xl text-sm hover:bg-[#99eedd]/30 transition-all font-bold tracking-wider active:scale-95 flex items-center gap-2">
                    SEARCH
                </button>
            </div>
        </div>

        {/* Table Section - เพิ่ม Custom Scrollbar ตรงนี้ */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          {/* ใส่ min-w-[700px] เพื่อไม่ให้ตารางโดนบีบในมือถือ */}
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              {/* ขยาย Font Header เป็น text-sm/text-base และบังคับไม่ให้ตัดคำ (whitespace-nowrap) */}
              <tr className="border-b border-white/10 text-xs md:text-sm tracking-widest text-gray-400 uppercase whitespace-nowrap">
                <th className="pb-4 pl-4 font-normal w-24">Avatar</th>
                <th className="pb-4 pl-6 font-normal">Student ID</th>
                <th className="pb-4 pl-6 font-normal">Nickname</th>
                <th className="pb-4 pl-4 font-normal">Username</th>
              </tr>
            </thead>
            <tbody className="font-['Rajdhani']">
              {seniors.length === 0 && (
                <tr><td colSpan="4" className="py-10 text-center text-gray-500 text-sm">กำลังดึงข้อมูลพี่รหัส...</td></tr>
              )}
              {filteredSeniors.map((sr) => {
                const nickname = seniorNicknames[sr.student_id] || 'Unknown';
                return (
                    // ขยาย Padding บนล่าง (py-4) และบังคับไม่ให้ตัดคำ
                    <tr key={sr.id} className="border-b border-white/5 hover:bg-white/10 transition-colors whitespace-nowrap">
                      <td className="py-4 pl-4">
                        {/* ขยายรูปภาพจาก w-8 เป็น w-12 h-12 */}
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-white/10 shadow-lg">
                          {sr.avatar_url ? (
                            <img 
                                src={sr.avatar_url} 
                                className="w-full h-full object-cover bg-[#08050f]" 
                                alt="avatar" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div className={`w-full h-full items-center justify-center bg-slate-800 ${sr.avatar_url ? 'hidden' : 'flex'}`}>
                             <User size={24} className="text-gray-400" />
                          </div>
                        </div>
                      </td>
                      {/* ขยายตัวหนังสือ */}
                      <td className="py-4 pl-6 text-[#d966ff] font-['Orbitron'] text-sm md:text-base tracking-wider">{sr.student_id}</td>
                      <td className="py-4 pl-6 text-[#99eedd] font-bold text-base md:text-lg">{nickname}</td>
                      <td className="py-4 pl-4 text-gray-300 text-sm md:text-base">
                        {sr.username && sr.username !== 'Unknown' ? `@${sr.username}` : (
                            <span className="text-[11px] bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 font-['Chakra_Petch'] tracking-wide shadow-sm">
                                NOT REGISTERED
                            </span>
                        )}
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default SeniorDirectoryBox;