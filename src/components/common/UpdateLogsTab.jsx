import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileClock, Sparkles, Zap, Wrench, ChevronDown } from 'lucide-react';

const updateLogsData = [
  {
    version: 'v1.0.1 (Custom Tag Editor)',
    date: '2026-07-03',
    type: 'improvement',
    summary: 'พัฒนาระบบสวมใส่ป้ายฉายา (Tag Equipment)',
    changes: [
      'เพิ่มระบบจัดการและสวมใส่ป้ายฉายาในหน้า Profile (สถานะ: In-Development)',
      'เพิ่มดีไซน์ป้ายรูปแบบต่างๆ ในแคตตาล็อกระบบเตรียมพร้อมสำหรับการปลดล็อก',
      'ปรับปรุงการแสดงผล Leaderboard ให้รองรับการแสดงป้ายฉายาสูงสุด 3 ป้ายเพื่อความสวยงาม'
    ]
  },
  {
    version: 'v1.0.0 (System Core Initialization)',
    date: '2026-07-02',
    type: 'feature',
    summary: 'เปิดตัวเว็บไซต์ระบบสารสนเทศและการจัดการอย่างเป็นทางการ (Official Launch)',
    changes: [
      'เปิดใช้งานระบบยืนยันตัวตน (Authentication) และการแบ่งสิทธิ์ผู้ใช้งานตามระดับ (Role-Based Access Control)',
      'ระบบ Dashboard แยกส่วนสำหรับสายรหัส (Senior) และสายรหัส (Junior) เพื่อความเป็นส่วนตัวและประสิทธิภาพในการเข้าถึงข้อมูล',
      'เปิดใช้งานศูนย์รวมกิจกรรม (Activity Hub) และภารกิจ (Missions) พร้อมระบบสะสมค่าประสบการณ์ (EXP)',
      'ระบบ Holographic ID Card แสดงสถานะนักเรียนแบบ 3D พร้อมแถบป้ายสถานะ (ADMIN, SENIOR, JUNIOR)',
      'เปิดใช้งานระบบตู้รายชื่อ (Directory) สำหรับตรวจสอบข้อมูลสมาชิกในสายรหัส',
      'เปิดใช้งานลานประลอง (MiniGames Arcade) และกระดานผู้นำ (Global Leaderboard) แบบเรียลไทม์'
    ]
  }
];

const getIconForType = (type) => {
  switch (type) {
    case 'feature': return <Sparkles size={20} className="text-[#d966ff]" />;
    case 'bugfix': return <Wrench size={20} className="text-red-400" />;
    case 'improvement': return <Zap size={20} className="text-[#7ecfff]" />;
    default: return <FileClock size={20} className="text-gray-400" />;
  }
};

const UpdateLogsTab = () => {
  const [expandedIndex, setExpandedIndex] = useState(0); // Open the first one by default

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8">
        <FileClock size={32} className="text-[#99eedd]" />
        <div>
          <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#99eedd] to-[#7ecfff]">
            SYSTEM LOGS
          </h2>
          <p className="text-sm text-gray-400 font-mono mt-1 tracking-widest uppercase">
            Official Changelog & Release Notes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {updateLogsData.map((log, index) => {
          const isOpen = expandedIndex === index;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-[#08050f]/80 backdrop-blur-xl border ${isOpen ? 'border-[#99eedd]/50 shadow-[0_0_15px_rgba(153,238,221,0.15)]' : 'border-white/10 hover:border-white/20'} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              {/* Header (Clickable) */}
              <button 
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
                    {getIconForType(log.type)}
                  </div>
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                      <h3 className="font-['Orbitron'] text-lg md:text-xl font-bold text-white tracking-wider">
                        {log.version}
                      </h3>
                      <span className="text-xs md:text-sm font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 w-fit">
                        {log.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                      {log.summary}
                    </p>
                  </div>
                </div>
                
                <div className="pl-4">
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border ${isOpen ? 'border-[#99eedd]/50 text-[#99eedd]' : 'border-white/10 text-gray-400'} shrink-0`}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-6 md:px-6 md:pb-8 pt-2">
                      <div className="border-t border-white/10 pt-5 md:pl-[4.5rem]">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Detailed Changes:</h4>
                        <ul className="space-y-3">
                          {log.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-300">
                              <span className="text-[#99eedd] mt-1 shrink-0">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </span>
                              <span className="leading-relaxed">{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UpdateLogsTab;
