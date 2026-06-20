import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { KeyRound, X } from 'lucide-react';

const ResetPasswordModal = ({ isOpen, onClose, userEmail, notify }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setLocalError('');
      // focus the first input shortly after opening
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index, value) => {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
          inputRefs.current[index + 1]?.focus();
      }
  };

  const handleKeyDown = (index, e) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
      }
  };

  const handleSubmit = async () => {
    setLocalError('');
    const token = otp.join('');
    if (token.length !== 6) {
        setLocalError('ERROR: กรุณากรอก OTP ให้ครบ 6 หลัก');
        return;
    }
    if (newPassword.length < 6) {
        setLocalError('ERROR: รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
    }

    setLoading(true);
    try {
        const { error: verifyError } = await supabase.auth.verifyOtp({ email: userEmail, token, type: 'recovery' });
        if (verifyError) throw verifyError;

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;

        notify('SYSTEM: เปลี่ยนรหัสผ่านสำเร็จ!');
        onClose();
    } catch (err) {
        setLocalError('ERROR: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#08050f]/90 border border-[#d966ff]/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(217,102,255,0.1)] relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3 border border-red-500/50">
                    <KeyRound className="text-red-400" size={24} />
                </div>
                <h2 className="text-[#f0eaff] font-bold tracking-widest text-lg">RESET PASSWORD</h2>
                <p className="text-gray-400 text-xs text-center mt-2">กรอกรหัส OTP ที่ได้รับทางอีเมลและตั้งรหัสผ่านใหม่</p>
            </div>

            <div className="flex justify-between mb-6 gap-2">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 h-12 bg-black/50 border border-[#d966ff]/30 rounded-lg text-center text-xl text-[#d966ff] font-bold focus:outline-none focus:border-[#d966ff] focus:shadow-[0_0_10px_rgba(217,102,255,0.3)] transition-all"
                    />
                ))}
            </div>

            <div className="mb-6">
                <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min. 6 chars)"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-[#f0eaff] focus:outline-none focus:border-[#d966ff]/50"
                />
            </div>

            {localError && (
                <div className="mb-4 text-center">
                    <span className="text-red-400 text-xs font-bold">{localError}</span>
                </div>
            )}

            <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-bold tracking-widest hover:bg-red-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? 'PROCESSING...' : 'CONFIRM RESET'}
            </button>
        </div>
    </div>
  );
};

export default ResetPasswordModal;
