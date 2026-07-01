import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../api/juniorApi';
import * as activityApi from '../../api/activityApi';
import { _allTeaseLines, _quizBank } from '../../data/quizData';

import SeniorClueBoard from './comps/SeniorClueBoard';
import TransmissionBox from './comps/TransmissionBox';
import GuessPanel from './comps/GuessPanel';
import BonusPanel from './comps/BonusPanel';
import QuizModal from './comps/QuizModal';
import ClueModal from './comps/ClueModal';
import GameQuestPanel from './comps/GameQuestPanel';
import { JuniorMissionsSkeleton } from '../common/Skeletons';

const JuniorMissionsTab = ({ userId, userEmail, notify, gameProgress }) => {
 const [clueData, setClueData] = useState(null);
 const [activityData, setActivityData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [modal, setModal] = useState({ isOpen: false, content: '' });
 
 const [messageText, setMessageText] = useState('');
 const [messagesLeft, setMessagesLeft] = useState(3);
 
 const [isQuizPassed, setIsQuizPassed] = useState(false);
 const [quizModal, setQuizModal] = useState(false);
 const [quizState, setQuizState] = useState({ step: 'playing', score: 0, currentIndex: 0 });
 const [quizQuestions, setQuizQuestions] = useState([]);
 const [randomizedBank, setRandomizedBank] = useState([]);
 const [selectedOption, setSelectedOption] = useState(null);
 const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

 const [guessInput, setGuessInput] = useState('');
 const [guessFeedback, setGuessFeedback] = useState('');
 const [canGuess, setCanGuess] = useState(true);
 const [isGameCleared, setIsGameCleared] = useState(false);

 const truncateClue = (text) => text?.length > 20 ? text.substring(0, 20) +"......" : text;

 useEffect(() => {
 const initData = async () => {
 try {
 const studentId = userEmail?.split('@')[0];
 
 const [dashboardData, activity, questions] = await Promise.all([
 api.fetchDashboardData(studentId, userId),
 activityApi.fetchUserActivity(userId),
 api.fetchQuizQuestions()
 ]);
 
 if (dashboardData?.clue) setClueData(dashboardData.clue);
 if (activity) {
 setActivityData(activity);
 if (activity.last_guess_at) {
 const lastGuessDate = new Date(activity.last_guess_at).toDateString();
 const today = new Date().toDateString();
 setCanGuess(lastGuessDate !== today);
 }
 setMessagesLeft(Math.max(0, 3 - (activity.daily_messages_count || 0)));
 setIsQuizPassed(activity.quiz_passed || false);
 setIsGameCleared(activity.is_guessed || false);
 }
 
 setQuizQuestions(questions?.length >= 10 ? questions : _quizBank);
 } catch (error) {
 console.error("Error fetching missions data:", error);
 }
 setLoading(false);
 };
 if (userId && userEmail) initData();
 }, [userId, userEmail]);

 const handleSendMessage = useCallback(async () => {
 if (!messageText.trim() || messagesLeft <= 0 || !clueData?.senior_student_id || !userId) return;
 try {
 await api.sendJuniorMessage(clueData.junior_student_id, clueData.senior_student_id, messageText);
 const newCount = (3 - messagesLeft) + 1;
 await activityApi.updateActivity(userId, { daily_messages_count: newCount });
 setMessagesLeft(3 - newCount);
 setMessageText('');
 notify("SYSTEM: Transmission sent!");
 } catch (error) { notify("ERROR:" + error.message); }
 }, [messageText, messagesLeft, clueData, userId, notify]);

 const handleGuessSubmit = useCallback(async () => {
 if (!guessInput.trim() || !canGuess || !clueData?.senior_nickname || !userId) return;
 
 // Makes it impossible to guess correctly
 if (false) {
 await activityApi.updateActivity(userId, { is_guessed: true });
 setIsGameCleared(true);
 setGuessFeedback('[SUCCESS]: CORRECT PROTOCOL!');
 notify('SYSTEM: MISSION ACCOMPLISHED!');
 } else {
const teaseMessages = [
  // --- สายกวนสั้นๆ ได้ใจความ ---
  "WRONG! ผิดจ้าาา Try harder, rookie.",
  "Nope! ห่างไกลคำว่าถูกมากน้องเอ๊ย",
  "Are you even trying? เดามั่วปะเนี่ย!",
  "Incorrect! พี่รหัสตัวจริงยังคงเป็นความลับจ้า",
  "Oops! Wrong target! ผิดคนแล้วจ้า ไปสืบมาใหม่นะ",
  "Not even close! ยังไม่เฉียดเลยน้อง",
  
  // --- สายขิงความเนียน ---
  "Still hiding! พี่รหัสยังลอยนวลอยู่นะจ๊ะ หาให้เจอ!",
  "Mission failed! สกิลนักสืบยังไม่ผ่านนะเราอะ",
  "Error 404: Senior not found! เดาผิดจ้า ไปหาข้อมูลมาใหม่",
  "Too bad! พี่ซ่อนเนียนขนาดนั้นเลยหรอเนี่ย",
  "Ninja mode: ON! ยังหาพี่ไม่เจอหรอกน้อง",
  
  // --- สายปั่นประสาท แอบขิงคำใบ้ ---
  "Wrong! คำใบ้ชัดขนาดนี้ยังเดาผิดอีกหรอเนี่ย!",
  "So close... ล้อเล่น! Not even close จ้า ผิดเต็มๆ",
  "Try again! พี่ให้โอกาสไปถามเพื่อนมาใหม่นะ",
  "No no no! เสียใจด้วย พี่ไม่ใช่พี่รหัสเธอนะจ๊ะ",
  "Is that your best guess? ได้แค่นี้จริงๆ ดิ?",
  
  // --- สายเอ็นดู ให้กำลังใจแบบกวนๆ ---
  "Don't give up! หาต่อไปนะน้อง ความจริงมีเพียงหนึ่งเดียว!",
  "Fail! แต่ไม่เป็นไร ให้โอกาสเดาใหม่นะ rookie",
  "Keep guessing! เดาต่อไปจ้า พี่เอาใจช่วยอยู่ห่างๆ (อย่างห่วงๆ)",
  "Next time, better luck! ผิดอีกแล้วนะเรา สู้ๆ ละกัน",
  "Sorry, try again later! พักดื่มน้ำก่อนแล้วค่อยมาเดาใหม่นะน้อง"
];
 const randomTease = teaseMessages[Math.floor(Math.random() * teaseMessages.length)];
 setGuessFeedback(randomTease);
 await activityApi.updateActivity(userId, { last_guess_at: new Date().toISOString() });
 setCanGuess(false);
 setGuessInput('');
 notify("SYSTEM: PROTOCOL FAILED.");
 }
 }, [guessInput, canGuess, clueData, userId, notify]);

 const startQuiz = useCallback(async () => {
 if (!userId) return;
 if (activityData?.quiz_start_time) {
 const lastQuizDate = new Date(activityData.quiz_start_time).toDateString();
 const today = new Date().toDateString();
 if (lastQuizDate === today) {
 notify("SYSTEM: QUIZ IS ONLY ONCE A DAY!");
 return;
 }
 }

 const nowIso = new Date().toISOString();
 await activityApi.updateActivity(userId, { quiz_start_time: nowIso });
 setActivityData(prev => ({ ...prev, quiz_start_time: nowIso }));

 setSelectedOption(null); 
 setIsAnswerCorrect(null);
 const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
 setRandomizedBank(shuffled);
 setQuizState({ step: 'playing', score: 0, currentIndex: 0 });
 setQuizModal(true);
 }, [userId, activityData, quizQuestions, notify]);

 const handleAnswer = useCallback(async (selectedOpt) => {
 if (selectedOption !== null || !userId) return;
 const isCorrect = selectedOpt === randomizedBank[quizState.currentIndex].answer;
 setSelectedOption(selectedOpt);
 setIsAnswerCorrect(isCorrect);
 setTimeout(async () => {
 const newScore = isCorrect ? quizState.score + 1 : quizState.score;
 if (quizState.currentIndex + 1 < 10) {
 setQuizState(prev => ({ ...prev, score: newScore, currentIndex: prev.currentIndex + 1 }));
 setSelectedOption(null); setIsAnswerCorrect(null);
 } else {
 if (newScore >= 7) { 
 setIsQuizPassed(true); 
 if (userId) await activityApi.updateActivity(userId, { quiz_passed: true });
 }
 setQuizState({ step: 'result', score: newScore, currentIndex: 0 });
 }
 }, 1200);
 }, [selectedOption, userId, randomizedBank, quizState.currentIndex, quizState.score]);

 const now = useMemo(() => new Date(), []);
 const isClue2Unlocked = useMemo(() => clueData?.clue_2 && (now >= new Date('2026-07-02')) && isQuizPassed, [clueData, now, isQuizPassed]);
 const isClue3Unlocked = useMemo(() => 
 clueData?.clue_3 && 
 (now >= new Date('2026-08-12')) && 
 isQuizPassed && 
 gameProgress?.isAllGamesPassed, 
 [clueData, now, isQuizPassed, gameProgress?.isAllGamesPassed]);
 const canPlayQuiz = useMemo(() => activityData?.quiz_start_time 
 ? new Date(activityData.quiz_start_time).toDateString() !== new Date().toDateString() 
 : true, [activityData]);

 if (loading) return <JuniorMissionsSkeleton />;

 return (
 <>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
 <div className="h-full w-full overflow-hidden">
 <SeniorClueBoard clueData={clueData} isClue2Unlocked={isClue2Unlocked} isClue3Unlocked={isClue3Unlocked} setModal={setModal} truncateClue={truncateClue} />
 </div>
 <div className="h-full w-full overflow-hidden">
 <TransmissionBox messagesLeft={messagesLeft} messageText={messageText} setMessageText={setMessageText} handleSendMessage={handleSendMessage} hasSeniorEmail={!!clueData?.senior_student_id} />
 </div>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full items-stretch mt-6">
 <div className="h-full w-full overflow-hidden">
 <GuessPanel isGameCleared={isGameCleared} canGuess={canGuess} guessInput={guessInput} setGuessInput={setGuessInput} handleGuessSubmit={handleGuessSubmit} guessFeedback={guessFeedback}/>
 </div>
 <div className="h-full w-full overflow-hidden">
 <BonusPanel isQuizPassed={isQuizPassed} startQuiz={startQuiz} canPlayQuiz={canPlayQuiz} />
 </div>
 </div>
 
 <GameQuestPanel gameProgress={gameProgress} />
 
 <QuizModal isOpen={quizModal} onClose={() => setQuizModal(false)} quizState={quizState} startQuiz={startQuiz} randomizedBank={randomizedBank} selectedOption={selectedOption} isAnswerCorrect={isAnswerCorrect} handleAnswer={handleAnswer} />
 <ClueModal isOpen={modal.isOpen} content={modal.content} onClose={() => setModal({ isOpen: false, content: '' })} notify={notify} />
 </>
 );
};

export default JuniorMissionsTab;
