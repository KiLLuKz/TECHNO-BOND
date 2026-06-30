import React from 'react';
import { Target, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const GuessPanel = ({ 
 isGameCleared, 
 canGuess, 
 guessInput, 
 setGuessInput, 
 handleGuessSubmit, 
 guessFeedback, 
 nextGuessDate 
}) => {
 return (
 <div className="h-full lg:col-span-2 bg-[#08050f]/60 backdrop-blur-xl border border-[#d966ff]/20 rounded-[20px] p-6 shadow-xl flex flex-col relative overflow-hidden">
 {isGameCleared && (
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
 className="absolute inset-0 bg-green-500/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
 >
 <CheckCircle size={48} className="text-green-400 mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
 <h2 className="font-['Orbitron'] text-2xl font-bold text-green-400 tracking-widest uppercase">CORRECT GUESS</h2>
 <p className="text-white text-sm md:text-base font-['Rajdhani']">ยินดีด้วย! คุณตามหาพี่รหัสพบแล้ว</p>
 </motion.div>
 )}

 <div className="flex justify-between items-start mb-4">
 <h2 className="text-[#d966ff] font-bold tracking-widest text-lg uppercase font-['Orbitron'] flex items-center gap-2">
 <Target size={18} /> GUESS MODE
 </h2>
 <span className="text-white font-bold text-sm md:text-base md:text-l">ทายสายรหัส</span>
 </div>
 
 <p className="text-lg md:text-xl text-gray-400 mb-4 leading-relaxed break-words">
 พิมพ์ชื่อของพี่ ๆ โดยขึ้นต้นด้วยคำว่า พี่ ตามด้วยชื่อในโน้ต เช่น พี่ซัน หากมีชื่อซ้ำ ให้เว้น 1 ครั้ง แล้วใส่วงเล็บพร้อมเลขที่ของพี่คนที่ต้องการ เช่น พี่วิน (1)
 </p>

 <div className="flex gap-3 mt-auto relative z-0">
 <input 
 className="flex-1 bg-black/40 border border-[#2a303c] rounded-xl p-3 text-sm md:text-base md:text-l focus:outline-none focus:border-[#d966ff]/50 transition-colors text-white disabled:opacity-50" 
 // จุดที่แก้: เปลี่ยน placeholder เมื่อติด Cooldown
 placeholder={canGuess ?"พิมพ์ชื่อพี่ที่คิดว่าใช่" :"ทายใหม่พรุ่งนี้นะ..."} 
 value={guessInput}
 onChange={(e) => setGuessInput(e.target.value)}
 disabled={!canGuess}
 />
 <button 
 onClick={handleGuessSubmit}
 disabled={!canGuess}
 className="bg-[#1c2431] border border-[#2a303c] text-white px-6 md:px-8 py-2 rounded-xl hover:bg-[#2a303c] transition-all font-bold tracking-wider active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-['Rajdhani']"
 >
 ทาย
 </button>
 </div>

 {guessFeedback && !isGameCleared && (
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
 className="mt-4 pt-3 border-t border-white/5"
 >
 <p className="text-sm md:text-base md:text-[16px] text-[#99eedd] font-['Rajdhani'] italic break-words">
" {guessFeedback}"
 </p>
 </motion.div>
 )}

 {/* Timer Display */}
 {!canGuess && nextGuessDate && (
 <div className="mt-2 pt-2 border-t border-white/5">
 <motion.p 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
 className="text-[13px] md:text-[14px] text-red-400 flex items-center gap-1"
 >
 <Lock size={10} /> 
 {/* จุดที่แก้: ปรับคำอธิบายให้กระชับเข้ากับ placeholder */}
 ระบบล็อค จนถึงวันที่: {nextGuessDate.toLocaleDateString('th-TH', { 
 year: 'numeric', 
 month: 'long', 
 day: 'numeric' 
 })}
 </motion.p>
 </div>
 )}
 </div>
 );
};

export default GuessPanel;