import React from 'react';
import { Target, CheckCircle, Lock } from 'lucide-react';

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
    <div className="lg:col-span-2 bg-[#08050f]/60 backdrop-blur-xl border border-[#d966ff]/20 rounded-[20px] p-6 shadow-xl flex flex-col relative overflow-hidden">
      {isGameCleared && (
         <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate__animated animate__fadeIn">
             <CheckCircle size={48} className="text-green-400 mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
             <h2 className="text-2xl font-bold text-green-400 tracking-widest uppercase">CORRECT GUESS</h2>
             <p className="text-white text-sm font-['Rajdhani']">ยินดีด้วย! คุณตามหาพี่รหัสพบแล้ว</p>
         </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h2 className="text-[#d966ff] font-bold tracking-widest text-lg uppercase font-['Orbitron'] flex items-center gap-2">
            <Target size={18} /> GUESS MODE
        </h2>
        <span className="text-white font-bold text-l font-['Chakra Petch']">ทายสายรหัส</span>
      </div>
      <p className="text-xl text-gray-400 mb-4 font-['Chakra Petch'] leading-relaxed">
        พิมพ์ชื่อของพี่ ๆ โดยขึ้นต้นด้วยคำว่า พี่ ตามด้วยชื่อในโน้ต เช่น พี่ซัน หากมีชื่อซ้ำ ให้เว้น 1 ครั้ง แล้วใส่วงเล็บพร้อมเลขที่ของพี่คนที่ต้องการ เช่น พี่วิน (1)
      </p>

      <div className="flex gap-3 mt-auto relative z-0">
        <input 
            className="flex-1 bg-black/40 border border-[#2a303c] rounded-xl p-3 text-l focus:outline-none focus:border-[#d966ff]/50 transition-colors text-white disabled:opacity-50 font-['Chakra Petch']" 
            placeholder={canGuess ? "พิมพ์ชื่อพี่ที่คิดว่าใช่" : "ระบบปิดรับการทายชั่วคราว... ลองเดาใหม่วันพรุ่งนี้น้าา"} 
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            disabled={!canGuess}
        />
        <button 
            onClick={handleGuessSubmit}
            disabled={!canGuess}
            className="bg-[#1c2431] border border-[#2a303c] text-white px-8 py-2 rounded-xl hover:bg-[#2a303c] transition-all font-bold tracking-wider active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-['Rajdhani']"
        >
            ทาย
        </button>
      </div>

      {/* Feedback Display */}
      {guessFeedback && !isGameCleared && (
         <div className="mt-4 pt-3 border-t border-white/5 animate__animated animate__fadeIn">
             <p className="text-[16px] text-[#99eedd] font-['Rajdhani'] italic">
                " {guessFeedback} "
             </p>
         </div>
      )}

      {/* Timer Display - แยกออกมาให้แสดงผลได้อิสระ */}
      {!canGuess && nextGuessDate && (
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[14px] text-red-400 font-['Chakra Petch'] flex items-center gap-1 animate__animated animate__fadeIn">
                <Lock size={10} /> กดทายได้อีกครั้งวันที่: {nextGuessDate.toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </p>
          </div>
      )}
    </div>
  );
};

export default GuessPanel;