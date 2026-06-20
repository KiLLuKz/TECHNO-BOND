import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SystemAlert from './SystemAlert'; 
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './common/ErrorBoundary';

import SeniorProfileTab from './Senior_Dashboard/SeniorProfileTab';
import SeniorMissionsTab from './Senior_Dashboard/SeniorMissionsTab';
import SeniorDirectoryTab from './Senior_Dashboard/SeniorDirectoryTab';
import HomeworkHub from './Homework';
import SeniorSidebar from './Senior_Dashboard/SeniorSidebar';
import MiniGames from './MiniGames/MiniGames';
import AdminDashboard from './AdminDashboard';

const S_Dashboard = ({ isAdmin }) => {
  const { tab } = useParams();
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [notification, setNotification] = useState({ isOpen: false, message: '' });
  const [systemAlert, setSystemAlert] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null, confirmText: 'CONFIRM' });

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          setUserId(user.id);
          setUserEmail(user.email);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#d966ff]" size={48} /></div>;

  return (
    <div className="flex w-full min-h-[100dvh] font-['Orbitron'] text-white">
      <SeniorSidebar activeTab={tab} isAdmin={isAdmin} />
      
      <div className="flex-1 w-full p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
        <SystemAlert isOpen={systemAlert.isOpen} type={systemAlert.type} title={systemAlert.title} message={systemAlert.message} confirmText={systemAlert.confirmText} onConfirm={systemAlert.onConfirm} onClose={() => setSystemAlert({ ...systemAlert, isOpen: false })} />
      <AnimatePresence>
      {notification.isOpen && (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 bg-[#08050f]/90 backdrop-blur-md border border-[#d966ff] p-4 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(217,102,255,0.2)]"
        >
            <CheckCircle className="text-[#d966ff]" size={20} />
            <span className="text-sm font-['Rajdhani'] tracking-wider">{notification.message}</span>
        </motion.div>
      )}
      </AnimatePresence>
      
      <h1 className="text-2xl md:text-4xl text-[#d966ff] mb-6 md:mb-8 tracking-widest drop-shadow-[0_0_10px_rgba(217,102,255,0.5)] text-center md:text-left">
        SENIOR_CENTER
      </h1>

      <div className="w-full relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
              <ErrorBoundary>
                <SeniorProfileTab userId={userId} userEmail={userEmail} notify={notify} getDefaultAvatar={getDefaultAvatar} />
              </ErrorBoundary>
            </motion.div>
          )}
          
          {tab === 'homework' && (
            <motion.div key="homework" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
              <ErrorBoundary>
                <HomeworkHub userRole="senior" isAdmin={isAdmin} readOnly={!isAdmin} />
              </ErrorBoundary>
            </motion.div>
          )}

          {tab === 'missions' && (
            <motion.div key="missions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
              <ErrorBoundary>
                <SeniorMissionsTab userId={userId} userEmail={userEmail} notify={notify} setSystemAlert={setSystemAlert} getDefaultAvatar={getDefaultAvatar} />
              </ErrorBoundary>
            </motion.div>
          )}

          {tab === 'directory' && (
            <motion.div key="directory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
              <ErrorBoundary>
                <SeniorDirectoryTab userEmail={userEmail} getDefaultAvatar={getDefaultAvatar} />
              </ErrorBoundary>
            </motion.div>
          )}

          {tab === 'minigames' && (
            <motion.div key="minigames" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
              <MiniGames />
            </motion.div>
          )}

          {tab === 'admin' && isAdmin && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default S_Dashboard;