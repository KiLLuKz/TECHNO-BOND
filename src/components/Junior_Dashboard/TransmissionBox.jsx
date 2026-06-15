import React from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

const TransmissionBox = ({ 
    messagesLeft, 
    messageText, 
    setMessageText, 
    isSending, 
    handleSendMessage,
    hasSeniorEmail
}) => {
  return (
    // เพิ่ม h-full และ flex flex-col เพื่อให้กล่องยืดเต็มช่อง Grid
    <div className="bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col h-full animate__animated animate__fadeIn">
      
      <h2 className="flex items-center gap-2 text-[#7eb8ff] mb-4 font-bold tracking-widest">
        <MessageSquare size={18} /> TRANSMISSION
      </h2>

      {/* เพิ่ม flex-1 เพื่อให้ textarea ยืดหยุ่นตามความสูงของกล่อง */}
      <textarea 
        className="flex-1 font-['Chakra_Petch'] w-full min-h-[100px] bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:outline-none mb-3 resize-none transition-all focus:border-[#7eb8ff]/50" 
        placeholder={messagesLeft > 0 ? "ส่งข้อความถึงพี่รหัส..." : "หมดโควต้าของวันนี้แล้ว รีเซตโควต้า ตอนเที่ยงคืนนะครับ/ค่ะ"}
        value={messageText} 
        onChange={(e) => setMessageText(e.target.value)} 
        disabled={messagesLeft <= 0 || !hasSeniorEmail || isSending}
      />
      
      {/* ส่วนนี้จะถูกดันลงล่างสุดโดยอัตโนมัติด้วย flex-col */}
      <button 
        onClick={handleSendMessage} 
        disabled={messagesLeft <= 0 || isSending || !hasSeniorEmail} 
        className={`w-full py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-all active:scale-95 
            ${isSending ? 'animate__animated animate__pulse animate__infinite' : ''} 
            ${messagesLeft > 0 && hasSeniorEmail ? 'bg-[#7eb8ff]/20 border border-[#7eb8ff]/50 hover:bg-[#7eb8ff]/40' : 'bg-gray-800 border border-gray-600 text-gray-500 cursor-not-allowed'}`}
      >
        {isSending ? (
            <Loader2 size={14} className="animate-spin" />
        ) : (
            <Send size={14} />
        )}
        {messagesLeft <= 0 ? 'LIMIT REACHED' : isSending ? 'TRANSMITTING...' : `SEND (${messagesLeft}/3)`}
      </button>
    </div>
  );
};

export default TransmissionBox;