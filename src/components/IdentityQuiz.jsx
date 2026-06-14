import React, { useState } from 'react';
import 'animate.css'; 
import Loader from './Loader'; // Import Loader เข้ามาครับ
import { useNavigate } from 'react-router-dom';

const IdentityQuiz = ({ onCorrect }) => {
    const navigate = useNavigate();
    const [stage, setStage] = useState('intro');
    const [isLoading, setIsLoading] = useState(false); // เพิ่ม State โหลด
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const options = ['พี่ลีน่า', 'พี่เทค', 'พี่ไนท์', 'พี่กัน'];

    const handleAnswer = (answer) => {
        setSelectedOption(answer);

        if (answer === 'พี่ไนท์') {
        setIsCorrect(true);
        setErrorMessage('');
        setIsLoading(true); // <--- สั่งให้ Loader ทำงาน
        setTimeout(() => navigate('/dashboard'), 1500);
        } else {
        setIsCorrect(false);
        setErrorMessage('ผิด! ลองตอบใหม่นะ');
        setTimeout(() => {
            setSelectedOption(null);
            setIsCorrect(null);
            setErrorMessage('');
        }, 2000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 font-['Orbitron']">
        
        {/* ถ้ากำลัง Loading ให้ Loader แสดงผล */}
        {isLoading && <Loader text="DECRYPTING..." />}

        {/* CARD Wrapper (Mac Style) */}
        <div className="w-full max-w-md bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative animate__animated animate__fadeInUp animate__faster overflow-hidden">
            
            {/* macOS Title Bar */}
            <div className="px-5 py-4 flex items-center gap-2 border-b border-white/5 bg-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-3 text-[9px] text-white/30 tracking-[0.2em] uppercase font-bold">
                {stage === 'intro' ? 'SYSTEM_INIT' : 'IDENTITY_QUIZ'}
            </span>
            </div>

            {/* Content Area */}
            <div className="p-8" key={stage}>
                <div className="animate__animated animate__fadeInRight animate__faster">
                {stage === 'intro' ? (
                    <div className="text-center">
                    <div className="mb-6 p-4 border border-[#99eedd]/20 rounded-lg bg-[#99eedd]/5">
                        <p className="text-[#99eedd] font-bold text-sm tracking-widest mb-2">ACCESS GRANTED</p>
                        <p className="text-[#f0eaff] text-xl leading-relaxed">ยินดีต้อนรับสู่ระบบสมาชิก ก่อนจะไปดูคำใบ้ พี่มีคำถามทดสอบน้องๆ 1 ข้อ</p>
                    </div>
                    <button 
                        onClick={() => setStage('quiz')}
                        className="w-full py-4 bg-white/5 border border-white/10 text-[#99eedd] rounded-xl hover:bg-[#99eedd] hover:text-black transition-all font-bold tracking-widest active:scale-[0.98]"
                    >
                        START VERIFICATION
                    </button>
                    </div>
                ) : (
                    <div className="text-center">
                    <p className="font-['Rajdhani'] text-lg tracking-[0.2em] text-[#f0eaff] mb-8">
                        ใครคือประธานรุ่นแผนกเทคโนโลยีในปี 2569?
                    </p>

                    <div className="flex flex-col gap-3">
                        {options.map((opt) => {
                        let borderClass = 'border-white/10';
                        if (selectedOption === opt) {
                            borderClass = isCorrect ? 'border-green-500' : 'border-red-500 animate__animated animate__shakeX';
                        }
                        return (
                            <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            disabled={selectedOption !== null && !isCorrect}
                            className={`w-full py-4 border-2 rounded-xl text-[#99eedd] transition-all duration-300 hover:bg-[#B3AEBD]/10 active:scale-[0.98] ${borderClass}`}
                            >
                            {opt}
                            </button>
                        );
                        })}
                    </div>

                    {errorMessage && (
                        <p className="mt-6 text-xs text-red-500 font-['Orbitron'] animate__animated animate__headShake">
                        {errorMessage}
                        </p>
                    )}
                    </div>
                )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default IdentityQuiz;