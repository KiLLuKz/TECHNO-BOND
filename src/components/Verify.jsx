import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Loader from './Loader';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Verify = ({ onLoginSuccess}) => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityChecked, setSecurityChecked] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [emailError, setEmailError] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState(false);

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setErrorMsg('');
        setSuccessMsg('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSecurityChecked(false);
        setEmailError(false);
        setPasswordMatchError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email.endsWith('@bpk.ac.th')) {
            setErrorMsg('ACCESS DENIED: ต้องใช้อีเมล @bpk.ac.th เท่านั้น');
            setEmailError(true);
            setIsLoading(false);
            return;
        }

        const studentId = email.split('@')[0];

        if (isRegistering) {
            if (password !== confirmPassword) { setErrorMsg('ERROR: รหัสผ่านไม่ตรงกัน'); setPasswordMatchError(true); setIsLoading(false); return; }
            if (password.length < 6) { setErrorMsg('ERROR: รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); setIsLoading(false); return; }
            if (!securityChecked) { setErrorMsg('ERR: กรุณายอมรับเงื่อนไขความปลอดภัย'); setIsLoading(false); return; }

            try {
                // 1. เช็คว่าเป็น Junior หรือไม่ (ใช้ตารางใหม่ pairing_data และ junior_student_id)
                const { data: juniorData } = await supabase
                    .from('pairing_data')
                    .select('junior_student_id')
                    .eq('junior_student_id', studentId.trim())
                    .maybeSingle();

                // 2. เช็คว่าเป็น Senior หรือไม่
                const { data: seniorData } = await supabase
                    .from('pairing_data')
                    .select('senior_student_id')
                    .eq('senior_student_id', studentId.trim())
                    .maybeSingle();

                // 3. ถ้าไม่เจอทั้งคู่ แปลว่าไม่มีสิทธิ์สมัคร
                if (!juniorData && !seniorData) { 
                    setErrorMsg(`ACCESS DENIED: ไม่พบรหัสนักเรียน ${studentId} ในระบบจับคู่`); 
                    setIsLoading(false); 
                    return; 
                }

                // กำหนด Role ตั้งแต่ตอนสมัคร
                const assumedRole = seniorData ? 'senior' : 'junior';

                // 4. สร้างบัญชีผู้ใช้ใน Auth
                const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;

                // 5. บันทึกข้อมูลเริ่มต้นลงในตาราง profiles อัตโนมัติ!
                if (authData?.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: authData.user.id,
                            username: studentId,
                            student_id: studentId,
                            role: assumedRole
                        });
                    
                    if (profileError) console.error("Error creating default profile:", profileError);
                }

                setSuccessMsg('SYSTEM: สมัครสมาชิกสำเร็จ! โปรดเข้าสู่ระบบ');
                
                setTimeout(() => {
                    toggleMode();
                }, 1500);

            } catch (error) { 
                setErrorMsg(`ERR: ${error.message}`); 
            }
        } else {
            // ระบบ Login
            try {
                const { data: authResult, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // เช็ค Role จากตาราง profiles ก่อนว่าคนนี้เป็น admin หรือเปล่า
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authResult.user.id)
                    .single();

                let role = 'junior';
                
                if (profile?.role === 'admin') {
                    role = 'admin'; // ให้ Role เป็น Admin
                } else {
                    // ถ้าไม่ใช่แอดมิน ค่อยไปเช็คว่าเป็น Senior หรือ Junior
                    const { data: seniorData } = await supabase
                        .from('pairing_data')
                        .select('senior_student_id')
                        .eq('senior_student_id', studentId.trim())
                        .maybeSingle();
                        
                    role = seniorData ? 'senior' : 'junior';
                }

                onLoginSuccess(role); 
                // Admin และ Senior ไป Dashboard, ส่วน Junior ไป Quiz ก่อน
                navigate(role === 'junior' ? '/quiz' : '/dashboard');
            } catch (error) { 
                setErrorMsg('ACCESS DENIED: อีเมล หรือ รหัสผ่าน ไม่ถูกต้อง'); 
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10 font-['Orbitron'] overflow-y-auto w-full">
        
        {isLoading && <Loader text={isRegistering ? "INITIALIZING" : "CONNECTING"} />}

        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-[#7eb8ff]/60 hover:text-[#99eedd] transition-colors z-20">
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
                    {isRegistering ? 'AUTH_INIT' : 'ACCESS_GATE'}
                </span>
            </div>

            <div className="p-6 md:p-8">
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-bold tracking-widest text-[#f0eaff] mb-1">
                        IDENTITY VERIFICATION
                    </h2>
                    <p className="text-[9px] md:text-[10px] tracking-[0.2em] text-[#7eb8ff] uppercase">
                        {isRegistering ? 'CREATE NEW CONNECTION' : 'SYSTEM ACCESS'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-['Rajdhani'] font-medium">
                <div>
                    <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">SCHOOL MAIL</label>
                    <motion.input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="12345@bpk.ac.th"
                        animate={emailError ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                        className={`w-full bg-black/30 text-[#99eedd] px-4 py-3 rounded-lg border focus:outline-none transition-all ${
                            emailError ? 'border-red-500' : 'border-white/10'
                        }`}
                        required
                    />
                </div>
                
                <div>
                    <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">PASSWORD</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/30 border border-white/10 text-[#99eedd] px-4 py-3 rounded-lg focus:outline-none"
                        required
                    />
                </div>

                {isRegistering && (
                    <>
                        <div>
                            <label className="text-[10px] tracking-widest text-[#b899ff] mb-1 block font-['Orbitron']">CONFIRM PASSWORD</label>
                            <motion.input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                animate={passwordMatchError ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                                className={`w-full bg-black/30 text-[#99eedd] px-4 py-3 rounded-lg border focus:outline-none ${
                                    passwordMatchError ? 'border-red-500' : 'border-white/10'
                                }`}
                                required
                            />
                        </div>

                        <motion.div 
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="border border-amber-500/50 bg-amber-500/10 rounded-xl p-3 my-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        >
                            <p className=" font-bold text-[10px] text-amber-500 font-['Orbitron'] tracking-widest text-center flex items-center justify-center gap-2 mb-1">
                                <span>⚠️</span> SECURITY NOTICE
                            </p>
                            <p className="text-sm md:text-[16px] text-amber-500/80 font-['Rajdhani'] text-center leading-tight">
                                ระบบนี้ไม่ได้มีการป้องกันหนาแน่นมาก ห้ามใช้รหัสผ่านเดียวกับบัญชีสำคัญ(เช่น อีเมล,ธนาคาร) โดยเด็ดขาด
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
                
                {errorMsg && <motion.div animate={{ x: [-5, 5, -5, 5, 0] }} transition={{ duration: 0.4 }} className="text-xs text-red-400 text-center font-['Orbitron']">{errorMsg}</motion.div>}
                {successMsg && <div className="text-xs text-[#99eedd] text-center font-['Orbitron']">{successMsg}</div>}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-2 py-3 bg-white/5 border border-white/10 text-[#99eedd] font-bold tracking-widest rounded-lg hover:bg-[#99eedd] hover:text-black transition-all font-['Orbitron'] active:scale-[0.98] transform duration-150"
                >
                    {isLoading ? 'PROCESSING...' : isRegistering ? 'INITIALIZE' : 'ENTER SYSTEM'}
                </button>
                </form>

                <div className="mt-6 text-center">
                <button 
                    onClick={toggleMode} 
                    className="text-xs md:text-[14px] text-[#7eb8ff]/60 hover:text-[#7eb8ff] tracking-widest transition-colors font-['Orbitron'] underline active:scale-95 transform duration-150"
                >
                    {isRegistering ?"ALREADY HAVE ACCOUNT? LOG IN" : "DON'T HAVE ACCOUNT? REGISTER NOW"}
                </button>
                </div>
            </div>
        </motion.div>
        </div>
    );
};

export default Verify;