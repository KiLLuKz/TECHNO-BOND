import React, { useState } from 'react';
import { Upload, Save, User, KeyRound, Mail, Hash, Camera, Pencil } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import ResetPasswordModal from '../../common/ResetPasswordModal';
import StatusBox from '../../common/StatusBox';
import ImageCropperModal from '../../Admin_Dashboard/ImageCropperModal';
import { calculateLevel, calculateExpProgress } from '../../../utils/levelUtils';

import HoloIDCard from '../../common/HoloIDCard';

const SeniorProfileBox = ({ profile, setProfile, userEmail, getDefaultAvatar, handleUploadAvatar, handleUploadBanner, handleUpdateProfile, isSaving, notify, exp }) => {
 const [showResetModal, setShowResetModal] = useState(false);
 const [cropperOpen, setCropperOpen] = useState(false);
 const [bannerCropperOpen, setBannerCropperOpen] = useState(false);

 const level = calculateLevel(exp);
 const { currentLevelExp, maxLevelExp } = calculateExpProgress(exp);

 const handleRequestOtp = async () => {
 try {
 const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
 if (error) throw error;
 notify("SYSTEM: รหัส OTP สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลแล้ว!","success");
 setShowResetModal(true);
 } catch (error) {
 notify("ERROR:" + error.message,"error");
 }
 };

 return (
 <div className="grid grid-cols-1 gap-4 h-full w-full">
 {/* Box 1: Profile Edit (Left) */}
 <div className="bg-[#08050f]/60 backdrop-blur-sm border border-white/10 rounded-[20px] p-6 flex flex-col items-center">
 <div className="w-full flex justify-center mb-6">
   <HoloIDCard 
      profile={profile} 
      exp={exp} 
      role="SENIOR" 
      defaultAvatar={getDefaultAvatar('senior', userEmail?.split('@')[0])}
      isEditable={true}
      onAvatarClick={() => setCropperOpen(true)}
      onBannerClick={() => setBannerCropperOpen(true)}
   />
 </div>
 
 <div className="relative w-full mb-4">
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
 <Pencil size={14} />
 </div>
 <input 
 className="bg-black/40 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-center text-sm md:text-base w-full text-[#d966ff] focus:outline-none focus:border-[#d966ff]/70 focus:bg-white/5 transition-all font-bold placeholder-gray-600 shadow-inner" 
 placeholder="ตั้งชื่อของคุณ..."
 value={profile.username} 
 onChange={(e) => setProfile({...profile, username: e.target.value})} 
 />
 </div>
 
 <button 
 onClick={handleUpdateProfile} 
 disabled={isSaving} 
 className="w-full py-2.5 mt-auto bg-white/5 border border-white/10 rounded-lg text-xs md:text-sm font-bold tracking-widest hover:bg-[#d966ff]/20 hover:text-[#d966ff] hover:border-[#d966ff]/50 flex items-center justify-center gap-2 transition-all active:scale-95"
 >
 <Save size={16} /> {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
 </button>
 </div>

 {/* Box 2: Status (Right) */}
 <div>
 
<div className="bg-[#08050f]/60 backdrop-blur-sm border border-white/10 rounded-[20px] p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
  <h2 className="text-[#d966ff] font-bold text-2xl font-['Orbitron'] mb-2">SYSTEM STATUS</h2>
  <p className="text-gray-500 tracking-widest text-lg animate-pulse">COMING SOON</p>
</div>

 </div>

 {/* Account Info Box */}
 <div className="col-span-full bg-[#08050f]/60 backdrop-blur-sm border border-white/10 rounded-[20px] p-6 flex flex-col gap-3">
 <h3 className="font-['Orbitron'] text-[#d966ff] tracking-widest font-bold text-xs md:text-sm md:text-base mb-1">ACCOUNT INFORMATION</h3>
 
 <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
 <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm md:text-base"><Mail size={12}/> EMAIL</div>
 <span className="text-[#f0eaff] text-xs md:text-sm md:text-base font-mono">{userEmail || 'N/A'}</span>
 </div>
 
 <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
 <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm md:text-base"><Hash size={12}/> STUDENT ID</div>
 <span className="text-[#f0eaff] text-xs md:text-sm md:text-base font-mono">{userEmail?.split('@')[0] || 'N/A'}</span>
 </div>

 <button 
 onClick={handleRequestOtp}
 className="w-full mt-2 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs md:text-sm md:text-base hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest font-bold"
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

 <ImageCropperModal
 isOpen={cropperOpen}
 onClose={() => setCropperOpen(false)}
 title="UPLOAD AVATAR"
 description="คลิกเพื่อเลือกรูปโปรไฟล์ของคุณ (อัตราส่วน 1:1)"
 aspectRatio={1}
 uploadFunction={handleUploadAvatar}
 />

 <ImageCropperModal
 isOpen={bannerCropperOpen}
 onClose={() => setBannerCropperOpen(false)}
 title="UPLOAD BANNER"
 description="คลิกเพื่อเลือกรูปหน้าปก (อัตราส่วน 16:9)"
 aspectRatio={16/9}
 uploadFunction={handleUploadBanner}
 />
 </div>
 );
};

export default SeniorProfileBox;