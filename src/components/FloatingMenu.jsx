import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { Menu, X, Home, LayoutDashboard, KeyRound, LogOut, Gamepad2, ShieldAlert, NotebookTabs } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingMenu = ({ userRole, isAdmin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = userRole !== null;
  const isDashboardPage = location.pathname.startsWith('/dashboard');

  // ตรวจสอบว่าเป็น Senior หรือ Admin หรือไม่
  const isSeniorOrAdmin = userRole === 'senior' || isAdmin;

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  // ซ่อน Floating Menu แบบสมบูรณ์ ถ้าอยู่ในหน้า Dashboard (เพื่อหลีกทางให้ Sidebar)
  const hideFloatingMenu = location.pathname.startsWith('/dashboard');
  if (hideFloatingMenu) return null;

  return (
    <div className="fixed top-8 right-8 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-[#08050f]/80 backdrop-blur-md border border-[#b464ff]/30 rounded-full text-[#99eedd] hover:bg-[#b464ff]/20 transition-all shadow-[0_0_15px_rgba(180,100,255,0.2)]"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-16 right-0 w-56 bg-[#08050f]/90 backdrop-blur-xl border border-[#b464ff]/30 rounded-2xl p-2"
        >
          
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#f0eaff] hover:bg-[#b464ff]/20 rounded-xl transition-all">
            <Home size={16} /> HOME
          </Link>
          
          <Link to="/curriculum" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#f0eaff] hover:bg-[#b464ff]/20 rounded-xl transition-all">
            <NotebookTabs size={16} /> CURRICULUM
          </Link>
          
          <Link 
            to={isLoggedIn ? "/dashboard" : "/verify"} 
            onClick={() => setIsOpen(false)} 
            className="flex items-center gap-3 px-4 py-3 text-sm text-[#f0eaff] hover:bg-[#b464ff]/20 rounded-xl transition-all"
          >
            {isLoggedIn ? <LayoutDashboard size={16} /> : <KeyRound size={16} />}
            {isLoggedIn ? 'DASHBOARD' : 'LOGIN/REGISTER'}
          </Link>



          {isLoggedIn && (
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#ff7ec8] hover:bg-[#ff7ec8]/20 rounded-xl transition-all mt-2 border-t border-[#b464ff]/20">
              <LogOut size={16} /> LOGOUT
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FloatingMenu;