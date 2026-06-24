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
import { JuniorMissionsSkeleton } from '../common/Skeletons';

const JuniorMissionsTab = ({ userId, userEmail, notify }) => {
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

  const truncateClue = (text) => text?.length > 20 ? text.substring(0, 20) + "......" : text;

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
    } catch (error) { notify("ERROR: " + error.message); }
  }, [messageText, messagesLeft, clueData, userId, notify]);

  const handleGuessSubmit = useCallback(async () => {
      if (!guessInput.trim() || !canGuess || !clueData?.senior_nickname || !userId) return;
      const normalize = (str) => str.trim().replace(/\s+/g, '').toLowerCase();
      if (normalize(guessInput) === normalize(clueData.senior_nickname)) {
          await activityApi.updateActivity(userId, { is_guessed: true });
          setIsGameCleared(true);
          setGuessFeedback('[SUCCESS]: CORRECT PROTOCOL!');
          notify('SYSTEM: MISSION ACCOMPLISHED!');
      } else {
          const randomTease = _allTeaseLines[Math.floor(Math.random() * _allTeaseLines.length)];
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
  const isClue2Unlocked = useMemo(() => clueData?.clue_2 && (now >= new Date('2026-06-15')) && isQuizPassed, [clueData, now, isQuizPassed]);
  const isClue3Unlocked = useMemo(() => clueData?.clue_3 && (now >= new Date('2026-06-20')) && isQuizPassed, [clueData, now, isQuizPassed]);
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
      
      <QuizModal isOpen={quizModal} onClose={() => setQuizModal(false)} quizState={quizState} startQuiz={startQuiz} randomizedBank={randomizedBank} selectedOption={selectedOption} isAnswerCorrect={isAnswerCorrect} handleAnswer={handleAnswer} />
      <ClueModal isOpen={modal.isOpen} content={modal.content} onClose={() => setModal({ isOpen: false, content: '' })} notify={notify} />
    </>
  );
};

export default JuniorMissionsTab;
