// src/components/Background.jsx
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const generateStars = (count) => {
 let shadows = [];
 for (let i = 0; i < count; i++) {
 const x = Math.floor(Math.random() * 800); 
 const y = Math.floor(Math.random() * 1000); 
 shadows.push(`${x}px ${y}px #ffffff`); 
 shadows.push(`${x}px ${y - 1000}px #ffffff`);
 }
 return shadows.join(', ');
};

export default function Background() {
 const location = useLocation();
 const isAdmin = location.pathname === '/dashboard/admin';

 // 1. เปลี่ยนสี Base ตามสถานะ (Admin=สีแดงเข้ม/เลือดหมู, ปกติ=สีม่วงเข้ม)
 const baseColor = isAdmin ? 'bg-[#1f0a0a]' : 'bg-[#180e2e]';
 
 // 2. สีของแสงและตาราง (RGB)
 const color = isAdmin ? '255, 80, 80' : '180, 80, 255';

 const stars1 = useMemo(() => generateStars(70), []);
 const stars2 = useMemo(() => generateStars(35), []);
 const stars3 = useMemo(() => generateStars(15), []);

 return (
 // ใส่ baseColor ตรงนี้ครับ
 <div className={`fixed inset-0 -z-10 ${baseColor} overflow-hidden transition-colors duration-700`}>
 
 {/* 1. แสง Gradient (มีแกนกลางสีขาว + สีตามสถานะ) */}
 <div 
 className="absolute inset-0 transition-colors duration-700" 
 style={{ 
 background: `radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.15), rgba(${color}, 0.20), transparent 60%)` 
 }} 
 />
 
 {/* 2. Grid Overlay (ปรับสีเส้นตามสถานะ) */}
 <div className="absolute inset-0 pointer-events-none animate-grid-pulse transition-colors duration-700" 
 style={{
 backgroundImage: `linear-gradient(rgba(${color}, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(${color}, 0.05) 1px, transparent 1px)`,
 backgroundSize: '50px 50px'
 }} 
 />

 {/* 3. Scanlines */}
 <div className="absolute inset-0 pointer-events-none animate-scan-move"
 style={{
 background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0, 0, 0, 0.07) 3px, rgba(0, 0, 0, 0.07) 4px)`
 }}
 />

 {/* 4. Falling Data */}
 <div 
 className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[65vh]"
 style={{
 WebkitMaskImage: 'radial-gradient(ellipse at top center, black 0%, transparent 80%)',
 maskImage: 'radial-gradient(ellipse at top center, black 0%, transparent 80%)'
 }}
 >
 <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent animate-star-fall rounded-full"
 style={{ boxShadow: stars1, animationDuration: '25s' }} />
 <div className="absolute top-0 left-0 w-[2.5px] h-[2.5px] bg-transparent animate-star-fall rounded-full"
 style={{ boxShadow: stars2, animationDuration: '18s' }} />
 <div className="absolute top-0 left-0 w-[3.5px] h-[3.5px] bg-transparent animate-star-fall rounded-full"
 style={{ boxShadow: stars3, animationDuration: '12s' }} />
 </div>

 </div>
 );
}