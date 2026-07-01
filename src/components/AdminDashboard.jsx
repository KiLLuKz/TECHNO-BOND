import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, MessageSquare, BookOpen, BrainCircuit } from 'lucide-react';
import { supabase } from '../supabaseClient';
import UnifiedDirectoryBox from './Admin_Dashboard/UnifiedDirectoryBox';
import ClueTrackerBox from './Admin_Dashboard/ClueTrackerBox';
import ImageCropperModal from './Admin_Dashboard/ImageCropperModal';
import Loader from './Loader';
import SystemAlert from './SystemAlert'; 
import { uploadSeniorPhoto, updateSeniorPhotoUrl } from '../api/juniorApi';

const AdminDashboard = () => {
 const [seniors, setSeniors] = useState([]);
 const [juniors, setJuniors] = useState([]);
 const [loading, setLoading] = useState(true);
 
 const [alertState, setAlertState] = useState({ 
 isOpen: false, type: 'info', title: '', message: '', onConfirm: null 
 });

 const [cropperState, setCropperState] = useState({
 isOpen: false,
 senior: null
 });

 useEffect(() => {
 fetchAdminData();
 }, []);

 const fetchAdminData = async () => {
 setLoading(true);
 // 1. ดึงข้อมูล Profile ทั้งหมด และข้อมูลจาก pairing_data (ตารางใหม่ของเรา)
 const { data: allProfiles } = await supabase.from('profiles').select('*');
 const { data: allPairs } = await supabase.from('pairing_data').select('*');

 if (allProfiles && allPairs) {
 // 2. จัดกลุ่ม Seniors (ต้องดึงมาแบบไม่ซ้ำ)
 const seniorMap = new Map();
 allPairs.forEach(pair => {
 if (pair.senior_id && !seniorMap.has(pair.senior_id)) {
 // ดึงข้อมูล profile ของพี่รหัสคนนั้น (ถ้ามี)
 const profile = allProfiles.find(p => String(p.student_id) === String(pair.senior_student_id));
 seniorMap.set(pair.senior_id, {
 senior_id: pair.senior_id,
 senior_student_id: pair.senior_student_id,
 senior_nickname: pair.senior_nickname,
 senior_full_name: pair.senior_full_name,
 senior_photo_url: pair.senior_photo_url,
 clue_1: pair.clue_1,
 clue_2: pair.clue_2,
 clue_3: pair.clue_3,
 ...(profile || {}), // ถ้าไม่มี profile ให้ใช้ข้อมูลจาก pair แทน
 id: profile ? profile.id : pair.senior_id
 });
 }
 });
 
 // 3. จัดกลุ่ม Juniors (น้องรหัสทุกคนตาม pairing_data)
 const juniorsWithProfile = allPairs
 .filter(pair => pair.junior_student_id !== '00000')
 .map(pair => {
 const profile = allProfiles.find(p => String(p.student_id) === String(pair.junior_student_id));
 return { 
 ...pair, 
 ...(profile || {}),
 // เพื่อให้สอดคล้องกับ UnifiedDirectoryBox
 junior_id: pair.junior_id,
 junior_student_id: pair.junior_student_id,
 junior_full_name: pair.junior_full_name 
 };
 });

 setSeniors(Array.from(seniorMap.values()));
 setJuniors(juniorsWithProfile);
 }
 setLoading(false);
 };

 const handleUploadClick = (senior) => {
 setCropperState({ isOpen: true, senior });
 };

 // ... (ฟังก์ชัน handleReset และ executeReset เหมือนเดิม ไม่ต้องเปลี่ยน)
 const handleReset = (action) => {
 setAlertState({
 isOpen: true,
 type: 'warning',
 title: 'CONFIRM RESET',
 message: `ยืนยันการ Reset ข้อมูลชุดนี้หรือไม่?`,
 onConfirm: () => executeReset(action)
 });
 };

 const executeReset = async (action) => {
 try {
 if (action === 'RESET_QUOTAS') {
 const { error } = await supabase
 .from('pairing_data')
 .update({ clue1_edit_count: 0, clue2_edit_count: 0, clue3_edit_count: 0 })
 .not('senior_student_id', 'is', null);
 if (error) throw error;
 } else {
 let updateData = {};
 if (action === 'RESET_COOLDOWNS') updateData = { last_guess_at: null };
 else if (action === 'RESET_MESSAGES') updateData = { daily_messages_count: 0 };
 else if (action === 'RESET_QUIZ') updateData = { quiz_start_time: null };

 const { error } = await supabase
 .from('user_activity_states')
 .update(updateData)
 .not('user_id', 'is', null);
 if (error) throw error;
 }
 
 setAlertState({
 isOpen: true,
 type: 'success',
 title: 'SUCCESS',
 message: `${action} เรียบร้อยแล้ว!`,
 onConfirm: null 
 });
 
 fetchAdminData();
 } catch (error) { 
 setAlertState({
 isOpen: true,
 type: 'error',
 title: 'ERROR',
 message: error.message,
 onConfirm: null
 });
 }
 };

 if (loading) return <Loader text="LOADING" variant="admin" />;

 return (
 <div className="p-6 md:p-10 text-white w-full">
 <SystemAlert 
 {...alertState} 
 onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
 />

 <header className="mb-10 border-b border-red-500/30 pb-6">
 <h1 className="font-['Orbitron'] text-3xl text-red-500 font-bold tracking-widest flex items-center gap-3">
 <ShieldAlert className="animate-pulse" /> ADMIN CONTROL PANEL
 </h1>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
 <ResetCard title="Guess Cooldown" icon={RefreshCw} action="RESET_COOLDOWNS" desc="รีเซ็ตสิทธิ์การเดา" onReset={handleReset} />
 <ResetCard title="Message Limits" icon={MessageSquare} action="RESET_MESSAGES" desc="รีเซ็ตโควตาข้อความรายวัน" onReset={handleReset} />
 <ResetCard title="Reset Clue Limits" icon={BookOpen} action="RESET_QUOTAS" desc="รีเซ็ตโควตาการลบคำใบ้" onReset={handleReset} />
 <ResetCard title="Quiz Cooldown" icon={BrainCircuit} action="RESET_QUIZ" desc="รีเซ็ตสิทธิ์การทำควิซ" onReset={handleReset} />
 </div>

 <ClueTrackerBox seniors={seniors} />

 <UnifiedDirectoryBox seniors={seniors} juniors={juniors} onUploadClick={handleUploadClick} />
 
 <ImageCropperModal
 isOpen={cropperState.isOpen}
 onClose={() => setCropperState({ isOpen: false, senior: null })}
 description={cropperState.senior ? `อัปโหลดรูปภาพของ ${cropperState.senior.senior_full_name} (${cropperState.senior.senior_nickname})` : ''}
 aspectRatio={3/4}
 uploadFunction={async (file) => {
 if (!cropperState.senior) return;
 const publicUrl = await uploadSeniorPhoto(cropperState.senior.senior_student_id, file);
 await updateSeniorPhotoUrl(cropperState.senior.senior_student_id, publicUrl);
 }}
 onUploadSuccess={() => {
 fetchAdminData();
 setAlertState({
 isOpen: true,
 type: 'success',
 title: 'UPLOAD SUCCESS',
 message: 'อัปโหลดรูปภาพสำเร็จแล้ว!',
 onConfirm: null 
 });
 }}
 />
 </div>
 );
};

const ResetCard = ({ title, icon: Icon, action, desc, onReset }) => (
 <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] transition-all duration-300 flex flex-col h-full">
 <h2 className="font-['Orbitron'] text-lg font-bold mb-4 flex items-center gap-2"><Icon size={20} className="text-red-500" /> {title}</h2>
 <p className="text-sm md:text-base text-gray-400 mb-6 font-['Rajdhani'] flex-grow">{desc}</p>
 <button onClick={() => onReset(action)} className="mt-auto w-full bg-red-600/10 border border-red-600/50 text-red-400 py-3 rounded-lg hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all font-bold active:scale-95">RESET NOW</button>
 </div>
);

export default AdminDashboard;