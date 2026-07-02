import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Loader from './Loader';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

const Verify = ({ onLoginSuccess}) => {
 const navigate = useNavigate();
 
 // mode: 'login', 'register', 'forgot_password', 'verify_otp_signup', 'reset_password'
 const [mode, setMode] = useState('login');
 
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [securityChecked, setSecurityChecked] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 
 const [otp, setOtp] = useState(['', '', '', '', '', '']);
 const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
 
 const [isLoading, setIsLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');
 const [successMsg, setSuccessMsg] = useState('');
 
 const [emailError, setEmailError] = useState(false);
 const [passwordMatchError, setPasswordMatchError] = useState(false);

 const resetMessages = () => {
 setErrorMsg('');
 setSuccessMsg('');
 setEmailError(false);
 setPasswordMatchError(false);
 };

 const switchMode = (newMode) => {
 setMode(newMode);
 resetMessages();
 if (newMode === 'login' || newMode === 'register' || newMode === 'forgot_password') {
 setPassword('');
 setConfirmPassword('');
 setSecurityChecked(false);
 setOtp(['', '', '', '', '', '']);
 setShowPassword(false);
 }
 };

 const handleOtpChange = (index, value) => {
 if (value.length > 1) value = value.slice(-1);
 const newOtp = [...otp];
 newOtp[index] = value;
 setOtp(newOtp);
 
 if (value && index < 5) otpRefs[index + 1].current.focus();
 };

 const handleOtpKeyDown = (index, e) => {
 if (e.key === 'Backspace' && !otp[index] && index > 0) {
 otpRefs[index - 1].current.focus();
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsLoading(true);
 resetMessages();

 if (!email.endsWith('@bpk.ac.th')) {
 setErrorMsg('ACCESS DENIED: ต้องใช้อีเมล @bpk.ac.th เท่านั้น');
 setEmailError(true);
 setIsLoading(false);
 return;
 }

 const studentId = email.split('@')[0];

 try {
 if (mode === 'register') {
 if (password !== confirmPassword) { setErrorMsg('ERROR: รหัสผ่านไม่ตรงกัน'); setPasswordMatchError(true); setIsLoading(false); return; }
 if (password.length < 6) { setErrorMsg('ERROR: รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); setIsLoading(false); return; }
 if (!securityChecked) { setErrorMsg('ERR: กรุณายอมรับเงื่อนไขความปลอดภัย'); setIsLoading(false); return; }
 
 // ลบตัวบล็อกออกไปแล้ว เพื่อให้ทุกคนสามารถสมัครสมาชิกได้ทันทีโดยไม่ต้องไปเช็คในตาราง pairing_data ให้วุ่นวาย
 const { error: signUpError } = await supabase.auth.signUp({ email, password });
 
 if (signUpError) {
 if (signUpError.message.includes('already registered')) {
 throw new Error('บัญชีนี้มีอยู่แล้ว ไปหน้าเข้าสู่ระบบได้เลย');
 }
 throw signUpError;
 }
 
 setSuccessMsg('SYSTEM: รหัสยืนยัน (OTP) ถูกส่งไปยังอีเมลแล้ว');
 setTimeout(() => switchMode('verify_otp_signup'), 1500);
 }
 else if (mode === 'verify_otp_signup') {
 const token = otp.join('');
 if (token.length < 6) { setErrorMsg('ERROR: กรุณากรอกรหัส 6 หลักให้ครบ'); setIsLoading(false); return; }

 const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
 if (error) throw error;

 const cleanId = studentId.trim();
 
 // ใช้ ilike เพื่อป้องกันช่องว่างแฝง
 const { data: seniorData } = await supabase.from('pairing_data').select('senior_student_id').ilike('senior_student_id', `%${cleanId}%`).limit(1).maybeSingle();
 const assumedRole = seniorData ? 'senior' : 'junior';
 
 if (data?.user) {
 await supabase.from('profiles').upsert({
 id: data.user.id,
 user_id: data.user.id,
 username: studentId,
 student_id: studentId,
 role: assumedRole
 });
 }

 setSuccessMsg('SYSTEM: ยืนยันอีเมลสำเร็จ! กำลังเข้าสู่ระบบ...');
 setTimeout(() => {
 onLoginSuccess(assumedRole);
 navigate(assumedRole === 'junior' ? '/quiz' : '/dashboard');
 }, 1500);
 }
 else if (mode === 'forgot_password') {
 const { error } = await supabase.auth.resetPasswordForEmail(email);
 if (error) throw error;
 
 setSuccessMsg('SYSTEM: รหัส OTP ถูกส่งไปยังอีเมลแล้ว');
 setTimeout(() => switchMode('reset_password'), 1500);
 }
 else if (mode === 'reset_password') {
 const token = otp.join('');
 if (token.length < 6) { setErrorMsg('ERROR: กรุณากรอกรหัส 6 หลักให้ครบ'); setIsLoading(false); return; }
 if (password !== confirmPassword) { setErrorMsg('ERROR: รหัสผ่านไม่ตรงกัน'); setPasswordMatchError(true); setIsLoading(false); return; }
 if (password.length < 6) { setErrorMsg('ERROR: รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); setIsLoading(false); return; }

 const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
 if (error) throw error;

 const { error: updateError } = await supabase.auth.updateUser({ password });
 if (updateError) throw updateError;

 setSuccessMsg('SYSTEM: เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่');
 setTimeout(() => switchMode('login'), 2000);
 }
 else if (mode === 'login') {
 const { data: authResult, error } = await supabase.auth.signInWithPassword({ email, password });
 if (error) throw error;

 const { data: profile } = await supabase.from('profiles').select('role').eq('id', authResult.user.id).single();

 let role = 'junior';
 if (profile?.role === 'admin') {
 role = 'admin';
 } else if (profile?.role === 'senior') {
 role = 'senior';
 } else {
 const cleanId = studentId.trim();
 const { data: seniorData } = await supabase.from('pairing_data').select('senior_student_id').ilike('senior_student_id', `%${cleanId}%`).limit(1).maybeSingle();
 role = seniorData ? 'senior' : 'junior';
 }

 onLoginSuccess(role); 
 navigate(role === 'junior' ? '/quiz' : '/dashboard');
 }
 } catch (error) { 
 setErrorMsg(`ERR: ${error.message}`); 
 }
 setIsLoading(false);
 };

 const getHeaderText = () => {
 if (mode === 'register') return 'CREATE NEW CONNECTION';
 if (mode === 'forgot_password') return 'RECOVER CONNECTION';
 if (mode === 'verify_otp_signup' || mode === 'reset_password') return 'ENTER SECURITY CODE';
 return 'SYSTEM ACCESS';
 };

 const getModeLabel = () => {
 if (mode === 'register') return 'AUTH_INIT';
 if (mode === 'forgot_password' || mode === 'reset_password') return 'AUTH_RECOVER';
 if (mode === 'verify_otp_signup') return 'AUTH_VERIFY';
 return 'ACCESS_GATE';
 };

 return (
 <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10 overflow-y-auto w-full">
 
 {isLoading && <Loader text={mode === 'login' ?"CONNECTING" :"PROCESSING"} />}

 <button onClick={() => {
 if (mode === 'verify_otp_signup' || mode === 'forgot_password' || mode === 'reset_password') switchMode('login');
 else navigate(-1);
 }} className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-[#7eb8ff]/60 hover:text-[#99eedd] transition-colors z-20">
 <span className="text-xl">{'<'}</span> BACK
 </button>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 className="w-full max-w-md bg-[#08050f]/60 backdrop-blur-2xl border border-white/10 rounded-[20px] p-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden my-auto mt-12 md:mt-auto"
 >
 <div className="px-5 py-4 flex items-center gap-2 border-b border-white/5 bg-white/5">
 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
 <span className="ml-3 text-[9px] text-white/30 tracking-[0.2em] uppercase font-bold">
 {getModeLabel()}
 </span>
 </div>

 <div className="p-6 md:p-8">
 <div className="text-center mb-6 md:mb-8">
 <h2 className="font-['Orbitron'] text-lg md:text-xl font-bold tracking-widest text-[#f0eaff] mb-1">
 IDENTITY VERIFICATION
 </h2>
 <p className="text-[9px] md:text-[10px] tracking-[0.2em] text-[#7eb8ff] uppercase">
 {getHeaderText()}
 </p>
 </div>

 <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-['Rajdhani'] font-medium">
 
 {(mode === 'login' || mode === 'register' || mode === 'forgot_password' || mode === 'verify_otp_signup' || mode === 'reset_password') && (
 <div>
 <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block">SCHOOL MAIL</label>
 <motion.input 
 type="email" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 disabled={mode === 'verify_otp_signup' || mode === 'reset_password'}
 placeholder="12345@bpk.ac.th"
 animate={emailError ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
 className={`w-full bg-black/30 text-[#99eedd] px-4 py-3 rounded-lg border focus:outline-none transition-all disabled:opacity-50 ${
 emailError ? 'border-red-500' : 'border-white/10'
 }`}
 required
 />
 </div>
 )}
 
 {(mode === 'login' || mode === 'register') && (
 <div>
 <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block">PASSWORD</label>
 <div className="relative">
 <input 
 type={showPassword ?"text" :"password"} 
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full bg-black/30 border border-white/10 text-[#99eedd] px-4 py-3 pr-12 rounded-lg focus:outline-none"
 required
 />
 <button 
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#99eedd] transition-colors"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>
 )}

 {(mode === 'register' || mode === 'reset_password') && (
 <>
 {mode === 'reset_password' && (
 <div>
 <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block">NEW PASSWORD</label>
 <div className="relative">
 <input 
 type={showPassword ?"text" :"password"} 
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full bg-black/30 border border-white/10 text-[#99eedd] px-4 py-3 pr-12 rounded-lg focus:outline-none"
 required
 />
 <button 
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#99eedd] transition-colors"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>
 )}
 <div>
 <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block">CONFIRM PASSWORD</label>
 <div className="relative">
 <motion.input 
 type={showPassword ?"text" :"password"} 
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 placeholder="••••••••"
 animate={passwordMatchError ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
 className={`w-full bg-black/30 text-[#99eedd] px-4 py-3 pr-12 rounded-lg border focus:outline-none ${
 passwordMatchError ? 'border-red-500' : 'border-white/10'
 }`}
 required
 />
 <button 
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#99eedd] transition-colors"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 {mode === 'register' && (
 <>
 <motion.div 
 animate={{ scale: [1, 1.02, 1] }}
 transition={{ repeat: Infinity, duration: 2 }}
 className="border border-amber-500/50 bg-amber-500/10 rounded-xl p-3 my-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
 >
 <p className="font-bold text-[10px] text-amber-500 tracking-widest text-center flex items-center justify-center gap-2 mb-1">
 <AlertTriangle size={14} className="text-amber-500" /> SECURITY NOTICE
 </p>
 <p className="text-sm md:text-base md:text-[16px] text-amber-500/80 font-['Rajdhani'] text-center leading-tight">
 ระบบนี้ไม่ได้มีการป้องกันหนาแน่นมาก ห้ามใช้รหัสผ่านเดียวกับบัญชีสำคัญโดยเด็ดขาด
 </p>
 </motion.div>
 
 <div className="flex items-start gap-2 cursor-pointer mt-1" onClick={() => setSecurityChecked(!securityChecked)}>
 <input 
 type="checkbox" 
 checked={securityChecked}
 onChange={(e) => setSecurityChecked(e.target.checked)}
 className="accent-[#99eedd] bg-black/30 border-white/10 cursor-pointer mt-1"
 />
 <label className="text-[9px] md:text-[10px] tracking-widest text-[#7eb8ff] cursor-pointer leading-snug">
 I UNDERSTAND AND ACCEPT SECURITY TERMS
 </label>
 </div>
 </>
 )}
 </>
 )}

 {(mode === 'verify_otp_signup' || mode === 'reset_password') && (
 <div className="mt-2">
 <label className="text-[10px] tracking-widest text-[#d966ff] mb-2 block text-center">ACCESS CODE (OTP)</label>
 <div className="flex gap-2 justify-center">
 {otp.map((digit, index) => (
 <motion.input
 key={index}
 ref={otpRefs[index]}
 type="text"
 maxLength={1}
 value={digit}
 onChange={(e) => handleOtpChange(index, e.target.value)}
 onKeyDown={(e) => handleOtpKeyDown(index, e)}
 className="w-10 h-12 md:w-12 md:h-14 bg-black/50 border border-[#d966ff]/50 rounded-lg text-center text-[#d966ff] font-bold text-xl md:text-2xl focus:outline-none focus:border-[#99eedd] transition-colors"
 />
 ))}
 </div>
 </div>
 )}

 {/* Error and Success Messages */}
 {errorMsg && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[11px] md:text-xs md:text-sm md:text-base text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
 {errorMsg}
 </motion.div>
 )}
 {successMsg && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#99eedd] text-[11px] md:text-xs md:text-sm md:text-base text-center font-bold bg-[#99eedd]/10 py-2 rounded-lg border border-[#99eedd]/20">
 {successMsg}
 </motion.div>
 )}

 <button type="submit" disabled={isLoading} className="w-full bg-[#7eb8ff]/20 hover:bg-[#7eb8ff]/30 text-[#7eb8ff] border border-[#7eb8ff]/50 py-3 rounded-xl font-bold tracking-widest transition-all mt-2 disabled:opacity-50">
 {mode === 'login' ? 'INITIALIZE CONNECTION' : 
 mode === 'register' ? 'CREATE CONNECTION' : 
 mode === 'forgot_password' ? 'SEND RECOVERY PING' : 
 'VERIFY CODE'}
 </button>
 </form>

 <div className="mt-6 flex flex-col gap-3 text-center text-[10px] md:text-[11px] tracking-widest text-gray-400">
 {mode === 'login' && (
 <>
 <button type="button" onClick={() => switchMode('forgot_password')} className="hover:text-[#99eedd] text-[16px] transition-colors">ลืมรหัสผ่าน?</button>
 <button type="button" onClick={() => switchMode('register')} className="hover:text-[#b899ff] text-[16px] transition-colors">ผู้ใช้ใหม่? สร้างบัญชีเลย</button>
 </>
 )}
 {(mode === 'register' || mode === 'forgot_password') && (
 <button type="button" onClick={() => switchMode('login')} className="hover:text-[#7eb8ff] text-[16px] transition-colors">มีบัญชีอยู่แล้ว? ล็อคอิน</button>
 )}
 </div>
 </div>
 </motion.div>
 </div>
 );
};

export default Verify;