import React from 'react';
import { Upload, Save, User } from 'lucide-react';

// เพิ่ม h-full เข้าไปที่ div นอกสุด
const ProfileBox = ({ profile, setProfile, handleUploadAvatar, handleUpdateProfile, isSaving, defaultAvatar }) => {
  return (
    <div className="bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 flex flex-col items-center h-full w-full">
        <div className="relative group w-24 h-24 rounded-full mb-4 border border-white/10 overflow-hidden cursor-pointer bg-black/50 flex items-center justify-center">
            {/* เช็คถ้ามีรูปให้โชว์รูป ถ้าไม่มีโชว์ Icon User */}
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
        
        {/* ให้ input อยู่ตรงกลางและมีระยะห่าง */}
        <input 
            className="bg-black/30 border border-white/10 rounded-lg p-2 text-center text-sm w-full text-[#99eedd] mb-3 focus:outline-none focus:border-[#99eedd]/50 transition-colors" 
            value={profile.username} 
            onChange={(e) => setProfile({...profile, username: e.target.value})} 
        />
        
        {/* ใช้ mt-auto เพื่อดันปุ่มลงมาข้างล่างสุดของ Container (ถ้าช่อง Grid ยืดออก) */}
        <button 
            onClick={handleUpdateProfile} 
            disabled={isSaving} 
            className="w-full py-2 mt-auto bg-[#99eedd]/10 border border-[#99eedd]/30 rounded-lg text-xs hover:bg-[#99eedd]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            <Save size={14} /> {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
        </button>
    </div>
  );
};

export default ProfileBox;