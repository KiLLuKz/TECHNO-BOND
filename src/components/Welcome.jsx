// src/components/Welcome.jsx
import React, { useState } from 'react';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// คอมโพเนนต์ปุ่มสไตล์ TECHNO GEN 8 (ปรับเป็นธีมสีม่วง Cyber Purple)
const ExploreButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="
      cursor-pointer relative z-10 font-['Orbitron'] font-bold text-sm md:text-base tracking-[0.2em] uppercase
      text-white px-10 py-4 rounded-full transition-all duration-300 active:scale-95
      bg-transparent border-2 border-[#a855f7]
      shadow-[0_0_15px_rgba(168,85,247,0.4)]
      hover:bg-[#a855f7] hover:text-[#060412] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]
      hover:-translate-y-0.5
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

    // เช็ค Session ปัจจุบัน
    const { data: { session } } = await supabase.auth.getSession();

    setTimeout(() => {
      // ถ้ามี session ให้ไป dashboard, ถ้าไม่มีให้ไป verify
      if (session) {
        navigate('/dashboard');
      } else {
        navigate('/verify');
      }
    }, 2500);
  };

  return (
    // เปลี่ยนโครงสร้างหลักเป็น min-h-screen และ overflow-y-auto เผื่อกรณีจอมือถือแนวนอนสั้น จะได้เลื่อนจอได้ ไม่โดนตัดขาด
    <div className="relative w-full min-h-screen overflow-y-auto bg-[#060412] text-white font-['Inter', sans-serif] flex flex-col justify-center items-center">
      
      {isConnecting && <Loader text="CONNECTING" />}

      {/* --- ส่วน Background (Video + Overlay) --- */}
      {/* ใช้ fixed เพื่อล็อกพื้นหลังวิดีโอไว้กับที่ ไม่ให้เคลื่อนเวลาเลื่อนจอ */}
      <div className="fixed inset-0 z-0 overflow-hidden">
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
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* 🔥 เพิ่ม Gradient สีม่วงจากล่างขึ้นบน (Transparency เบาๆ ทับวิดีโอ) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#41086D]/40 via-[#4f2ec3]/20 to-transparent"></div>
        
        {/* เส้น Grid Lines */}
        <div className="hero-grid-lines absolute inset-0 opacity-20"></div>
      </div>


      {/* --- ส่วนเนื้อหา (Content) --- */}
      {/* ปรับแต่ง padding และจัดระเบียบ layout ให้รองรับทั้งแนวตั้งและแนวนอนอย่างสมบูรณ์ */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen text-center px-4 py-12 md:px-12 max-w-5xl mx-auto box-border">
        
        {/* คำคมด้านบน (ปรับเป็นสีม่วงอ่อน) */}
        <p className="text-[#c084fc] text-xs md:text-sm tracking-[0.4em] font-bold mb-4 uppercase opacity-90 animate__animated animate__fadeIn">
          " NOT HOPING TO WIN, BUT NEVER LOST "
        </p>

        {/* หัวข้อหลักปรับขนาดให้ใหญ่ขึ้นมาก (Fluid Text ตั้งแต่ text-4xl จนถึง lg:text-9xl) */}
        {/* ฝัง Inline Style สำหรับสี Gradient แบบระบุตำแหน่งคัตออฟตามโจทย์ (to bottom, #fff 30%, #4f2ec3) */}
        {/* ใช้ block และ whitespace-nowrap ครอบแต่ละบรรทัดเพื่อบังคับคำไม่ให้แตกกระจัดกระจายเวลาหมุนจอ */}
        <h1 
          className="font-['Orbitron'] text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-6 uppercase bg-clip-text text-transparent select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] animate__animated animate__fadeInDown"
          style={{ 
            backgroundImage: 'linear-gradient(to bottom, #ffffff 65%, #4f2ec3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          <span className="block whitespace-nowrap">TECHNOLOGY</span>
          <span className="block whitespace-nowrap mt-1 md:mt-3">8th GEN</span>
        </h1>

        {/* หัวข้อย่อยแผนการเรียน (ปรับเป็นสีม่วงอ่อน) */}
        <p className="text-sm sm:text-lg md:text-2xl font-semibold tracking-[0.25em] text-[#c084fc] mb-6 uppercase drop-shadow-sm">
          Science · Mathematics · Technology
        </p>

        {/* รายละเอียดภาษาไทย */}
        {/* ใช้ break-keep และกำหนด max-w ให้พอดี เพื่อให้ข้อความภาษาไทยตัดคำสละสลวย ไม่ขาดครึ่งคำในมือถือ */}
        <p className="text-sm md:text-base lg:text-lg text-gray-200 max-w-xl leading-relaxed mb-10 opacity-90 font-light px-2 break-keep">
          ก้าวย่างที่มั่นคงของรุ่นที่ 8 แห่งรั้วบางปะกอกวิทยาคม <br className="hidden sm:inline"/> 
          สืบทอดจิตวิญญาณแห่งนวัตกรรมและการสร้างสรรค์
        </p>

        {/* ปุ่ม Action */}
        <div className="animate__animated animate__flipInX">
          <ExploreButton text="ENTER SYSTEM" onClick={handleEnter} />
        </div>

      </main>
    </div>
  );
};

export default Welcome;