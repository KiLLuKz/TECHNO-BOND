import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import * as api from '../api/seniorApi'; 
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
  const [allJuniors, setAllJuniors] = useState([]);
  const [myJuniorIds, setMyJuniorIds] = useState([]);
  
  const [newClues, setNewClues] = useState({ clue_1: '', clue_2: '', clue_3: '' });
  const [modal, setModal] = useState({ isOpen: false, content: '' });
  const [inboxModal, setInboxModal] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, message: '' });
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          setUserId(user.id);
          setUserEmail(user.email);
          const currentStudentId = user.email.split('@')[0];
          
          try {
              const prof = await api.fetchSeniorProfile(user.id, user.email);
              setProfile(prof);
              const clue = await api.fetchSeniorClues(user.email);
              if (clue) setClueData(clue);
              
              // ดึงน้องทุกคนมา
              const juniors = await api.fetchAllJuniors();
              setAllJuniors(juniors);
              
              // กรอง ID ของน้องที่อยู่ในสายรหัสเราเพื่อทำ Highlight
              const myIds = juniors
                .filter(j => j.senior_student_id === currentStudentId)
                .map(j => j.junior_id);
              setMyJuniorIds(myIds);

              const msgs = await api.fetchInboxMessages(user.email, juniors);
              setRealMessages(msgs);
          } catch (error) { console.error("Error:", error); }
          setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUploadAvatar = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const { data: { user } } = await supabase.auth.getUser();
      const publicUrl = await api.uploadAvatar(user.id, file);
      await api.updateProfile(user.id, { avatar_url: publicUrl, username: profile.username, student_id: user.email.split('@')[0] });
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      notify("SYSTEM: Avatar updated!");
    } catch (error) { notify("ERROR: " + error.message); }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await api.updateProfile(user.id, { username: profile.username, avatar_url: profile.avatar_url, student_id: user.email.split('@')[0] });
        notify("SYSTEM: Profile saved!");
    } catch (error) { notify("ERROR: " + error.message); }
    setIsSaving(false);
  };

  const submitClue = async (clueField, clueValue) => {
    if (!clueValue.trim()) return;
    try {
      await api.updateClue(userEmail, clueField, clueValue);
      setClueData(prev => ({ ...prev, [clueField]: clueValue }));
      setNewClues(prev => ({ ...prev, [clueField]: '' }));
      notify(`SYSTEM: ${clueField.toUpperCase()} Uploaded!`);
    } catch (error) { notify("ERROR: " + error.message); }
  };

  const handleResetClue = (clueField) => {
    const columnMap = { clue_1: 'clue1_edit_count', clue_2: 'clue2_edit_count', clue_3: 'clue3_edit_count' };
    const dbColumn = columnMap[clueField];
    const currentCount = activityData ? activityData[dbColumn] : 0;
    if (currentCount >= 5) {
        setSystemAlert({ isOpen: true, type: 'error', title: 'QUOTA EXCEEDED', message: 'คุณลบคำใบ้นี้ครบ 5 ครั้งแล้ว', onConfirm: null });
        return;
    }
    setSystemAlert({
        isOpen: true, type: 'warning', title: 'CONFIRM DELETION', message: `ยืนยันการลบ ${clueField.toUpperCase()}? (เหลือสิทธิ์ ${5 - currentCount}/5)`, confirmText: 'CONFIRM DELETE',
        onConfirm: async () => {
            setSystemAlert(prev => ({ ...prev, isOpen: false }));
            try {
                await api.updateClue(userEmail, clueField, null);
                await activityApi.updateActivity(userId, { [dbColumn]: currentCount + 1 });
                setClueData(prev => ({ ...prev, [clueField]: null }));
                setActivityData(prev => ({ ...prev, [dbColumn]: currentCount + 1 }));
                notify(`SYSTEM: ${clueField.toUpperCase()} ล้างข้อมูลเรียบร้อย!`);
            } catch (error) { notify("ERROR: " + error.message); }
        }
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#d966ff]" size={48} /></div>;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 font-['Orbitron'] text-white relative overflow-y-auto overflow-x-hidden w-full max-w-[100vw]">
      <SystemAlert isOpen={systemAlert.isOpen} type={systemAlert.type} title={systemAlert.title} message={systemAlert.message} confirmText={systemAlert.confirmText} onConfirm={systemAlert.onConfirm} onClose={() => setSystemAlert({ ...systemAlert, isOpen: false })} />
      {notification.isOpen && (
        <div className="fixed top-6 right-6 z-50 bg-[#08050f]/90 backdrop-blur-md border border-[#d966ff] p-4 rounded-xl flex items-center gap-3 animate__animated animate__fadeInRight shadow-[0_0_15px_rgba(217,102,255,0.2)]">
            <CheckCircle className="text-[#d966ff]" size={20} />
            <span className="text-sm font-['Rajdhani'] tracking-wider">{notification.message}</span>
        </div>
      )}
      
      <h1 className="text-2xl md:text-4xl text-[#d966ff] mb-6 md:mb-8 tracking-widest drop-shadow-[0_0_10px_rgba(217,102,255,0.5)] break-words text-center md:text-left">
        SENIOR_CENTER
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="w-full overflow-hidden"><SeniorProfileBox profile={profile} setProfile={setProfile} userEmail={userEmail} getDefaultAvatar={getDefaultAvatar} handleUploadAvatar={handleUploadAvatar} handleUpdateProfile={handleUpdateProfile} isSaving={isSaving}/></div>
        <div className="w-full overflow-hidden"><SeniorInboxBox setInboxModal={setInboxModal} realMessages={realMessages} getDefaultAvatar={getDefaultAvatar} formatTime={formatTime}/></div>
        <div className="w-full overflow-hidden sm:col-span-2"><SeniorClueController clueData={clueData} truncateText={truncateText} setModal={setModal} handleResetClue={handleResetClue} newClues={newClues} setNewClues={setNewClues} submitClue={submitClue}/></div>
        <div className="w-full overflow-hidden sm:col-span-2 lg:col-span-4">
        <JuniorDirectoryBox 
            allJuniors={allJuniors} 
            myJuniorIds={myJuniorIds} 
            getDefaultAvatar={getDefaultAvatar} 
            />
        </div>
      </div>
      
      <InboxModal isOpen={inboxModal} onClose={() => setInboxModal(false)} realMessages={realMessages} getDefaultAvatar={getDefaultAvatar} formatTime={formatTime}/>
      <ClueModal isOpen={modal.isOpen} content={modal.content} onClose={() => setModal({ isOpen: false, content: '' })} notify={notify}/>
    </div>
  );
};

export default S_Dashboard;