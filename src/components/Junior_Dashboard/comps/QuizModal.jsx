import React, { useEffect, useState } from 'react';
import { X, CheckCircle, RefreshCw, Target, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizModal = ({ 
 isOpen, onClose, quizState, startQuiz, randomizedBank, 
 selectedOption, isAnswerCorrect, handleAnswer 
}) => {
 const [showExitConfirm, setShowExitConfirm] = useState(false);

 useEffect(() => {
 if (!isOpen) {
 setShowExitConfirm(false);
 }
 }, [isOpen]);

 const handleCloseRequest = () => {
 if (quizState.step === 'playing') {
 setShowExitConfirm(true);
 } else {
 onClose();
 }
 };

 useEffect(() => {
 const handleEsc = (e) => {
 if (e.key === 'Escape') {
 if (showExitConfirm) {
 setShowExitConfirm(false);
 } else {
 handleCloseRequest();
 }
 }
 };
 if (isOpen) window.addEventListener('keydown', handleEsc);
 return () => window.removeEventListener('keydown', handleEsc);
 }, [isOpen, quizState.step, showExitConfirm]);

 if (!isOpen) return null;

 // คำนวณ Progress (10 ข้อ)
 const progress = ((quizState.currentIndex + 1) / 10) * 100;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-['Rajdhani']">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.2 }}
 className="bg-[#1e1e1e] w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative"
 >
 
 {/* Header */}
 <div className="bg-[#2d2d2d] h-8 flex items-center px-4 relative border-b border-black/50">
 <div className="flex gap-2">
 <button onClick={handleCloseRequest} className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center group">
 <X size={8} className="opacity-0 group-hover:opacity-100 text-[#4c0000]" />
 </button>
 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
 <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
 </div>
 <span className="absolute left-1/2 -translate-x-1/2 text-[10px] text-gray-400 tracking-widest">DECRYPTION_PROTOCOL.exe</span>
 </div>

 {/* Progress Bar (Interactive เพิ่มเติม) */}
 {quizState.step === 'playing' && (
 <div className="w-full h-1 bg-black">
 <div className="h-full bg-[#99eedd] transition-all duration-500" style={{ width: `${progress}%` }}></div>
 </div>
 )}

 <div className="bg-[#0a0616] p-6 relative min-h-[400px]">
 {quizState.step === 'playing' && (
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
 className="w-full flex flex-col h-full mt-2"
 >
 <div className="flex justify-between items-center mb-6">
 <span className="text-[#99eedd] font-bold tracking-widest uppercase text-sm md:text-base">TECHNO QUIZ</span>
 <span className="text-gray-500 text-sm md:text-base">{quizState.currentIndex + 1}/10</span>
 </div>
 
 <motion.div 
 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
 className="bg-[#05020a] border border-white/5 rounded-2xl p-6 mb-6 shadow-inner"
 >
 <span className="text-white text-lg font-medium leading-relaxed">
 {randomizedBank[quizState.currentIndex]?.q || randomizedBank[quizState.currentIndex]?.question}
 </span>
 </motion.div>
 
 <div className="grid grid-cols-1 gap-3">
 {(() => {
 let opts = randomizedBank[quizState.currentIndex]?.options;
 if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch(e) { opts = []; } }
 return (opts || []).map((opt, idx) => {
 let btnStyle ="bg-[#1f1238] border-[#3f2168] text-white hover:border-[#99eedd] hover:bg-[#2d1b4e]";
 if (selectedOption !== null) {
 btnStyle = (opt === selectedOption) 
 ? (isAnswerCorrect ?"bg-green-500/20 border-green-500 text-green-400" :"bg-red-500/20 border-red-500 text-red-400")
 :"opacity-30 cursor-not-allowed";
 }
 return (
 <motion.button 
 key={idx} disabled={selectedOption !== null} onClick={() => handleAnswer(opt)} 
 animate={selectedOption === opt && isAnswerCorrect === false ? { x: [-5, 5, -5, 5, 0] } : {}}
 transition={{ duration: 0.4 }}
 className={`border p-3 rounded-xl transition-all text-sm md:text-base font-bold tracking-wider shadow-md ${btnStyle}`}
 >
 {opt}
 </motion.button>
 );
 });
 })()}
 </div>
 </motion.div>
 )}

 {/* ... (Result step คงเดิม) ... */}
 {quizState.step === 'result' && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6 text-center py-6">
 {quizState.score >= 7 ? (
 <>
 <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}><CheckCircle size={64} className="text-[#99eedd] mx-auto" /></motion.div>
 <h2 className="text-2xl font-bold text-[#99eedd] font-['Orbitron']">ACCESS GRANTED</h2>
 <p className="text-lg text-white">คุณทำได้ {quizState.score} / 10 คะแนน</p>
 <button onClick={onClose} className="bg-[#1c2431] border border-[#2a303c] text-[#99eedd] w-full py-3 rounded-xl hover:bg-[#2a303c] transition-all font-bold">กลับสู่หน้าหลัก</button>
 </>
 ) : (
 <>
 <motion.div animate={{ x: [-5, 5, -5, 5, 0] }} transition={{ duration: 0.4 }}><X size={64} className="text-red-500 mx-auto" /></motion.div>
 <h2 className="text-2xl font-bold text-red-500 font-['Orbitron']">ACCESS DENIED</h2>
 <p className="text-lg text-white">คุณทำได้ {quizState.score} / 10 คะแนน</p>
 <div className="flex gap-3 mt-6">
 <button onClick={startQuiz} className="flex-1 bg-[#1f1238] border border-[#3f2168] text-white py-3 rounded-xl hover:bg-[#2d1b4e] transition-all font-bold flex items-center justify-center gap-2"><RefreshCw size={16}/> ลองใหม่</button>
 <button onClick={onClose} className="flex-1 bg-[#1c2431] border border-[#2a303c] text-gray-400 py-3 rounded-xl hover:bg-[#2a303c] transition-all font-bold">ออก</button>
 </div>
 </>
 )}
 </motion.div>
 )}
 </div>

 {/* Exit Confirmation Overlay */}
 <AnimatePresence>
 {showExitConfirm && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
 >
 <motion.div
 initial={{ scale: 0.9, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.9, y: 20 }}
 className="bg-[#1a0f2e] border border-red-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)] max-w-sm w-full"
 >
 <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
 <h3 className="text-white text-xl font-bold mb-2 font-['Orbitron'] tracking-wider">WARNING!</h3>
 <p className="text-gray-300 text-sm mb-6 leading-relaxed">
 หากกดยกเลิกตอนนี้ คุณจะต้องกลับมาเริ่มทำแบบทดสอบใหม่ <strong className="text-red-400">"ในวันพรุ่งนี้"</strong> ยืนยันที่จะออกหรือไม่?
 </p>
 <div className="flex gap-3 w-full">
 <button 
 onClick={onClose}
 className="flex-1 py-3 bg-gray-500/20 border border-gray-500/50 text-gray-300 rounded-xl hover:bg-gray-500/30 transition-colors font-bold tracking-widest text-sm"
 >
 EXIT
 </button>
 <button 
 onClick={() => setShowExitConfirm(false)}
 className="flex-1 py-3 bg-red-500/20 border border-red-500 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors font-bold tracking-widest text-sm"
 >
 BACK
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 </motion.div>
 </div>
 );
};

export default QuizModal;