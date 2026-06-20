import React from 'react';
import { motion } from 'framer-motion';

const StatusBox = ({ username, role, level = 12, exp = 450, maxExp = 1000, color = "#99eedd" }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (exp / maxExp) * circumference;

    return (
        <div className="bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col items-center justify-center h-full relative overflow-hidden">
            <h3 className="text-white/50 tracking-widest font-bold text-[10px] absolute top-4 left-4">SYSTEM STATUS</h3>
            
            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-[${color}]/5 blur-[50px] rounded-full`}></div>
            
            <div className="flex flex-col items-center mt-4">
                {/* Circular EXP Bar */}
                <div className="relative flex items-center justify-center mb-4">
                    <svg className="transform -rotate-90 w-32 h-32 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        {/* Background track */}
                        <circle 
                            cx="64" cy="64" r={radius} 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeWidth="8" 
                            fill="transparent" 
                        />
                        {/* Progress circle */}
                        <motion.circle 
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="64" cy="64" r={radius} 
                            stroke={color} 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
                        />
                    </svg>
                    
                    {/* Level Text in Center */}
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest leading-none mb-1 font-['Orbitron']">LV</span>
                        <span className="text-3xl font-bold leading-none font-['Orbitron']" style={{ color: color }}>{level}</span>
                    </div>
                </div>

                {/* EXP Text */}
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-4">
                    EXP: <span className="text-white/80">{exp}</span> / {maxExp}
                </div>

                {/* Role & Username Box */}
                <div className="flex flex-col items-center w-full bg-black/40 border border-white/5 rounded-xl p-3">
                    <div 
                        className="text-[9px] tracking-[0.2em] px-2 py-1 rounded border font-bold mb-2 font-['Orbitron']"
                        style={{ 
                            color: color, 
                            borderColor: `${color}40`,
                            backgroundColor: `${color}10` 
                        }}
                    >
                        {role || 'UNKNOWN'}
                    </div>
                    <span className="text-[#f0eaff] text-sm font-bold tracking-wider font-['Rajdhani'] truncate w-full text-center">
                        {username || 'USER_NOT_FOUND'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatusBox;
