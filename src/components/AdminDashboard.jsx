import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, MessageSquare, BookOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import UnifiedDirectoryBox from './Admin_Dashboard/UnifiedDirectoryBox';
import Loader from './Loader';
import SystemAlert from './SystemAlert'; // <--- Import Component ของคุณ

const AdminDashboard = () => {
  const [seniors, setSeniors] = useState([]);
  const [juniors, setJuniors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับควบคุม Modal Alert
  const [alertState, setAlertState] = useState({ 
    isOpen: false, type: 'info', title: '', message: '', onConfirm: null 
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: allProfiles } = await supabase.from('profiles').select('*');
    const { data: allClues } = await supabase.from('junior_clues').select('*');

    if (allProfiles && allClues) {
      const seniorMap = new Map();
      allClues.forEach(clue => {
        if (clue.senior_email) {
          const sId = clue.senior_email.split('@')[0];
          if (!seniorMap.has(sId)) {
            seniorMap.set(sId, { student_id: sId, senior_nickname: clue.senior_nickname });
          }
        }
      });
      const allSeniors = Array.from(seniorMap.values()).map(senior => {
        const profile = allProfiles.find(p => String(p.student_id) === String(senior.student_id));
        return { ...senior, ...(profile || {}), id: profile ? profile.id : senior.student_id };
      });
      const juniorsWithProfile = allClues.map(clue => {
        const profile = allProfiles.find(p => String(p.student_id) === String(clue.student_id));
        return { ...clue, ...(profile || {}) };
      });
      setSeniors(allSeniors);
      setJuniors(juniorsWithProfile);
    }
    setLoading(false);
  };

  // ขั้นตอนที่ 1: เรียกหน้า Modal ยืนยัน
  const handleReset = (action) => {
    setAlertState({
      isOpen: true,
      type: 'warning',
      title: 'CONFIRM RESET',
      message: `ยืนยันการ Reset ข้อมูลชุดนี้หรือไม่?`,
      onConfirm: () => executeReset(action)
    });
  };

  // ขั้นตอนที่ 2: ทำงานจริงหลังจากกด Confirm
  const executeReset = async (action) => {
    try {
      let updateData = {};
      if (action === 'RESET_COOLDOWNS') updateData = { last_guess_at: null };
      else if (action === 'RESET_MESSAGES') updateData = { daily_messages_count: 0 };
      else if (action === 'RESET_QUOTAS') updateData = { clue1_edit_count: 0, clue2_edit_count: 0, clue3_edit_count: 0 };

      const { error } = await supabase
        .from('user_activity_states')
        .update(updateData)
        .not('user_id', 'is', null);

      if (error) throw error;
      
      // อัปเดตเสร็จแล้ว แสดง Success Alert
      setAlertState({
        isOpen: true,
        type: 'success',
        title: 'SUCCESS',
        message: `${action} เรียบร้อยแล้ว!`,
        onConfirm: null // ไม่มีปุ่ม Cancel ให้กด
      });
      
      fetchAdminData();
    } catch (error) { 
      // กรณี Error แสดง Error Alert
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
      {/* ใส่ Modal ตรงนี้ */}
      <SystemAlert 
        {...alertState} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
      />

      <header className="mb-10 border-b border-red-500/30 pb-6">
        <h1 className="text-3xl text-red-500 font-bold tracking-widest flex items-center gap-3">
          <ShieldAlert className="animate-pulse" /> ADMIN CONTROL PANEL
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ResetCard title="Guess Cooldown" icon={RefreshCw} action="RESET_COOLDOWNS" desc="รีเซ็ตสิทธิ์การเดา" onReset={handleReset} />
        <ResetCard title="Message Limits" icon={MessageSquare} action="RESET_MESSAGES" desc="รีเซ็ตโควตาข้อความรายวัน" onReset={handleReset} />
        <ResetCard title="Reset Clue Limits" icon={BookOpen} action="RESET_QUOTAS" desc="รีเซ็ตโควตาการลบคำใบ้" onReset={handleReset} />
      </div>

      <UnifiedDirectoryBox seniors={seniors} juniors={juniors} />
    </div>
  );
};

const ResetCard = ({ title, icon: Icon, action, desc, onReset }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-red-500/50 transition-all duration-300">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon size={20} className="text-red-500" /> {title}</h2>
        <p className="text-sm text-gray-400 mb-4">{desc}</p>
        <button onClick={() => onReset(action)} className="w-full bg-red-600/10 border border-red-600/50 text-red-400 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold">RESET NOW</button>
    </div>
);

export default AdminDashboard;