import React from 'react';
import { CheckCircle } from 'lucide-react';

const BonusPanel = ({ isQuizPassed, startQuiz }) => {
  return (
    // เพิ่ม h-full เข้าไปใน classหลัก เพื่อให้ยืดเต็มช่อง Grid
    <div className="bg-[#08050f]/60 backdrop-blur-xl border border-[#99eedd]/20 rounded-[20px] p-6 shadow-xl flex flex-col h-full">
      <h2 className="text-[#99eedd] font-bold tracking-widest text-lg mb-4 uppercase font-['Orbitron']">BONUS ROUND</h2>
      
      {/* ส่วนเนื้อหา */}
      <p className="text-white text-base mb-6 font-['Chakra_Petch'] text-xl leading-relaxed">
        อยากได้คำใบ้ที่สองต้องผ่านด่าน 7 จาก 10 ก่อนนะวัยรุ่น
      </p>
      
      {/* ใส่ mt-auto เพื่อดันปุ่มหรือสถานะลงมาด้านล่างสุดของกล่อง */}
      <div className="mt-auto">
        {isQuizPassed ? (
          <div className="w-full py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center font-bold tracking-widest flex items-center justify-center gap-2">
              <CheckCircle size={18} /> PASSED_GRANTED
          </div>
        ) : (
          <button 
              onClick={startQuiz} 
              className="bg-[#1c2431] border border-[#2a303c] text-[#99eedd] w-full py-3 rounded-xl hover:bg-[#2a303c] transition-all font-bold tracking-widest active:scale-95 font-['Rajdhani']"
          >
              ไปหน้า Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default BonusPanel;