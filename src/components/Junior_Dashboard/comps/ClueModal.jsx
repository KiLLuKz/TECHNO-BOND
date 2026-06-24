import React, { useEffect } from 'react';
import { X, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';

const ClueModal = ({ isOpen, content, onClose, notify }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-[#08050f]/80 backdrop-blur-xl border border-[#d966ff]/50 p-8 rounded-2xl max-w-lg w-full relative shadow-[0_0_30px_rgba(217,102,255,0.2)]" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X /></button>
        <h3 className="text-[#d966ff] mb-4 font-bold tracking-widest uppercase">DECRYPTED_DATA</h3>
        <p className="text-sm text-gray-300 break-all mb-6 font-['Rajdhani'] leading-relaxed">{content}</p>
        <button className="w-full py-3 bg-[#d966ff]/20 border border-[#d966ff] rounded-lg text-sm hover:bg-[#d966ff]/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                onClick={() => { navigator.clipboard.writeText(content); notify("SYSTEM: Copied to clipboard!"); }}>
            <Clipboard size={16} /> COPY TO CLIPBOARD
        </button>
      </motion.div>
    </div>
  );
};

export default ClueModal;