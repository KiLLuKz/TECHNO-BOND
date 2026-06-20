import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemAlert = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'CONFIRM', cancelText = 'CANCEL', children }) => {
  // ตั้งค่าสีและไอคอนตามประเภทของ Alert
  const configs = {
    success: { color: 'text-[#99eedd]', border: 'border-[#99eedd]/50', glow: 'shadow-[0_0_20px_rgba(153,238,221,0.3)]', bg: 'bg-[#99eedd]/10', icon: <CheckCircle size={40} className="drop-shadow-[0_0_10px_rgba(153,238,221,0.8)]" /> },
    error: { color: 'text-[#ff4d4d]', border: 'border-[#ff4d4d]/50', glow: 'shadow-[0_0_20px_rgba(255,77,77,0.3)]', bg: 'bg-[#ff4d4d]/10', icon: <ShieldAlert size={40} className="drop-shadow-[0_0_10px_rgba(255,77,77,0.8)]" /> },
    warning: { color: 'text-[#ffe066]', border: 'border-[#ffe066]/50', glow: 'shadow-[0_0_20px_rgba(255,224,102,0.3)]', bg: 'bg-[#ffe066]/10', icon: <AlertTriangle size={40} className="drop-shadow-[0_0_10px_rgba(255,224,102,0.8)]" /> },
    info: { color: 'text-[#7ecfff]', border: 'border-[#7ecfff]/50', glow: 'shadow-[0_0_20px_rgba(126,207,255,0.3)]', bg: 'bg-[#7ecfff]/10', icon: <Info size={40} className="drop-shadow-[0_0_10px_rgba(126,207,255,0.8)]" /> },
    senior: { color: 'text-[#d966ff]', border: 'border-[#d966ff]/50', glow: 'shadow-[0_0_20px_rgba(217,102,255,0.3)]', bg: 'bg-[#d966ff]/10', icon: <Info size={40} className="drop-shadow-[0_0_10px_rgba(217,102,255,0.8)]" /> },
    junior: { color: 'text-[#99eedd]', border: 'border-[#99eedd]/50', glow: 'shadow-[0_0_20px_rgba(153,238,221,0.3)]', bg: 'bg-[#99eedd]/10', icon: <Info size={40} className="drop-shadow-[0_0_10px_rgba(153,238,221,0.8)]" /> }
  };

  const current = configs[type] || configs.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#060412]/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 10 }} 
            transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
            className={`bg-[#08050f]/95 border border-white/10 border-t-[4px] ${current.border.replace('/50', '')} p-1 rounded-2xl max-w-md w-full relative ${current.glow} overflow-hidden`} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Cyberpunk Grid/Scanline simulation */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 md:p-8 relative z-10 border border-white/5">
              
              {/* Close Button (Hidden if it requires strict confirmation) */}
              {!onConfirm && (
                  <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10">
                    <X size={18} />
                  </button>
              )}

              <div className="flex flex-col items-center text-center font-['Orbitron']">
                
                <motion.div 
                  initial={{ rotate: -15, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                  className={`${current.color} mb-4 bg-white/5 p-4 rounded-full border border-white/10`}
                >
                  {current.icon}
                </motion.div>

                <h3 className={`${current.color} mb-4 font-bold tracking-[0.2em] uppercase text-xl flex flex-col items-center justify-center gap-2`}>
                  <span className="opacity-50 text-[10px] tracking-[0.3em] font-mono">SYS.MSG //</span> 
                  <span className="text-center leading-tight">{title || type.toUpperCase()}</span>
                </h3>

                {message && (
                  <p className="text-sm text-gray-300 mb-6 font-['Rajdhani'] leading-relaxed tracking-wide px-2">
                    {message}
                  </p>
                )}

                {/* Content Slot for advanced components in the future */}
                {children && (
                  <div className="w-full mb-6">
                    {children}
                  </div>
                )}

                <div className="flex w-full gap-4 mt-2">
                  {onConfirm && (
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-all text-gray-400 hover:text-white tracking-[0.15em] font-bold active:scale-95">
                      {cancelText}
                    </button>
                  )}
                  
                  <button
                    onClick={onConfirm ? onConfirm : onClose}
                    className={`flex-1 py-3 ${current.bg} border ${current.border} rounded-xl text-xs ${current.color} hover:bg-opacity-30 transition-all font-bold tracking-[0.15em] active:scale-95 relative overflow-hidden group`}
                  >
                    <span className="relative z-10">{onConfirm ? confirmText : 'ACKNOWLEDGE'}</span>
                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 ${current.bg} opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300`}></div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SystemAlert;