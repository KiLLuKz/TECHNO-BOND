// src/components/Footer.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname === '/dashboard/admin';

  // กำหนดสีตามสถานะ Admin (แดง) หรือปกติ (ม่วง/ฟ้า)
  const borderColor = isAdmin ? 'border-red-500/30' : 'border-[#7eb8ff]/20';
  const indicatorColor = isAdmin ? 'bg-red-500' : 'bg-[#99eedd]';
  const indicatorShadow = isAdmin ? 'shadow-[0_0_5px_#ef4444]' : 'shadow-[0_0_5px_#99eedd]';
  const accentText = isAdmin ? 'text-red-500' : 'text-[#d966ff]';
  const labelText = isAdmin ? 'text-red-500/60' : 'text-[#7eb8ff]/60';
  const lineGradient = isAdmin ? 'via-red-500/30' : 'via-[#7eb8ff]/30';

  return (
    <footer className={`w-full relative z-50 mt-auto py-4 px-6 bg-[#08050f]/80 backdrop-blur-xl border-t ${borderColor} flex flex-col items-center justify-center font-['Orbitron'] transition-colors duration-700`}>
      
      {/* Status Indicator */}
      <div className="flex items-center gap-2 mb-2">
          <span className={`w-1.5 h-1.5 ${indicatorColor} rounded-full animate-pulse ${indicatorShadow}`}></span>
          <span className={`${isAdmin ? 'text-red-400' : 'text-[#99eedd]'} text-[9px] tracking-[0.3em] uppercase transition-colors duration-700`}>
            {isAdmin ? 'SYSTEM_ALERT_ACTIVE' : 'SECURE_CONNECTION_ESTABLISHED'}
          </span>
      </div>

      {/* Dev Team Credit */}
      <p className={`text-[11px] tracking-[0.2em] ${labelText} font-['Rajdhani'] uppercase text-center flex flex-wrap justify-center gap-2 transition-colors duration-700`}>
        <span>© 2026 // SYS.DEV_TEAM:</span>
        <span className={accentText}>สรวิชญ์</span> 
        <span className="opacity-40">X</span> 
        <span className={accentText}>กาญจนา</span>
      </p>

      {/* Decorative Bottom Line */}
      <div className={`w-32 h-[1px] bg-gradient-to-r from-transparent ${lineGradient} to-transparent mt-3 transition-colors duration-700`}></div>
    </footer>
  );
};

export default Footer;