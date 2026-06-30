import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api/seniorApi';
import * as activityApi from '../../api/activityApi';
import SeniorInboxBox from './comps/SeniorInboxBox';
import SeniorClueController from './comps/SeniorClueController';
import { InboxModal, ClueModal } from './comps/SeniorModals';
import { SeniorMissionsSkeleton } from '../common/Skeletons';

const SeniorMissionsTab = ({ userId, userEmail, notify, setSystemAlert, getDefaultAvatar }) => {
  const [clueData, setClueData] = useState([]);
  const [realMessages, setRealMessages] = useState([]);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [modal, setModal] = useState({ isOpen: false, content: '' });
  const [inboxModal, setInboxModal] = useState(false);

  const truncateText = (text) => text?.length > 25 ? text.substring(0, 25) + "..." : text;
  const formatTime = (isoString) => new Date(isoString).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cluesArray, juniors, activity] = await Promise.all([
          api.fetchSeniorClues(userEmail),
          api.fetchAllJuniors(),
          activityApi.fetchUserActivity(userId)
        ]);
        
        if (cluesArray) setClueData(cluesArray);
        if (activity) setActivityData(activity);
        
        if (juniors) {
          const msgs = await api.fetchInboxMessages(userEmail, juniors);
          setRealMessages(msgs);
        }
      } catch (error) {
        console.error("Error fetching missions data:", error);
      }
      setLoading(false);
    };
    if (userId && userEmail) fetchData();
  }, [userId, userEmail]);

  const submitClue = useCallback(async (clueField, clueValue, juniorStudentId) => {
    if (!clueValue.trim()) return;
    try {
      await api.updateClue(userEmail, clueField, clueValue, juniorStudentId);
      setClueData(prev => prev.map(c => c.junior_student_id === juniorStudentId ? { ...c, [clueField]: clueValue } : c));
      notify(`SYSTEM: ${clueField.toUpperCase()} Uploaded!`);
    } catch (error) { notify("ERROR: " + error.message); }
  }, [userEmail, notify]);

  const handleResetClue = useCallback((clueField, juniorStudentId, currentClueDataRow) => {
    const columnMap = { clue_1: 'clue1_edit_count', clue_2: 'clue2_edit_count', clue_3: 'clue3_edit_count' };
    const dbColumn = columnMap[clueField];
    const currentCount = currentClueDataRow ? (currentClueDataRow[dbColumn] || 0) : 0;
    
    if (currentCount >= 5) {
        setSystemAlert({ isOpen: true, type: 'error', title: 'QUOTA EXCEEDED', message: 'คุณลบคำใบ้นี้ครบ 5 ครั้งแล้ว', onConfirm: null, confirmText: 'CLOSE' });
        return;
    }
    setSystemAlert({
        isOpen: true, type: 'warning', title: 'CONFIRM DELETION', message: `ยืนยันการลบ ${clueField.toUpperCase()}? (เหลือสิทธิ์ ${5 - currentCount}/5)`, confirmText: 'CONFIRM DELETE',
        onConfirm: async () => {
            setSystemAlert(prev => ({ ...prev, isOpen: false }));
            try {
                await api.resetClue(userEmail, clueField, dbColumn, currentCount + 1, juniorStudentId);
                setClueData(prev => prev.map(c => c.junior_student_id === juniorStudentId ? { ...c, [clueField]: null, [dbColumn]: currentCount + 1 } : c));
                notify(`SYSTEM: ${clueField.toUpperCase()} ล้างข้อมูลเรียบร้อย!`);
            } catch (error) { notify("ERROR: " + error.message); }
        }
    });
  }, [userEmail, setSystemAlert, notify]);

  if (loading) return <SeniorMissionsSkeleton />;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="w-full">
          <SeniorInboxBox setInboxModal={setInboxModal} realMessages={realMessages} getDefaultAvatar={getDefaultAvatar} formatTime={formatTime}/>
        </div>
        <div className="w-full flex flex-col gap-6">
          {clueData.length > 0 ? (
            clueData.map((data, idx) => (
              <SeniorClueController 
                key={data.junior_student_id || idx} 
                clueData={data} 
                truncateText={truncateText} 
                setModal={setModal} 
                handleResetClue={handleResetClue} 
                submitClue={submitClue}
              />
            ))
          ) : (
             <div className="text-gray-500 bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 shadow-xl text-center">
                 ไม่พบข้อมูลน้องรหัสในระบบ
             </div>
          )}
        </div>
      </div>
      
      <InboxModal isOpen={inboxModal} onClose={() => setInboxModal(false)} realMessages={realMessages} getDefaultAvatar={getDefaultAvatar} formatTime={formatTime}/>
      <ClueModal isOpen={modal.isOpen} content={modal.content} onClose={() => setModal({ isOpen: false, content: '' })} notify={notify}/>
    </>
  );
};

export default SeniorMissionsTab;
