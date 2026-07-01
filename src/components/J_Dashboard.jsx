import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './common/ErrorBoundary';

import JuniorProfileTab from './Junior_Dashboard/JuniorProfileTab';
import JuniorMissionsTab from './Junior_Dashboard/JuniorMissionsTab';
import JuniorDirectoryTab from './Junior_Dashboard/JuniorDirectoryTab';
import JuniorSidebar from './Junior_Dashboard/JuniorSidebar';
import MiniGames from './MiniGames/MiniGames';
import { useGameProgress } from '../hooks/useGameProgress';
import HomeworkHub from './Homework';

const J_Dashboard = ({ isAdmin }) => {
 const { tab } = useParams();
 const [userId, setUserId] = useState(null);
 const [userEmail, setUserEmail] = useState('');
 const [loading, setLoading] = useState(true);
 const [notification, setNotification] = useState({ isOpen: false, message: '' }); 

 const gameProgress = useGameProgress(userId);

 const notify = (msg) => {
 setNotification({ isOpen: true, message: msg });
 setTimeout(() => { setNotification({ isOpen: false, message: '' }); }, 3000);
 };

 const getDefaultAvatar = (role, identifier) => {
 if (!identifier) return 'https://avatar.iran.liara.run/public/boy?username=default';
 const num = parseInt(identifier, 10);
 let gender = 'boy'; 
 if (role === 'senior' && num >= 37273) gender = 'girl';
 else if (role === 'junior' && num >= 26 && num <= 40) gender = 'girl';
 return `https://avatar.iran.liara.run/public/${gender}?username=${num}`;
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

 if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#99eedd]" size={48} /></div>;

 return (
 <div className="flex w-full min-h-[100dvh] text-white">
 <JuniorSidebar activeTab={tab} isAdmin={isAdmin} />
 
 <div className="flex-1 w-full p-4 sm:p-6 md:p-10 relative overflow-x-hidden">
 <AnimatePresence>
 {notification.isOpen && (
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.3 }}
 className="fixed bottom-6 right-6 z-50 bg-[#08050f]/90 backdrop-blur-md border border-[#99eedd] p-4 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(153,238,221,0.2)]"
 >
 <CheckCircle className="text-[#99eedd]" size={20} />
 <span className="text-sm md:text-base font-['Rajdhani'] tracking-wider">{notification.message}</span>
 </motion.div>
 )}
 </AnimatePresence>
 
 <h1 className="font-['Orbitron'] text-2xl md:text-4xl text-[#99eedd] mb-6 md:mb-8 tracking-widest drop-shadow-[0_0_10px_rgba(153,238,221,0.5)] text-center md:text-left">
 JUNIOR_OS v1.0
 </h1>
 
 <AnimatePresence mode="wait">
 {tab === 'profile' && (
 <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
 <ErrorBoundary>
 <JuniorProfileTab userId={userId} userEmail={userEmail} notify={notify} getDefaultAvatar={getDefaultAvatar} gameProgress={gameProgress} />
 </ErrorBoundary>
 </motion.div>
 )}

 {tab === 'missions' && (
 <motion.div key="missions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
 <ErrorBoundary>
 <JuniorMissionsTab userId={userId} userEmail={userEmail} notify={notify} gameProgress={gameProgress} />
 </ErrorBoundary>
 </motion.div>
 )}
 
 {tab === 'directory' && (
 <motion.div key="directory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
 <ErrorBoundary>
 <JuniorDirectoryTab getDefaultAvatar={getDefaultAvatar} />
 </ErrorBoundary>
 </motion.div>
 )}

 {tab === 'activity' && (
 <motion.div key="activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
 <ErrorBoundary>
 <HomeworkHub userRole="junior" isAdmin={isAdmin} readOnly={true} />
 </ErrorBoundary>
 </motion.div>
 )}

 {tab === 'minigames' && (
 <motion.div key="minigames" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
 <MiniGames userId={userId} />
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
};

export default J_Dashboard;