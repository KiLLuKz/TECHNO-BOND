import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, CheckCircle2 } from 'lucide-react';
import { GAME_TARGETS } from '../../../hooks/useGameProgress';
import { GameProgressSkeleton } from '../../common/Skeletons';

const GameProgressPanel = ({ gameProgress }) => {
  const { progress, loading, isAllGamesPassed } = gameProgress;

  if (loading) return <GameProgressSkeleton />;

  const games = [
    { id: 'block-blast', title: 'BLOCK BLAST', target: GAME_TARGETS['block-blast'], color: '#d966ff' },
    { id: 'flappy_drone', title: 'FLAPPY DRONE', target: GAME_TARGETS['flappy_drone'], color: '#7ecfff' },
    { id: 'shoot-em-up', title: 'SHOOT EM UP', target: GAME_TARGETS['shoot-em-up'], color: '#ffe066' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full bg-[#08050f]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl mt-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7ecfff]/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-['Orbitron'] font-bold text-[#99eedd] text-lg md:text-xl flex items-center gap-3">
          <Gamepad2 size={24} className="text-[#ffe066]" />
          CLUE 3 UNLOCK PROGRESS
        </h3>
        {isAllGamesPassed && (
          <span className="flex items-center gap-1.5 text-xs md:text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            <CheckCircle2 size={16} /> COMPLETED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {games.map(game => {
          const currentScore = progress[game.id] || 0;
          const percent = Math.min((currentScore / game.target) * 100, 100);
          const isPassed = currentScore >= game.target;

          return (
            <div key={game.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
              {isPassed && <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>}
              
              <div className="flex justify-between mb-2">
                <span className="font-['Rajdhani'] font-bold text-gray-300 group-hover:text-white transition-colors uppercase">
                  {game.title}
                </span>
                <span className="text-xs text-gray-500 font-bold">
                  <span className={isPassed ? "text-green-400" : "text-white"}>{currentScore.toLocaleString()}</span> / {game.target.toLocaleString()}
                </span>
              </div>
              
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full relative"
                  style={{ backgroundColor: isPassed ? '#4ade80' : game.color }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GameProgressPanel;
