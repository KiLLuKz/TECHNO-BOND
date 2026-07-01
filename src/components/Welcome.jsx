import React, { useState } from 'react';
import Loader from './Loader';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import Curriculum from './Curriculum';

// คอมโพเนนต์ปุ่มสไตล์ TECHNO GEN 8
const ExploreButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="
      cursor-pointer relative z-10 font-bold text-sm md:text-base tracking-[0.2em] uppercase
      text-[#99eedd] px-10 py-4 rounded-full transition-all duration-300 active:scale-95
      bg-transparent border-2 border-[#99eedd]
      shadow-[0_0_15px_rgba(153,238,221,0.4)]
      hover:bg-[#99eedd] hover:text-[#060412] hover:shadow-[0_0_25px_rgba(153,238,221,0.7)]
      hover:-translate-y-0.5
    "
  >
    {text}
  </button>
);

const Welcome = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash === '#curriculum-section') {
      const element = document.getElementById('curriculum-section');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const handleEnter = async () => {
    setIsConnecting(true);

    // เช็ค Session ปัจจุบัน
    const { data: { session } } = await supabase.auth.getSession();

    setTimeout(() => {
      if (session) {
        navigate('/dashboard');
      } else {
        navigate('/verify');
      }
    }, 500);
  };

  return (
    // ไม่มี bg เพื่อให้ Background.jsx รันทะลุไปถึง Curriculum ได้
    <div className="relative w-full font-['Inter', sans-serif] flex flex-col bg-transparent">
      
      {isConnecting && <Loader text="CONNECTING" />}

      {/* --- ส่วน Hero (Welcome) --- */}
      <section className="relative w-full min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden">
        {/* ใช้ absolute เพื่อให้วิดีโออยู่เฉพาะใน section นี้ */}
        <div className="absolute inset-0 z-0 bg-[#060412]">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/videos/Hero.mp4" type="video/mp4" />
          </video>
          
          {/* แผ่นสีดำโปร่งแสงปรับลดเพื่อรักษามิติ */}
          <div className="absolute inset-0 bg-black/55"></div>
          
          {/* เพิ่ม Gradient สีม่วงจากล่างขึ้นบน */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#41086D]/40 via-[#4f2ec3]/20 to-transparent"></div>
          
          {/* เส้น Grid Lines */}
          <div className="hero-grid-lines absolute inset-0 opacity-20"></div>
        </div>

        {/* --- ส่วนเนื้อหา (Content) --- */}
        <main className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-4 py-12 md:px-12 max-w-5xl mx-auto box-border">
          
          {/* คำคมด้านบน */}
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-[#99eedd] text-xs md:text-sm md:text-base tracking-[0.4em] font-bold mb-4 uppercase drop-shadow-[0_0_8px_rgba(153,238,221,0.5)]"
          >
            " NOT HOPING TO WIN, BUT NEVER LOST"
          </motion.p>

          {/* หัวข้อหลัก */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="font-['Orbitron'] text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-6 uppercase bg-clip-text text-transparent select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
            style={{ 
              backgroundImage: 'linear-gradient(to bottom, #ffffff 65%, #4f2ec3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            <span className="block whitespace-nowrap">TECHNOLOGY</span>
            <span className="block whitespace-nowrap mt-1 md:mt-3">8th GEN</span>
          </motion.h1>

          {/* หัวข้อย่อยแผนการเรียน */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className="text-sm md:text-base sm:text-lg md:text-2xl font-semibold tracking-[0.25em] text-white mb-6 uppercase drop-shadow-md"
          >
            Science · Mathematics · Technology
          </motion.p>

          {/* รายละเอียดภาษาไทย */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="text-sm md:text-base lg:text-lg text-gray-300 max-w-xl leading-relaxed mb-10 font-light px-2 break-keep drop-shadow-sm"
          >
            ก้าวย่างที่มั่นคงของรุ่นที่ 8 แห่งรั้วบางปะกอกวิทยาคม <br className="hidden sm:inline"/> 
            สืบทอดจิตวิญญาณแห่งนวัตกรรมและการสร้างสรรค์
          </motion.p>

          {/* ปุ่ม Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7, ease: "easeOut" }}
          >
            <ExploreButton text="ENTER SYSTEM" onClick={handleEnter} />
          </motion.div>

        </main>
      </section>

      {/* --- Marquee Separator --- */}
      <div className="relative w-full overflow-hidden bg-[#a855f7] py-3 border-y-2 border-[#c084fc] z-20 flex items-center shadow-[0_0_20px_rgba(168,85,247,0.5)] whitespace-nowrap">
        <div className="animate-marquee flex">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="text-[#060412] font-['Orbitron'] font-black text-xl md:text-2xl tracking-[0.3em] mx-6 flex items-center gap-6">
              TECHNOLOGY 8TH GEN <span className="opacity-50">///</span>
            </span>
          ))}
        </div>
      </div>

      {/* Curriculum Section Appended */}
      {/* bg-transparent เพื่อให้พื้นหลัง Background.jsx ของแอพปรากฏ */}
      <div id="curriculum-section" className="relative z-10 w-full bg-transparent">
        <Curriculum />
      </div>

    </div>
  );
};

export default Welcome;
