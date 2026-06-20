import React from 'react';
import { Upload, Save, User } from 'lucide-react';

const SeniorProfileBox = ({ profile, setProfile, userEmail, getDefaultAvatar, handleUploadAvatar, handleUpdateProfile, isSaving }) => {
  return (
    // เพิ่ม h-full เข้าไปที่ div หลัก
    <div className="bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col items-center h-full">
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
            className="bg-black/30 border border-white/10 rounded-lg p-2 text-center text-sm w-full text-[#d966ff] mb-4 focus:outline-none focus:border-[#d966ff]/50 transition-colors" 
            value={profile.username} 
            onChange={(e) => setProfile({...profile, username: e.target.value})} 
            placeholder="Username"
        />

        {/* --- EXP / LEVEL / CURRENCY Placeholder --- */}
        <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 flex flex-col gap-3">
           <div className="flex justify-between items-center text-xs tracking-widest font-bold">
               <span className="text-[#ffe066]">LV. 1</span>
               <span className="text-[#4ECDC4]">0 ฿</span>
           </div>
           <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/5 relative">
               <div className="h-full bg-[#ffe066] w-[10%] shadow-[0_0_10px_#ffe066]"></div>
           </div>
           <div className="text-[10px] text-gray-500 text-right tracking-widest font-['Rajdhani']">
               10 / 100 EXP
           </div>
        </div>
        {/* ------------------------------------------ */}
        
        {/* เพิ่ม mt-auto เพื่อดันปุ่ม Save ลงล่างสุดของช่อง */}
        <button 
            onClick={handleUpdateProfile} 
            disabled={isSaving} 
            className="w-full py-2 mt-auto bg-[#d966ff]/10 border border-[#d966ff]/30 rounded-lg text-xs hover:bg-[#d966ff]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            <Save size={14} /> {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
    </div>
  );
};

export default SeniorProfileBox;