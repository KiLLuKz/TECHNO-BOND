// src/components/Navbar.jsx
import React from 'react';

const Navbar = () => (
  // เปลี่ยนกลับเป็น fixed และปรับความโปร่งแสงเบาลงนิดนึงให้ทะลุเห็น Grid ด้านหลัง
  <nav className="fixed top-0 left-0 w-full z-50 px-8 py-5 flex justify-between items-center bg-[#08050f]/40 backdrop-blur-xl border-b border-[#99eedd]/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
    <div className="text-2xl font-black tracking-[0.2em] text-[#99eedd] text-glow">
      TECHNOLOGY PROGRAM
    </div>
    <div className="text-[10px] font-mono tracking-widest text-[#7eb8ff] bg-[#7eb8ff]/10 px-2 py-1 rounded border border-[#7eb8ff]/20">
      SYSTEM: ONLINE
    </div>
  </nav>
);

export default Navbar;