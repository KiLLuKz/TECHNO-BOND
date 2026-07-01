import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, CheckCircle, Lock } from 'lucide-react';
import { GAME_TARGETS } from '../../../hooks/useGameProgress';

const formatScore = (score) => {
 return new Intl.NumberFormat().format(score || 0);
};

const GameCard = ({ title, current, target, isPassed, icon: Icon, colorClass }) => {
 const progress = Math.min((current / target) * 100, 100) || 0;
 
 return (
 <div className={`relative p-5 rounded-xl border bg-black/40 backdrop-blur-md overflow-hidden ${isPassed ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-white/10'}`}>
 {/* Background Progress Glow */}
 <div 
 className={`absolute top-0 left-0 bottom-0 opacity-10 ${colorClass}`} 
 style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }} 
 />
 
 <div className="relative z-10 flex flex-col h-full justify-between">
 <div className="flex justify-between items-start mb-4">
 <div className="flex items-center gap-2">
 <Icon size={20} className={isPassed ? 'text-green-400' : 'text-gray-400'} />
 <h4 className="font-['Orbitron'] font-bold text-sm md:text-base text-gray-200">{title}</h4>
 </div>
 {isPassed ? (
 <CheckCircle size={20} className="text-green-400" />
 ) : (
 <Lock size={16} className="text-gray-500" />
 )}
 </div>
 
 <div className="space-y-2">
 <div className="flex justify-between text-xs md:text-sm font-mono">
 <span className="text-gray-400">Current</span>
 <span className={isPassed ? 'text-green-400 font-bold' : 'text-white'}>{formatScore(current)}</span>
 </div>
 <div className="flex justify-between text-xs md:text-sm font-mono">
 <span className="text-gray-400">Target</span>
 <span className="text-[#a855f7]">{formatScore(target)}</span>
 </div>
 
 {/* Progress Bar */}
 <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
 <div 
 className={`h-full rounded-full ${isPassed ? 'bg-green-500' : colorClass.replace('bg-', 'bg-').split(' ')[0]}`}
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>
 </div>
 </div>
 );
};

const GameQuestPanel = ({ gameProgress }) => {
 if (!gameProgress) return null;
 
 const { progress, isAllGamesPassed } = gameProgress;

 return (
 <motion.div 
 initial={{ opacity: 0, y: 20 }} 
 animate={{ opacity: 1, y: 0 }} 
 className="w-full mt-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden"
 >
 {/* Background Effects */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7] opacity-[0.03] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#99eedd] opacity-[0.03] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
 
 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
 <div>
 <h3 className="font-['Orbitron'] text-xl md:text-2xl font-bold text-[#c084fc] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
 <Gamepad2 size={24} /> CLUE 3: ARCADIA OVERRIDE
 </h3>
 <p className="text-gray-400 text-xl mt-1">
 ทำคะแนนให้ถึงเกณฑ์เพื่อปลดล็อกคำใบ้ที่ 3!
 </p>
 </div>
 
 {isAllGamesPassed ? (
 <span className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg text-sm font-bold font-['Orbitron'] flex items-center gap-2">
 <CheckCircle size={16} /> UNLOCKED
 </span>
 ) : (
 <span className="px-4 py-2 bg-black/40 text-gray-400 border border-white/10 rounded-lg text-sm font-['Orbitron'] flex items-center gap-2">
 <Lock size={16} /> LOCKED
 </span>
 )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
 <GameCard 
 title="BLOCK BLAST" 
 current={progress['block-blast']} 
 target={GAME_TARGETS['block-blast']} 
 isPassed={progress['block-blast'] >= GAME_TARGETS['block-blast']}
 icon={Gamepad2}
 colorClass="bg-blue-500"
 />
 <GameCard 
 title="FLAPPY DRONE" 
 current={progress['flappy_drone']} 
 target={GAME_TARGETS['flappy_drone']} 
 isPassed={progress['flappy_drone'] >= GAME_TARGETS['flappy_drone']}
 icon={Gamepad2}
 colorClass="bg-yellow-500"
 />
 <GameCard 
 title="SYSTEM DEFENDER" 
 current={progress['shoot-em-up']} 
 target={GAME_TARGETS['shoot-em-up']} 
 isPassed={progress['shoot-em-up'] >= GAME_TARGETS['shoot-em-up']}
 icon={Gamepad2}
 colorClass="bg-purple-500"
 />
 </div>
 </motion.div>
 );
};

export default GameQuestPanel;
