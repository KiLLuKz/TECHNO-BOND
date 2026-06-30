import React from 'react';
import { CheckCircle, Lock } from 'lucide-react'; // เพิ่ม Lock เข้ามา

const BonusPanel = ({ isQuizPassed, startQuiz, canPlayQuiz }) => {
 return (
 <div className="bg-[#08050f]/60 backdrop-blur-xl border border-[#99eedd]/20 rounded-[20px] p-6 shadow-xl flex flex-col h-full">
 <h2 className="text-[#99eedd] font-bold tracking-widest text-lg mb-4 uppercase font-['Orbitron']">BONUS ROUND</h2>
 
 <p className="text-white text-base mb-6 text-xl leading-relaxed">
 {isQuizPassed 
 ?"ทำภารกิจสำเร็จแล้ว! รอรับรางวัลได้เลย"
 :"อยากได้คำใบ้ที่สองต้องผ่านด่าน 7 จาก 10 ก่อนนะวัยรุ่น"
 }
 </p>
 
 <div className="mt-auto">
 {isQuizPassed ? (
 <div className="w-full py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center font-bold tracking-widest flex items-center justify-center gap-2">
 <CheckCircle size={18} /> PASSED_GRANTED
 </div>
 ) : !canPlayQuiz ? (
 // สถานะติด Cooldown
 <div className="w-full py-3 bg-[#1c2431]/50 border border-[#2a303c] rounded-xl text-gray-500 text-center font-bold tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
 <Lock size={18} /> ลองทำใหม่พรุ่งนี้นะ :)
 </div>
 ) : (
 // สถานะพร้อมเล่น
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