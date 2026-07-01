import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api/seniorApi';
import { fetchUserActivity } from '../../api/activityApi';
import SeniorProfileBox from './comps/SeniorProfileBox';
import { ProfileSkeleton } from '../common/Skeletons';

const SeniorProfileTab = ({ userId, userEmail, notify, getDefaultAvatar }) => {
 const [profile, setProfile] = useState({ username: '', avatar_url: '' });
 const [exp, setExp] = useState(0);
 const [loading, setLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);

 useEffect(() => {
 const fetchProfile = async () => {
 try {
 const prof = await api.fetchSeniorProfile(userId, userEmail);
 const activity = await fetchUserActivity(userId);
 setProfile(prof);
 setExp(activity?.exp || 0);
 } catch (error) {
 console.error("Error:", error);
 }
 setLoading(false);
 };
 if (userId && userEmail) fetchProfile();
 }, [userId, userEmail]);

  const handleUploadAvatar = useCallback(async (file) => {
 try {
 if (!file) return;

 // 🛡️ 1. ดักจับขนาดไฟล์ตรงนี้ก่อนเลย! (เช่น ตั้งลิมิตไว้ที่ 2MB)
 const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (หน่วยเป็น Bytes)
 if (file.size > MAX_FILE_SIZE) {
 notify("ERROR: รูปภาพใหญ่เกินไป! กรุณาเลือกรูปขนาดไม่เกิน 2MB");
 return; // สั่งหยุดการทำงานทันที ไม่ต้องอัปโหลด
 }

 // ถ้าไฟล์ขนาดผ่านเกณฑ์ ค่อยให้ทำงานต่อ
 const publicUrl = await api.uploadAvatar(userId, file);
 
 await api.updateProfile(userId, { avatar_url: publicUrl, username: profile.username, student_id: userEmail.split('@')[0] });

 const timestampedUrl = `${publicUrl}?t=${new Date().getTime()}`;

 setProfile(prev => ({ ...prev, avatar_url: timestampedUrl }));
 
 notify("SYSTEM: Avatar updated!");
 } catch (error) { notify("ERROR:" + error.message); }
 }, [userId, userEmail, profile.username, notify]);


 const handleUpdateProfile = useCallback(async () => {
 setIsSaving(true);
 try {
 await api.updateProfile(userId, { username: profile.username, avatar_url: profile.avatar_url, student_id: userEmail.split('@')[0] });
 notify("SYSTEM: Profile saved!");
 } catch (error) { notify("ERROR:" + error.message); }
 setIsSaving(false);
 }, [userId, userEmail, profile, notify]);

 if (loading) return <ProfileSkeleton />;

 return (
 <div className="w-full max-w-7xl mx-auto">
 <SeniorProfileBox 
 profile={profile} 
 setProfile={setProfile} 
 userEmail={userEmail} 
 getDefaultAvatar={getDefaultAvatar} 
 handleUploadAvatar={handleUploadAvatar} 
 handleUpdateProfile={handleUpdateProfile} 
 isSaving={isSaving}
 notify={notify}
 exp={exp}
 />
 </div>
 );
};

export default SeniorProfileTab;
