import React, { useState, useEffect } from 'react';
import { Terminal, MessageSquare, Loader2, X, Clipboard, Save, Upload, User, CheckCircle, Users, Send, Clock, Maximize2, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import * as api from '../api/seniorApi'; // <--- Import API ที่เราแยกไว้
import SystemAlert from './SystemAlert'; 
import * as activityApi from '../api/activityApi';
import 'animate.css';

import SeniorProfileBox from './Senior_Dashboard/SeniorProfileBox';
import SeniorInboxBox from './Senior_Dashboard/SeniorInboxBox';
import SeniorClueController from './Senior_Dashboard/SeniorClueController';
import JuniorDirectoryBox from './Senior_Dashboard/JuniorDirectoryBox';
import { InboxModal, ClueModal } from './Senior_Dashboard/SeniorModals';

const S_Dashboard = () => {
  const [profile, setProfile] = useState({ username: '', avatar_url: '' });
  const [clueData, setClueData] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [newClues, setNewClues] = useState({ clue1: '', clue2: '', clue3: '' });
  const [modal, setModal] = useState({ isOpen: false, content: '' });
  const [inboxModal, setInboxModal] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // State สำหรับคุม Custom Alert
  const [systemAlert, setSystemAlert] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null, confirmText: 'CONFIRM' });

  const [realMessages, setRealMessages] = useState([]);
  const [realJuniors, setRealJuniors] = useState([]);

  const getDefaultAvatar = (role, identifier) => {
    if (!identifier) return 'https://avatar.iran.liara.run/public/boy?username=default';
    const num = parseInt(identifier, 10);
    let gender = 'boy'; 
    if (role === 'senior' && num >= 37273) gender = 'girl';
    else if (role === 'junior' && num >= 26 && num <= 40) gender = 'girl';
    return `https://avatar.iran.liara.run/public/${gender}?username=${num}`;
  };

  const notify = (msg) => {
    setNotification({ isOpen: true, message: msg });
    setTimeout(() => setNotification({ isOpen: false, message: '' }), 3000);
  };

  const truncateText = (text) => text?.length > 25 ? text.substring(0, 25) + "..." : text;

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  };

  // --- 1. INIT DATA (ใช้ API ที่แยกไว้) ---
  useEffect(() => {
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUserId(user.id);
        setUserEmail(user.email);
        
        try {
            const prof = await api.fetchSeniorProfile(user.id, user.email);
            setProfile(prof);

            const clue = await api.fetchSeniorClues(user.email);
            if (clue) setClueData(clue);

            // ดึง Activity Data จากตารางที่เราสร้างไว้
            const activity = await activityApi.fetchUserActivity(user.id);
            setActivityData(activity);

            const juniors = await api.fetchJuniorDirectory(user.email);
            setRealJuniors(juniors);

            const msgs = await api.fetchInboxMessages(user.email, juniors);
            setRealMessages(msgs);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
        setLoading(false);
    }
  };
  fetchData();
}, []);

  // --- 2. ACTIONS (ใช้ API ที่แยกไว้) ---
  const handleUploadAvatar = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const { data: { user } } = await supabase.auth.getUser();
      
      const publicUrl = await api.uploadAvatar(user.id, file);
      await api.updateProfile(user.id, {
          avatar_url: publicUrl,
          username: profile.username,
          student_id: user.email.split('@')[0]
      });
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      notify("SYSTEM: Avatar updated!");
    } catch (error) { notify("ERROR: " + error.message); }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await api.updateProfile(user.id, {
            username: profile.username,
            avatar_url: profile.avatar_url,
            student_id: user.email.split('@')[0]
        });
        notify("SYSTEM: Profile saved!");
    } catch (error) {
        notify("ERROR: " + error.message);
    }
    setIsSaving(false);
  };

  const submitClue = async (clueField, clueValue) => {
    if (!clueValue.trim()) return;
    try {
      await api.updateClue(userEmail, clueField, clueValue);
      setClueData(prev => ({ ...prev, [clueField]: clueValue }));
      setNewClues(prev => ({ ...prev, [clueField.replace('_', '')]: '' }));
      notify(`SYSTEM: ${clueField.toUpperCase()} Uploaded!`);
    } catch (error) { notify("ERROR: " + error.message); }
  };

  const handleResetClue = (clueField) => {
    // Map ชื่อ field ไปยังคอลัมน์ใน DB
    const columnMap = {
        clue_1: 'clue1_edit_count',
        clue_2: 'clue2_edit_count',
        clue_3: 'clue3_edit_count'
    };
    
    const dbColumn = columnMap[clueField];
    const currentCount = activityData ? activityData[dbColumn] : 0;

    if (currentCount >= 5) {
        setSystemAlert({
            isOpen: true,
            type: 'error',
            title: 'QUOTA EXCEEDED',
            message: 'คุณลบคำใบ้นี้ครบ 5 ครั้งแล้ว กรุณารอวันพรุ่งนี้',
            onConfirm: null
        });
        return;
    }

    setSystemAlert({
        isOpen: true,
        type: 'warning',
        title: 'CONFIRM DELETION',
        message: `ยืนยันการลบ ${clueField.toUpperCase()}? (เหลือสิทธิ์ ${5 - currentCount}/5 ครั้งของวันนี้)`,
        confirmText: 'CONFIRM DELETE',
        onConfirm: async () => {
            setSystemAlert(prev => ({ ...prev, isOpen: false }));
            try {
                // 1. อัปเดตคำใบ้ใน DB (ให้เป็น null)
                await api.updateClue(userEmail, clueField, null);
                
                // 2. อัปเดต Quota ใน DB (บวกเลข count ขึ้นไป)
                await activityApi.updateActivity(userId, { 
                    [dbColumn]: currentCount + 1 
                });
                
                // 3. อัปเดต State หน้าจอ
                setClueData(prev => ({ ...prev, [clueField]: null }));
                setActivityData(prev => ({ ...prev, [dbColumn]: currentCount + 1 }));
                
                notify(`SYSTEM: ${clueField.toUpperCase()} ล้างข้อมูลเรียบร้อย!`);
            } catch (error) { 
                notify("ERROR: " + error.message); 
            }
        }
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#d966ff]" size={48} /></div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-['Orbitron'] text-white relative">
      
      {/* Component Custom Alert */}
      <SystemAlert 
        isOpen={systemAlert.isOpen}
        type={systemAlert.type}
        title={systemAlert.title}
        message={systemAlert.message}
        confirmText={systemAlert.confirmText}
        onConfirm={systemAlert.onConfirm}
        onClose={() => setSystemAlert({ ...systemAlert, isOpen: false })}
      />

      {notification.isOpen && (
        <div className="fixed top-6 right-6 z-50 bg-[#08050f]/90 backdrop-blur-md border border-[#d966ff] p-4 rounded-xl flex items-center gap-3 animate__animated animate__fadeInRight shadow-[0_0_15px_rgba(217,102,255,0.2)]">
            <CheckCircle className="text-[#d966ff]" size={20} />
            <span className="text-sm font-['Rajdhani'] tracking-wider">{notification.message}</span>
        </div>
      )}

      <h1 className="text-3xl md:text-4xl text-[#d966ff] mb-8 tracking-widest drop-shadow-[0_0_10px_rgba(217,102,255,0.5)]">SENIOR_COMMAND_CENTER</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Profile Box */}
        <SeniorProfileBox 
            profile={profile}
            setProfile={setProfile}
            userEmail={userEmail}
            getDefaultAvatar={getDefaultAvatar}
            handleUploadAvatar={handleUploadAvatar}
            handleUpdateProfile={handleUpdateProfile}
            isSaving={isSaving}
        />

        {/* Inbox Box */}
        <SeniorInboxBox 
            setInboxModal={setInboxModal}
            realMessages={realMessages}
            getDefaultAvatar={getDefaultAvatar}
            formatTime={formatTime}
        />

        {/* Clue Management */}
        <SeniorClueController 
            clueData={clueData}
            truncateText={truncateText}
            setModal={setModal}
            handleResetClue={handleResetClue}
            newClues={newClues}
            setNewClues={setNewClues}
            submitClue={submitClue}
        />

        {/* Junior Directory Box */}
        <JuniorDirectoryBox 
            realJuniors={realJuniors} 
            getDefaultAvatar={getDefaultAvatar} 
        />
      </div>

      {/* เรียกใช้ Inbox Modal */}
      <InboxModal 
        isOpen={inboxModal} 
        onClose={() => setInboxModal(false)} 
        realMessages={realMessages} 
        getDefaultAvatar={getDefaultAvatar} 
        formatTime={formatTime} 
      />

      {/* เรียกใช้ Clue Modal */}
      <ClueModal 
        isOpen={modal.isOpen} 
        content={modal.content} 
        onClose={() => setModal({ isOpen: false, content: '' })} 
        notify={notify} 
      />
    </div>
  );
};

export default S_Dashboard;