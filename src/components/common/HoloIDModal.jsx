import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import HoloIDCard from './HoloIDCard';

const HoloIDModal = ({ isOpen, onClose, profile, exp, role }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!profile) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-sm md:max-w-2xl flex flex-col items-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white bg-black/50 hover:bg-[#7ecfff]/20 rounded-full border border-white/10 hover:border-[#7ecfff] transition-all"
            >
              <X size={20} />
            </button>

            {/* The ID Card */}
            <HoloIDCard 
              profile={profile} 
              exp={exp} 
              role={role} 
              isEditable={false} // View-only mode
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default HoloIDModal;
