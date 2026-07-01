import React, { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { addExpToUser } from '../../../api/activityApi';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlappyDrone() {
 const navigate = useNavigate();
 const [highScore, setHighScore] = useState(0);
 const [expPopup, setExpPopup] = useState(null);

 // Note: The URLs here must match exactly what Unity outputs in the Build folder.
 const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
 loaderUrl:"/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.loader.js",
 dataUrl:"/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.data.br",
 frameworkUrl:"/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.framework.js.br",
 codeUrl:"/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.wasm.br",
 });

 // Fetch High Score on Mount
 useEffect(() => {
 const fetchHighScore = async () => {
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 const email = user.email ?? '';
 const username = email.includes('@') ? email.split('@')[0] : user.id;
 
 const { data, error } = await supabase.from('leaderboard')
 .select('score')
 .eq('username', username)
 .eq('game_slug', 'flappy_drone')
 .maybeSingle();
 
 if (error && error.code !== 'PGRST116') throw error;
 if (data?.score != null) setHighScore(data.score);
 } catch (err) {
 console.error("Error fetching high score", err);
 }
 };
 fetchHighScore();
 }, []);

 const saveHighScore = useCallback(async (finalScore) => {
 let expAmount = 0;
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return 0;
 
 const email = user.email ?? '';
 const username = email.includes('@') ? email.split('@')[0] : user.id;
 const gameSlug = 'flappy_drone';

 const { data: existingData, error: fetchError } = await supabase.from('leaderboard')
 .select('id, score')
 .eq('username', username)
 .eq('game_slug', gameSlug)
 .maybeSingle();

 if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

 if (existingData) {
 if (finalScore > existingData.score) {
 await supabase.from('leaderboard').update({ score: finalScore }).eq('id', existingData.id); 
 setHighScore(finalScore);
 }
 } else {
 await supabase.from('leaderboard').insert([{ user_id: user.id, username: username, score: finalScore, game_slug: gameSlug }]);
 setHighScore(finalScore);
 }

 if (finalScore >= 200) expAmount = 100;
 else if (finalScore >= 100) expAmount = 50;
 else if (finalScore >= 50) expAmount = 25;
 else if (finalScore >= 20) expAmount = 10;
 else if (finalScore >= 10) expAmount = 5;

 if (expAmount > 0) {
 await addExpToUser(user.id, expAmount);
 }
 return expAmount;
 } catch (error) {
 console.error("Error saving high score or exp:", error);
 return 0;
 }
 }, []);

 // Listen for Unity events (Dispatched from ReactInterop.jslib)
 useEffect(() => {
 const handleUnityGameOver = async (event) => {
 const score = event.detail;
 const expEarned = await saveHighScore(score);
 setExpPopup(expEarned);
 setTimeout(() => setExpPopup(null), 3000); // Hide after 3 seconds
 };

 window.addEventListener("OnUnityGameOver", handleUnityGameOver);
 return () => {
 window.removeEventListener("OnUnityGameOver", handleUnityGameOver);
 };
 }, [saveHighScore]);

 return (
 <div className="relative w-full h-screen bg-[#060412] text-white overflow-hidden">
 {/* Back Button */}
 <button 
 onClick={() => navigate('/dashboard/minigames')}
 className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-[#7ecfff]/20 border border-[#7ecfff]/50 rounded-full text-[#7ecfff] transition-all backdrop-blur-md cursor-pointer"
 >
 <ArrowLeft size={18} />
 <span className="hidden sm:inline">BACK TO DASHBOARD</span>
 </button>

 {/* Loading Overlay */}
 {!isLoaded && (
 <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#060412]">
 <div className="w-16 h-16 border-4 border-[#7ecfff]/20 border-t-[#7ecfff] rounded-full animate-spin mb-4" />
 <p className="text-[#99eedd] font-bold text-xl drop-shadow-[0_0_10px_rgba(153,238,221,0.8)]">
 LOADING UNITY WEBGL... {Math.round(loadingProgression * 100)}%
 </p>
 </div>
 )}

 {/* High Score Overlay */}
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:top-6 md:right-6 z-30 flex items-center gap-2 px-4 py-2 bg-black/50 border border-[#d966ff]/50 rounded-full text-[#e0b3ff] backdrop-blur-md whitespace-nowrap">
 <span>HIGH SCORE: {highScore}</span>
 </div>

 {/* Unity Canvas */}
 <div className="w-full h-full flex items-center justify-center">
 <Unity 
 unityProvider={unityProvider} 
 style={{ width:"100%", height:"100%", visibility: isLoaded ?"visible" :"hidden" }} 
 />
 </div>

 {/* EXP Popup */}
 <AnimatePresence>
 {expPopup !== null && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8, y: 50 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.8, y: -50 }}
 transition={{ type: "spring", stiffness: 200, damping: 20 }}
 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center bg-black/80 border border-[#7ecfff]/50 px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(126,207,255,0.4)] backdrop-blur-md"
 >
 <h2 className="text-3xl font-['Orbitron'] text-white mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">GAME OVER</h2>
 <p className="text-xl font-bold text-[#99eedd] drop-shadow-[0_0_10px_rgba(153,238,221,0.8)]">
 {expPopup > 0 ? `+${expPopup} EXP` : "+0 EXP"}
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
