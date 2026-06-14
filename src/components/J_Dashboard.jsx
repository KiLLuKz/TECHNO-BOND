import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import 'animate.css';
import * as api from '../api/juniorApi';
import * as activityApi from '../api/activityApi';
import { _allTeaseLines, _quizBank } from '../data/quizData';

import ProfileBox from './Junior_Dashboard/ProfileBox';
import SeniorClueBoard from './Junior_Dashboard/SeniorClueBoard';
import TransmissionBox from './Junior_Dashboard/TransmissionBox';
import GuessPanel from './Junior_Dashboard/GuessPanel';
import BonusPanel from './Junior_Dashboard/BonusPanel';
import QuizModal from './Junior_Dashboard/QuizModal';
import ClueModal from './Junior_Dashboard/ClueModal';
import SeniorDirectoryBox from './Junior_Dashboard/SeniorDirectoryBox';

const J_Dashboard = () => {
  const [activityData, setActivityData] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [clueData, setClueData] = useState(null);
  const [profile, setProfile] = useState({ username: '', avatar_url: '', student_id: '' });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, content: '' });
  const [notification, setNotification] = useState({ isOpen: false, message: '' }); 
  const [isSaving, setIsSaving] = useState(false);
  
  const [messageText, setMessageText] = useState('');
  const [messagesLeft, setMessagesLeft] = useState(3);
  const [isSending, setIsSending] = useState(false);

  const [isQuizPassed, setIsQuizPassed] = useState(false);
  const [quizModal, setQuizModal] = useState(false);
  const [quizState, setQuizState] = useState({ step: 'playing', score: 0, currentIndex: 0 });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [randomizedBank, setRandomizedBank] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  const [guessInput, setGuessInput] = useState('');
  const [guessFeedback, setGuessFeedback] = useState('');
  const [nextGuessDate, setNextGuessDate] = useState(null);
  const [canGuess, setCanGuess] = useState(true);
  const [isGameCleared, setIsGameCleared] = useState(false);

  // ---> เพิ่ม State สำหรับรายชื่อพี่รหัส
  const [realSeniors, setRealSeniors] = useState([]);

  const notify = (msg) => {
    setNotification({ isOpen: true, message: msg });
    setTimeout(() => { setNotification({ isOpen: false, message: '' }); }, 3000);
  };

  const truncateClue = (text) => text?.length > 20 ? text.substring(0, 20) + "......" : text;
  const getDefaultAvatar = (role, identifier) => {
    if (!identifier) return 'https://avatar.iran.liara.run/public/boy?username=default';
    const num = parseInt(identifier, 10);
    let gender = 'boy'; 
    if (role === 'senior' && num >= 37273) gender = 'girl';
    else if (role === 'junior' && num >= 26 && num <= 40) gender = 'girl';
    return `https://avatar.iran.liara.run/public/${gender}?username=${num}`;
  };

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const studentId = user.email.split('@')[0];
        
        const { clue, prof } = await api.fetchDashboardData(studentId, user.id);
        const activity = await activityApi.fetchUserActivity(user.id);

        setActivityData(activity);

        if (activity.last_guess_at) {
          const lastGuessDate = new Date(activity.last_guess_at).toDateString();
          const today = new Date().toDateString();
            
          // ถ้าวันที่เดาล่าสุดเป็นวันนี้ แสดงว่ายังเดาไม่ได้
          if (lastGuessDate === today) {
              setCanGuess(false);
          } else {
              setCanGuess(true);
          }
        }

        if (clue) setClueData(clue);
        setProfile(prof || { username: studentId, avatar_url: '', student_id: studentId });
        
        // แทนที่ localStorage ด้วยค่าจาก Database
        setMessagesLeft(Math.max(0, 3 - activity.daily_messages_count));
        setIsQuizPassed(activity.quiz_passed);
        setIsGameCleared(activity.is_guessed);
        // ------------------

        // ส่วนที่เหลือเก็บไว้เหมือนเดิม
        const questions = await api.fetchQuizQuestions();
        setQuizQuestions(questions?.length >= 10 ? questions : _quizBank);
        
        // ... (ส่วนดึง realSeniors คงเดิม)
        setLoading(false);
      } else {
        // ถ้าไม่มี User ให้เด้งไปหน้า Login หรือทำอะไรสักอย่าง
        // setLoading(false); // ห้ามปลดล็อกถ้าไม่มี User
      }
    };
    initData();
  }, []);

  const handleUploadAvatar = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const { data: { user } } = await supabase.auth.getUser();
      const publicUrl = await api.uploadAvatar(user.id, file);
      await api.updateProfile(user.id, { avatar_url: publicUrl, username: profile.username, student_id: profile.student_id });
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      notify("SYSTEM: Avatar updated successfully!");
    } catch (error) { notify("ERROR: " + error.message); }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await api.updateProfile(user.id, { username: profile.username, avatar_url: profile.avatar_url, student_id: profile.student_id });
    notify("SYSTEM: Profile updated successfully!");
    setIsSaving(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || messagesLeft <= 0 || !clueData?.senior_email || !userId) return;
    setIsSending(true);
    try {
        await api.sendJuniorMessage(clueData.student_id, clueData.senior_email, messageText);
        
        const newCount = (3 - messagesLeft) + 1;
        await activityApi.updateActivity(userId, { daily_messages_count: newCount });
        
        setMessagesLeft(3 - newCount);
        setMessageText('');
        notify("SYSTEM: Transmission sent to Senior!");
    } catch (error) { notify("ERROR: " + error.message); }
    setIsSending(false);
  };

  const handleGuessSubmit = async () => {
      if (!guessInput.trim() || !canGuess || !clueData?.senior_nickname || !userId) return;
      
      const normalize = (str) => str.trim().replace(/\s+/g, '').toLowerCase();
      const userGuess = normalize(guessInput);
      const correctGuess = normalize(clueData.senior_nickname);

      if (userGuess === correctGuess) {
          await activityApi.updateActivity(userId, { is_guessed: true });
          setIsGameCleared(true);
          setGuessFeedback('✅ CORRECT PROTOCOL! คุณหาพี่รหัสเจอแล้ว!');
          notify('SYSTEM: MISSION ACCOMPLISHED!');
      } else {
          const randomTease = _allTeaseLines[Math.floor(Math.random() * _allTeaseLines.length)];
          setGuessFeedback(randomTease);
          await activityApi.updateActivity(userId, { last_guess_at: new Date().toISOString() });
          setCanGuess(false);
          setGuessInput('');
          notify("SYSTEM: PROTOCOL FAILED. TIER-2 LOCK ACTIVATED.");
      }
  };

  const checkCooldown = () => {
    if (!activityData?.quiz_start_time) return null;
    const startTime = new Date(activityData.quiz_start_time).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (now - startTime) / (60 * 1000);
    if (diffInMinutes < 15) return Math.ceil(15 - diffInMinutes);
    return null;
  };

  const startQuiz = async () => {
    // เพิ่มตัวเช็คนี้เข้าไป
    if (!userId) {
        notify("SYSTEM: ข้อมูลผู้ใช้ยังไม่พร้อม กรุณารอโหลดสักครู่");
        return;
    }

    const minsLeft = checkCooldown();
    if (minsLeft !== null) {
        notify(`SYSTEM: ใจเย็นวัยรุ่น! ติดคูลดาวน์อยู่ รออีก ${minsLeft} นาที`);
        return;
    }
    const now = new Date().toISOString();
    await activityApi.updateActivity(userId, { quiz_start_time: now });
    setActivityData(prev => ({ ...prev, quiz_start_time: now }));

    setSelectedOption(null); 
    setIsAnswerCorrect(null);
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setRandomizedBank(shuffled);
    setQuizState({ step: 'playing', score: 0, currentIndex: 0 });
    setQuizModal(true);
  };

  const handleAnswer = async (selectedOpt) => {
    if (selectedOption !== null || !userId) return; // เพิ่ม !userId

    const isCorrect = selectedOpt === randomizedBank[quizState.currentIndex].answer;
    setSelectedOption(selectedOpt);
    setIsAnswerCorrect(isCorrect);
    
    setTimeout(async () => {
        const newScore = isCorrect ? quizState.score + 1 : quizState.score;
        if (quizState.currentIndex + 1 < 10) {
            setQuizState({ ...quizState, score: newScore, currentIndex: quizState.currentIndex + 1 });
            setSelectedOption(null); setIsAnswerCorrect(null);
        } else {
            if (newScore >= 7) { 
                setIsQuizPassed(true); 
                // เพิ่ม guard เพื่อความปลอดภัย
                if (userId) await activityApi.updateActivity(userId, { quiz_passed: true });
            }
            setQuizState({ step: 'result', score: newScore, currentIndex: 0 });
        }
    }, 1200);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[#99eedd]" size={48} /></div>;

  const now = new Date();
  const isClue2Unlocked = clueData?.clue_2 && (now >= new Date('2026-06-15')) && isQuizPassed;
  const isClue3Unlocked = clueData?.clue_3 && (now >= new Date('2026-06-20')) && isQuizPassed;

  return (
    <div className="min-h-screen p-6 md:p-10 font-['Orbitron'] text-white">
      {notification.isOpen && (
        <div className="fixed top-6 right-6 z-50 bg-[#08050f]/90 backdrop-blur-md border border-[#99eedd] p-4 rounded-xl flex items-center gap-3 animate__animated animate__fadeInRight shadow-[0_0_15px_rgba(153,238,221,0.2)]">
            <CheckCircle className="text-[#99eedd]" size={20} />
            <span className="text-sm font-['Rajdhani'] tracking-wider">{notification.message}</span>
        </div>
      )}
      <h1 className="text-3xl text-[#99eedd] mb-8">JUNIOR_OS v1.0</h1>
      
      {/* แถวที่ 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <ProfileBox profile={profile} setProfile={setProfile} handleUploadAvatar={handleUploadAvatar} handleUpdateProfile={handleUpdateProfile} isSaving={isSaving} defaultAvatar={getDefaultAvatar('junior', clueData?.id)}/>
        <SeniorClueBoard clueData={clueData} isClue2Unlocked={isClue2Unlocked} isClue3Unlocked={isClue3Unlocked} setModal={setModal} truncateClue={truncateClue} />
        <TransmissionBox messagesLeft={messagesLeft} messageText={messageText} setMessageText={setMessageText} handleSendMessage={handleSendMessage} hasSeniorEmail={!!clueData?.senior_email} />
      </div>
      
      {/* แถวที่ 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <GuessPanel isGameCleared={isGameCleared} canGuess={canGuess} guessInput={guessInput} setGuessInput={setGuessInput} handleGuessSubmit={handleGuessSubmit} guessFeedback={guessFeedback} nextGuessDate={nextGuessDate} />
        <BonusPanel isQuizPassed={isQuizPassed} startQuiz={startQuiz} />
      </div>

      {/* แถวที่ 3 (ใหม่): ตารางโปรไฟล์พี่รหัส */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SeniorDirectoryBox seniors={realSeniors} getDefaultAvatar={getDefaultAvatar} />
      </div>

      {/* Modals */}
      <QuizModal isOpen={quizModal} onClose={() => setQuizModal(false)} quizState={quizState} startQuiz={startQuiz} randomizedBank={randomizedBank} selectedOption={selectedOption} isAnswerCorrect={isAnswerCorrect} handleAnswer={handleAnswer} />
      <ClueModal isOpen={modal.isOpen} content={modal.content} onClose={() => setModal({ isOpen: false, content: '' })} notify={notify} />
    </div>
  );
};

export default J_Dashboard;