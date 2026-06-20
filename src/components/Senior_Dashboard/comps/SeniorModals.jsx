import React from 'react';
import { X, MessageSquare, Clock, Clipboard, User } from 'lucide-react'; // 1. เพิ่ม User icon

// Modal สำหรับ Inbox
export const InboxModal = ({ isOpen, onClose, realMessages, getDefaultAvatar, formatTime }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#08050f] border border-[#7eb8ff] p-8 rounded-3xl max-w-4xl w-full relative flex flex-col max-h-[85vh] min-h-[60vh]" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
            <X size={28} />
        </button>
        
        <h3 className="text-[#7eb8ff] mb-6 font-bold tracking-widest uppercase flex items-center gap-3 text-xl">
            <MessageSquare size={24}/> INBOX_LOGS
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {realMessages.length === 0 && <p className="text-gray-500 text-center mt-10">NO TRANSMISSIONS YET</p>}
            {realMessages.map((msg) => (
            <div key={`full-${msg.id}`} className="flex items-start gap-5 bg-white/5 border border-white/10 rounded-2xl p-6">
                {/* 2. ปรับการแสดงผลรูป Profile ให้รองรับการ Error */}
                <div className="w-14 h-14 rounded-full border border-white/20 overflow-hidden bg-[#08050f] flex items-center justify-center flex-shrink-0">
                    {msg.avatar_url ? (
                        <img 
                            src={msg.avatar_url} 
                            className="w-full h-full object-cover" 
                            alt="sender"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center bg-slate-800 ${msg.avatar_url ? 'hidden' : 'flex'}`}>
                        <User size={28} className="text-gray-400" />
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[#7eb8ff] tracking-widest font-bold font-['Chakra_Petch']">{msg.display_name}</span>
                        <span className="text-xs text-gray-400 font-['Chakra_Petch'] flex items-center gap-1.5">
                            <Clock size={14} /> {formatTime(msg.created_at)}
                        </span>
                    </div>
                    <p className="text-base text-gray-200 font-['Chakra_Petch'] leading-relaxed">
                        {msg.message}
                    </p>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Modal สำหรับแสดงคำใบ้เต็ม (ส่วนนี้ยังใช้ดีไซน์เดิมได้เลยครับ)
export const ClueModal = ({ isOpen, content, onClose, notify }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#08050f] border border-[#d966ff] p-8 rounded-2xl max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X /></button>
        <h3 className="text-[#d966ff] mb-4 font-bold tracking-widest uppercase">FULL_CLUE_DATA</h3>
        <p className="text-sm text-gray-300 break-all mb-6 font-['Rajdhani'] leading-relaxed">{content}</p>
        <button className="w-full py-3 bg-[#d966ff]/20 border border-[#d966ff] rounded-lg text-sm hover:bg-[#d966ff]/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                onClick={() => { navigator.clipboard.writeText(content); notify("SYSTEM: Copied to clipboard!"); }}>
          <Clipboard size={16} /> COPY TO CLIPBOARD
        </button>
      </div>
    </div>
  );
};