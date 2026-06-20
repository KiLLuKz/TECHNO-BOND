import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemAlert = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'CONFIRM', cancelText = 'CANCEL' }) => {
  if (!isOpen) return null;

  // ตั้งค่าสีและไอคอนตามประเภทของ Alert
  const configs = {
    success: { color: 'text-[#99eedd]', border: 'border-[#99eedd]', bg: 'bg-[#99eedd]/10', icon: <CheckCircle size={32} /> },
    error: { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10', icon: <XCircle size={32} /> },
    warning: { color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: <AlertTriangle size={32} /> },
    info: { color: 'text-[#7eb8ff]', border: 'border-[#7eb8ff]', bg: 'bg-[#7eb8ff]/10', icon: <Info size={32} /> },
    senior: { color: 'text-[#d966ff]', border: 'border-[#d966ff]', bg: 'bg-[#d966ff]/10', icon: <Info size={32} /> }
  };

  const current = configs[type] || configs.info;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.9 }} 
        transition={{ duration: 0.2, type: 'spring', bounce: 0.4 }}
        className={`bg-[#08050f] border ${current.border} p-6 md:p-8 rounded-2xl max-w-sm w-full relative shadow-[0_0_20px_rgba(0,0,0,0.5)]`} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ปุ่ม (X) ปิดมุมขวาบน (จะซ่อนถ้าเป็นโหมดต้องกด Confirm) */}
        {!onConfirm && (
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
        )}

        <div className="flex flex-col items-center text-center font-['Orbitron']">
          <div className={`${current.color} mb-4 drop-shadow-[0_0_8px_currentColor]`}>
            {current.icon}
          </div>
          <h3 className={`${current.color} mb-2 font-bold tracking-widest uppercase text-lg`}>
            {title || type.toUpperCase()}
          </h3>
          <p className="text-sm text-gray-300 mb-8 font-['Rajdhani'] leading-relaxed">
            {message}
          </p>

          <div className="flex w-full gap-3">
            {/* ถ้าส่ง props onConfirm มา จะมีปุ่ม Cancel ให้ด้วย (เป็น Confirm Dialog) */}
            {onConfirm && (
              <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-all text-gray-300 tracking-widest">
                {cancelText}
              </button>
            )}
            
            {/* ปุ่มตกลงหลัก */}
            <button
              onClick={onConfirm ? onConfirm : onClose}
              className={`flex-1 py-2.5 ${current.bg} border ${current.border} rounded-lg text-xs ${current.color} hover:bg-opacity-30 transition-all font-bold tracking-widest`}
            >
              {onConfirm ? confirmText : 'ACKNOWLEDGE'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SystemAlert;