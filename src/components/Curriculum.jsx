import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Palette, Microscope, ChevronRight, Sparkles, Cpu, Activity, Gamepad2 } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';

const AnimatedNumber = ({ from = 0, to, duration = 2, suffix = '' }) => {
 const count = useMotionValue(from);
 const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);
 const ref = useRef(null);
 const inView = useInView(ref, { once: true, margin:"-100px" });

 useEffect(() => {
 if (inView) {
 animate(count, to, { duration: duration });
 }
 }, [inView, count, to, duration]);

 return <motion.span ref={ref}>{rounded}</motion.span>;
};

const Curriculum = () => {
 const navigate = useNavigate();
 // State สำหรับจัดการระบบ Tabs (สลับหมวดหมู่การเรียน)
 const [activeTab, setActiveTab] = useState('dev');

 return (
 // Container หลัก พื้นหลังมืด
 <div className="min-h-screen text-white font-['Inter',sans-serif] overflow-x-hidden pt-20 pb-24">
 
 {/* --- Promo Hero Section --- */}
 <section className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
 {/* ข้อความ FUTURE ลายน้ำพื้นหลัง */}
 <div className="absolute top-1/2 left-0 right-0 w-full -translate-y-1/2 flex justify-center items-center text-[18vw] font-black text-white/5 uppercase select-none pointer-events-none tracking-widest z-0">
 FUTURE
 </div>
 
 {/* เนื้อหาหลัก */}
 <motion.h1 
 initial={{ opacity: 0, scale: 0.8 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8 }}
 className="relative z-10 text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider leading-tight mb-6 break-keep"
 >
 วิทยาศาสตร์ · คณิตศาสตร์ · <br className="md:hidden"/>
 <span 
 className="text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
 style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff 30%, #a855f7 100%)' }}
 >
 เทคโนโลยี
 </span>
 </motion.h1>
 <motion.p 
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8, delay: 0.3 }}
 className="relative z-10 text-gray-400 text-sm md:text-base md:text-lg tracking-widest uppercase max-w-2xl"
 >
 Beyond traditional learning. We build the creators of tomorrow.
 </motion.p>
 </section>

 {/* --- Stats Bento Grid --- */}
 <motion.section 
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin:"-100px" }}
 variants={{
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
 }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 max-w-7xl mx-auto mt-10"
 >
 <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="lg:col-span-2 bg-gradient-to-br from-[#7b2cbf]/20 to-[#a855f7]/10 backdrop-blur-md border border-[#a855f7]/30 p-10 rounded-[30px] text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(168,85,247,0.3)] group">
 <h2 className="font-['Orbitron'] text-5xl md:text-6xl text-[#c084fc] mb-3 font-bold group-hover:scale-110 transition-transform duration-500">
 <AnimatedNumber from={1} to={100} suffix="%?" />
 </h2>
 <p className="text-gray-300 tracking-wider text-sm md:text-base uppercase group-hover:text-white transition-colors">University Admission</p>
 </motion.div>
 <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[30px] text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#a855f7]/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)] group">
 <h2 className="font-['Orbitron'] text-5xl text-[#c084fc] mb-3 font-bold group-hover:scale-110 transition-transform duration-500">
 <AnimatedNumber from={1} to={4} suffix="+" />
 </h2>
 <p className="text-gray-300 tracking-wider text-sm md:text-base uppercase group-hover:text-white transition-colors">Core Tech Skills</p>
 </motion.div>
 <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[30px] text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#a855f7]/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)] group">
 <h2 className="font-['Orbitron'] text-5xl text-[#c084fc] mb-3 font-bold group-hover:scale-110 transition-transform duration-500">
 <AnimatedNumber from={1} to={10} suffix="+" />
 </h2>
 <p className="text-gray-300 tracking-wider text-sm md:text-base uppercase group-hover:text-white transition-colors">Awards Won</p>
 </motion.div>
 <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="sm:col-span-2 lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[30px] text-center transition-all duration-500 hover:border-[#a855f7]/50 hover:bg-white/10 group">
 <h2 className="font-['Orbitron'] text-3xl md:text-4xl text-[#c084fc] mb-2 font-bold tracking-widest flex items-center justify-center gap-3">
 <Sparkles className="text-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity duration-500" size={28} />
 GEN 8
 <Sparkles className="text-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity duration-500" size={28} />
 </h2>
 <p className="text-gray-400 tracking-wider text-sm md:text-base uppercase">Legacy Continues</p>
 </motion.div>
 </motion.section>

 {/* --- Interactive Features Section --- */}
 <motion.section 
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:"-100px" }}
 transition={{ duration: 0.8 }}
 className="max-w-6xl mx-auto mt-24 p-6 md:p-12 bg-[radial-gradient(circle_at_center,#4f2ec3_0%,transparent_100%)] border border-white/5 rounded-[40px]"
 >
 <div className="text-center mb-10">
 <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold tracking-widest text-white mb-4">CORE COMPETENCIES</h2>
 <div className="w-20 h-1 bg-[#a855f7] mx-auto rounded-full"></div>
 </div>

 {/* Tabs Navigation (เปลี่ยน Emoji เป็น Icon) */}
 <div className="flex flex-wrap justify-center gap-4 mb-10">
 <button 
 onClick={() => setActiveTab('dev')}
 className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs md:text-sm md:text-base tracking-wider transition-all duration-300 ${activeTab === 'dev' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border-transparent scale-105' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
 >
 <Terminal size={18} /> FULL-STACK DEV
 </button>
 <button 
 onClick={() => setActiveTab('art')}
 className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs md:text-sm md:text-base tracking-wider transition-all duration-300 ${activeTab === 'art' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border-transparent scale-105' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
 >
 <Palette size={18} /> DIGITAL ART
 </button>
 <button 
 onClick={() => setActiveTab('stem')}
 className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs md:text-sm md:text-base tracking-wider transition-all duration-300 ${activeTab === 'stem' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border-transparent scale-105' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
 >
 <Microscope size={18} /> ADVANCED LEARNING
 </button>
 </div>

 {/* Tab Content Display */}
 <motion.div 
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 className="bg-[#0b0114]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
 >
 
 {/* Content: Dev */}
 {activeTab === 'dev' && (
 <>
 <motion.div 
 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
 >
 <h3 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-4">FULL-STACK DEVELOPMENT</h3>
 <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6">
 เรียนรู้การสร้างนวัตกรรมดิจิทัลตั้งแต่พื้นฐาน C#, JavaScript ไปจนถึงการพัฒนา Web Application แบบครบวงจร
 </p>
 <div className="flex flex-wrap gap-3">
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">C# / Game Dev</span>
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Web Dev (HTML/CSS/JS)</span>
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Database Management</span>
 </div>
 </motion.div>
 <motion.div 
 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
 className="h-48 md:h-64 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group"
 >
 <Terminal size={64} strokeWidth={1.5} className="text-[#c084fc] mb-4 opacity-80 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 animate-[bounce_3s_infinite]" />
 <div className="font-mono text-[#c084fc] opacity-60 text-sm md:text-base md:text-xl group-hover:opacity-100 transition-opacity duration-300">
 &lt;System.Init /&gt;
 </div>
 </motion.div>
 </>
 )}

 {/* Content: Art */}
 {activeTab === 'art' && (
 <>
 <motion.div 
 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
 >
 <h3 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-4">DIGITAL ART & CREATIVE</h3>
 <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6">
 ถ่ายทอดจินตนาการผ่านเทคโนโลยีสมัยใหม่ ทั้งงานออกแบบ UX/UI, Graphic Design และสื่อมัลติมีเดีย
 </p>
 <div className="flex flex-wrap gap-3">
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">UX/UI Design</span>
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Figma / Ps / Ai</span>
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Multimedia Content</span>
 </div>
 </motion.div>
 <motion.div 
 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
 className="h-48 md:h-64 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative group overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 <Palette size={80} strokeWidth={1.5} className="text-[#c084fc] opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-[bounce_3s_infinite]" />
 </motion.div>
 </>
 )}

 {/* Content: STEM */}
 {activeTab === 'stem' && (
 <>
 <motion.div 
 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
 >
 <h3 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-4">ADVANCED STEM LEARNING</h3>
 <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6">
 ปูพื้นฐานทางวิทยาศาสตร์และคณิตศาสตร์อย่างเข้มข้น เพื่อเตรียมพร้อมเข้าสู่มหาวิทยาลัยชั้นนำในสายเทคโนโลยี
 </p>
 <div className="flex flex-wrap gap-3">
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Applied Physics</span>
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Calculus</span>
 <span className="px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-lg text-xs md:text-sm md:text-base text-[#c084fc] hover:bg-[#a855f7]/30 transition-colors cursor-default">Data Science</span>
 </div>
 </motion.div>
 <motion.div 
 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
 className="h-48 md:h-64 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative group overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-bl from-[#a855f7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
 <Microscope size={80} strokeWidth={1.5} className="text-[#c084fc] opacity-80 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 animate-[bounce_3s_infinite]" />
 </motion.div>
 </>
 )}

 </motion.div>
 </motion.section>

 {/* --- Career Path Section --- */}
 <motion.section 
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin:"-100px" }}
 variants={{
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
 }}
 className="max-w-4xl mx-auto mt-32 px-6"
 >
 <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="text-center mb-16">
 <h2 className="font-['Orbitron'] text-3xl font-bold tracking-widest text-white mb-2">เส้นทางความสำเร็จ</h2>
 <p className="text-gray-400">Career Paths after Graduation</p>
 </motion.div>

 <div className="space-y-6">
 <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-white/5 border-l-4 border-[#a855f7] rounded-r-3xl transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:-translate-x-2">
 <div className="flex items-center justify-between w-full md:w-auto">
 <div className="font-['Orbitron'] text-4xl md:text-5xl font-black text-white/20 group-hover:text-[#a855f7]/40 transition-colors">01</div>
 <Cpu size={32} className="text-[#c084fc] md:hidden" />
 </div>
 <div className="flex-1">
 <h3 className="font-['Orbitron'] text-xl font-bold text-[#c084fc] mb-1 flex items-center gap-2">Engineering & AI <Cpu size={20} className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
 <p className="text-gray-400 text-sm md:text-base">KMUTT, Chula, KMITL — Computer, Software, Robotics</p>
 </div>
 </motion.div>

 <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-white/5 border-l-4 border-[#a855f7] rounded-r-3xl transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:-translate-x-2">
 <div className="flex items-center justify-between w-full md:w-auto">
 <div className="font-['Orbitron'] text-4xl md:text-5xl font-black text-white/20 group-hover:text-[#a855f7]/40 transition-colors">02</div>
 <Activity size={32} className="text-[#c084fc] md:hidden" />
 </div>
 <div className="flex-1">
 <h3 className="font-['Orbitron'] text-xl font-bold text-[#c084fc] mb-1 flex items-center gap-2">Medicine & Health-Tech <Activity size={20} className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
 <p className="text-gray-400 text-sm md:text-base">ผสมผสานวิทยาศาสตร์การแพทย์กับนวัตกรรมดิจิทัล</p>
 </div>
 </motion.div>

 <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-white/5 border-l-4 border-[#a855f7] rounded-r-3xl transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:-translate-x-2">
 <div className="flex items-center justify-between w-full md:w-auto">
 <div className="font-['Orbitron'] text-4xl md:text-5xl font-black text-white/20 group-hover:text-[#a855f7]/40 transition-colors">03</div>
 <Gamepad2 size={32} className="text-[#c084fc] md:hidden" />
 </div>
 <div className="flex-1">
 <h3 className="font-['Orbitron'] text-xl font-bold text-[#c084fc] mb-1 flex items-center gap-2">Digital Content Creator <Gamepad2 size={20} className="hidden md:inline-block opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
 <p className="text-gray-400 text-sm md:text-base">Game Dev, Animation, และ Tech YouTuber</p>
 </div>
 </motion.div>
 </div>
 </motion.section>

 {/* --- Call to Action (CTA) --- */}
 <motion.section 
 initial={{ opacity: 0, scale: 0.9 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true, margin:"-100px" }}
 transition={{ duration: 0.8 }}
 className="flex justify-center mt-32 mb-10 px-6"
 >
 <div className="bg-white/5 backdrop-blur-xl border border-[#a855f7]/30 p-10 md:p-16 rounded-[40px] text-center w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#a855f7]/60 transition-colors duration-500">
 <h2 className="font-['Orbitron'] text-2xl md:text-4xl font-bold text-white mb-4 tracking-widest">READY TO JOIN THE LEGACY?</h2>
 <p className="text-gray-400 mb-10">เตรียมพบกับก้าวย่างของ GEN 9 ในปีการศึกษาหน้า</p>
 <button 
 onClick={() => navigate('/students')} 
 className="group px-10 py-4 bg-transparent border-2 border-[#a855f7] text-[#c084fc] font-bold tracking-widest rounded-full transition-all duration-300 hover:bg-[#a855f7] hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 flex items-center gap-3 mx-auto"
 >
 VIEW MEMBER
 <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
 </button>
 </div>
 </motion.section>

 </div>
 );
};

export default Curriculum;