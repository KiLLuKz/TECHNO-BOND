import React from 'react';
import { Upload, Save, User, KeyRound, Mail, Hash } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import ResetPasswordModal from '../../common/ResetPasswordModal';
import StatusBox from '../../common/StatusBox';

const SeniorProfileBox = ({ profile, setProfile, userEmail, getDefaultAvatar, handleUploadAvatar, handleUpdateProfile, isSaving, notify }) => {
  const [showResetModal, setShowResetModal] = React.useState(false);

  const handleRequestOtp = async () => {
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
          if (error) throw error;
          notify("SYSTEM: รหัส OTP สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลแล้ว!", "success");
          setShowResetModal(true);
      } catch (error) {
          notify("ERROR: " + error.message, "error");
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
      {/* Box 1: Profile Edit (Left) */}
      <div className="bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col items-center">
        <div className="relative group w-24 h-24 rounded-full mb-4 border border-white/10 overflow-hidden cursor-pointer bg-black/50 flex items-center justify-center">
            {profile.avatar_url ? (
                <img 
                    src={profile.avatar_url} 
                    className="w-full h-full object-cover bg-[#08050f]" 
                    alt="Avatar"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
            ) : null}

            <div className={`w-full h-full items-center justify-center bg-slate-800 ${profile.avatar_url ? 'hidden' : 'flex'}`}>
                <User size={40} className="text-gray-500" />
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <label className="cursor-pointer flex flex-col items-center">
                    <Upload size={20} className="text-white" />
                    <span className="text-[9px] text-white tracking-widest mt-1">EDIT</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadAvatar} />
                </label>
            </div>
        </div>
        
        <input 
            className="bg-black/30 border border-white/10 rounded-lg p-2 text-center text-sm w-full text-[#d966ff] mb-3 focus:outline-none focus:border-[#d966ff]/50 transition-colors" 
            value={profile.username} 
            onChange={(e) => setProfile({...profile, username: e.target.value})} 
        />
        
        <button 
            onClick={handleUpdateProfile} 
            disabled={isSaving} 
            className="w-full py-2 mt-auto bg-[#d966ff]/10 border border-[#d966ff]/30 rounded-lg text-xs hover:bg-[#d966ff]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            <Save size={14} /> {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
      </div>

      {/* Box 2: Status (Right) */}
      <div>
        <StatusBox 
            username={profile.username}
            role="SENIOR"
            level={35} // Mock Data
            exp={750}  // Mock Data
            maxExp={1500}
            color="#d966ff"
        />
      </div>

      {/* Account Info Box */}
      <div className="col-span-full bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col gap-3">
          <h3 className="text-[#d966ff] tracking-widest font-bold text-xs mb-1">ACCOUNT INFORMATION</h3>
          
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-[10px]"><Mail size={12}/> EMAIL</div>
              <span className="text-[#f0eaff] text-xs font-mono">{userEmail || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-[10px]"><Hash size={12}/> STUDENT ID</div>
              <span className="text-[#f0eaff] text-xs font-mono">{userEmail?.split('@')[0] || 'N/A'}</span>
          </div>

          <button 
              onClick={handleRequestOtp}
              className="w-full mt-2 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest font-bold"
          >
              <KeyRound size={14} /> REQUEST PASSWORD RESET (OTP)
          </button>
      </div>

      <ResetPasswordModal 
          isOpen={showResetModal} 
          onClose={() => setShowResetModal(false)} 
          userEmail={userEmail} 
          notify={notify} 
      />
    </div>
  );
};

export default SeniorProfileBox;