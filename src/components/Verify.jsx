import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Loader from './Loader';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

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

                const { data: juniorData } = await supabase.from('pairing_data').select('junior_student_id').eq('junior_student_id', studentId.trim()).maybeSingle();
                const { data: seniorData } = await supabase.from('pairing_data').select('senior_student_id').eq('senior_student_id', studentId.trim()).maybeSingle();

                if (!juniorData && !seniorData) { 
                    setErrorMsg(`ACCESS DENIED: ไม่พบรหัสนักเรียน ${studentId} ในระบบจับคู่`); 
                    setIsLoading(false); return; 
                }

                const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
                
                if (signUpError) {
                    if (signUpError.message.toLowerCase().includes('already registered') || signUpError.message.toLowerCase().includes('already exists')) {
                        throw new Error('บัญชีนี้มีอยู่ในระบบแล้ว กรุณาไปหน้าเข้าสู่ระบบ หรือรีเซ็ตรหัสผ่าน');
                    }
                    throw signUpError;
                }

                // Supabase might return null user if already registered and email confirmations are ON (prevent email enumeration)
                // But usually it throws an error if user already exists
                if (authData?.user?.identities?.length === 0) {
                    throw new Error('บัญชีนี้มีอยู่ในระบบแล้ว กรุณาไปหน้าเข้าสู่ระบบ หรือรีเซ็ตรหัสผ่าน');
                }

                setSuccessMsg('SYSTEM: รหัสยืนยัน (OTP) ถูกส่งไปยังอีเมลแล้ว');
                setTimeout(() => switchMode('verify_otp_signup'), 1500);
            } 
            else if (mode === 'verify_otp_signup') {
                const token = otp.join('');
                if (token.length < 6) { setErrorMsg('ERROR: กรุณากรอกรหัส 6 หลักให้ครบ'); setIsLoading(false); return; }

                const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
                if (error) throw error;

                const { data: juniorData } = await supabase.from('pairing_data').select('junior_student_id').eq('junior_student_id', studentId.trim()).maybeSingle();
                const { data: seniorData } = await supabase.from('pairing_data').select('senior_student_id').eq('senior_student_id', studentId.trim()).maybeSingle();
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
                } else {
                    const { data: seniorData } = await supabase.from('pairing_data').select('senior_student_id').eq('senior_student_id', studentId.trim()).maybeSingle();
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
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10 font-['Orbitron'] overflow-y-auto w-full">
        
        {isLoading && <Loader text={mode === 'login' ? "CONNECTING" : "PROCESSING"} />}

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
                    <h2 className="text-lg md:text-xl font-bold tracking-widest text-[#f0eaff] mb-1">
                        IDENTITY VERIFICATION
                    </h2>
                    <p className="text-[9px] md:text-[10px] tracking-[0.2em] text-[#7eb8ff] uppercase">
                        {getHeaderText()}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-['Rajdhani'] font-medium">
                
                {(mode === 'login' || mode === 'register' || mode === 'forgot_password' || mode === 'verify_otp_signup' || mode === 'reset_password') && (
                    <div>
                        <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">SCHOOL MAIL</label>
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
                        <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">PASSWORD</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
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
                                <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">NEW PASSWORD</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
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
                            <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">CONFIRM PASSWORD</label>
                            <div className="relative">
                                <motion.input 
                                    type={showPassword ? "text" : "password"} 
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
                                    <p className=" font-bold text-[10px] text-amber-500 font-['Orbitron'] tracking-widest text-center flex items-center justify-center gap-2 mb-1">
                                        <span>⚠️</span> SECURITY NOTICE
                                    </p>
                                    <p className="text-sm md:text-[16px] text-amber-500/80 font-['Rajdhani'] text-center leading-tight">
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
                                    <label className="text-[9px] md:text-[10px] tracking-widest text-[#7eb8ff] cursor-pointer font-['Orbitron'] leading-snug">
                                        I UNDERSTAND AND ACCEPT SECURITY TERMS
                                    </label>
                                </div>
                            </>
                        )}
                    </>
                )}

                {(mode === 'verify_otp_signup' || mode === 'reset_password') && (
                    <div className="mt-2">
                        <label className="text-[10px] tracking-widest text-[#d966ff] mb-2 block font-['Orbitron'] text-center">ACCESS CODE (OTP)</label>
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
                                    className="w-10 h-12 md:w-12 md:h-14 bg-black/50 border border-[#d966ff]/50 rounded-lg text-center text-[#d966ff] font-['Orbitron'] font-bold text-xl md:text-2xl focus:outline-none focus:border-[#d966ff] focus:shadow-[0_0_10px_rgba(217,102,255,0.5)] transition-all"
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {errorMsg && <motion.div animate={{ x: [-5, 5, -5, 5, 0] }} transition={{ duration: 0.4 }} className="text-xs text-red-400 text-center font-['Orbitron']">{errorMsg}</motion.div>}
                {successMsg && <div className="text-xs text-[#99eedd] text-center font-['Orbitron']">{successMsg}</div>}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-2 py-3 bg-white/5 border border-white/10 text-[#99eedd] font-bold tracking-widest rounded-lg hover:bg-[#99eedd] hover:text-black hover:shadow-[0_0_15px_rgba(153,238,221,0.6)] transition-all font-['Orbitron'] active:scale-[0.98] transform duration-150"
                >
                    {isLoading ? 'PROCESSING...' : mode === 'register' ? 'INITIALIZE' : mode === 'forgot_password' ? 'SEND RESET CODE' : mode === 'verify_otp_signup' ? 'VERIFY CODE' : mode === 'reset_password' ? 'CHANGE PASSWORD' : 'ENTER SYSTEM'}
                </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3">
                    {mode === 'login' && (
                        <button 
                            onClick={() => switchMode('forgot_password')} 
                            className="text-[10px] md:text-xs text-amber-500/60 hover:text-amber-500 tracking-widest transition-colors font-['Orbitron'] underline active:scale-95 transform duration-150"
                        >
                            FORGOT PASSWORD?
                        </button>
                    )}
                    
                    {(mode === 'login' || mode === 'register') && (
                        <button 
                            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} 
                            className="text-xs md:text-[14px] text-[#7eb8ff]/60 hover:text-[#7eb8ff] tracking-widest transition-colors font-['Orbitron'] underline active:scale-95 transform duration-150"
                        >
                            {mode === 'register' ? "ALREADY HAVE ACCOUNT? LOG IN" : "DON'T HAVE ACCOUNT? REGISTER NOW"}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
        </div>
    );
};

export default Verify;