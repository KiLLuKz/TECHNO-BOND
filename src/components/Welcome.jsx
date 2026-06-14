// src/components/Welcome.jsx
import React, { useState } from 'react';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // 1. Import supabase มาเพื่อเช็ค Session

const CyberButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="
      cursor-pointer font-bold relative text-[16px] w-[14em] h-[3.5em] text-center text-white
      bg-gradient-to-br from-[#7e22ce] via-[#3b82f6] to-[#2dd4bf]
      bg-[length:400%] rounded-[30px] z-10 
      drop-shadow-[0_0_10px_rgba(126,34,206,0.5)] 
      hover:animate-gradient-xy hover:bg-[length:100%]
      transition-all duration-300
      before:content-[''] before:absolute before:-top-[2px] before:-bottom-[2px] before:-left-[2px] before:-right-[2px] 
      before:bg-gradient-to-br before:from-[#7e22ce] before:via-[#3b82f6] before:to-[#2dd4bf]
      before:bg-[length:400%] before:-z-10 before:rounded-[32px] 
      before:opacity-0 hover:before:opacity-100 before:blur-[15px] before:transition-all before:duration-500
      active:scale-95 active:brightness-125 hover:-translate-y-[2px]
    "
  >
    {text}
  </button>
);

const Welcome = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const navigate = useNavigate();

    const handleEnter = async () => {
        setIsConnecting(true); 
        
        // 2. เช็ค Session ปัจจุบัน
        const { data: { session } } = await supabase.auth.getSession();
        
        setTimeout(() => { 
            // 3. ถ้ามี session ให้ไป dashboard, ถ้าไม่มีให้ไป verify
            if (session) {
                navigate('/dashboard');
            } else {
                navigate('/verify');
            }
        }, 2500); 
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-x-hidden">
        {isConnecting && <Loader text="CONNECTING" />}
        
        <h1 className="flex flex-col items-center mb-14 font-['Orbitron'] w-full">
            <span className="text-glow text-7xl md:text-[9rem] font-black text-transparent bg-clip-text mb-2 
                 bg-gradient-to-br from-[#7e22ce] from-10% via-[#3b82f6] via-50% to-[#2dd4bf] to-90% 
                 drop-shadow-[0_0_15px_rgba(126,34,206,0.3)]">
                CLUE
            </span>
            <span className="text-glow text-xl md:text-[2.75rem] tracking-[0.75em] text-[#7eb8ff] ml-[0.7em]">
                SYSTEM
            </span>
            <span className="mt-4 text-[10px] md:text-sm text-slate-400 tracking-[0.4em] uppercase font-['Rajdhani'] font-medium animate__animated animate__fadeIn animate__delay-1s">
                Welcome to Techno Bond - Senior & Junior
            </span>
        </h1>
        
        <CyberButton text="ENTER SYSTEM" onClick={handleEnter} />
        </div>
    );
};

export default Welcome;