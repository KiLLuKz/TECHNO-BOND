import React, { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

export default function FlappyDrone() {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(0);

  // Note: The URLs here must match exactly what Unity outputs in the Build folder.
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.loader.js",
    dataUrl: "/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.data.br",
    frameworkUrl: "/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.framework.js.br",
    codeUrl: "/Build/FlappyDrone/FlappyDrone/Build/FlappyDrone.wasm.br",
  });

  // Fetch High Score on Mount
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const email = user.email;
        const username = email.substring(0, email.indexOf('@'));
        
        const { data } = await supabase.from('leaderboard')
          .select('score')
          .eq('username', username)
          .eq('game_slug', 'flappy_drone')
          .single();
          
        if (data) setHighScore(data.score);
      } catch (err) {
        console.error("Error fetching high score", err);
      }
    };
    fetchHighScore();
  }, []);

  const saveHighScore = useCallback(async (finalScore) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const email = user.email;
      const username = email.substring(0, email.indexOf('@'));
      const gameSlug = 'flappy_drone';

      const { data: existingData } = await supabase.from('leaderboard')
        .select('id, score')
        .eq('username', username)
        .eq('game_slug', gameSlug)
        .single(); 

      if (existingData) {
        if (finalScore > existingData.score) {
          await supabase.from('leaderboard').update({ score: finalScore }).eq('id', existingData.id); 
          setHighScore(finalScore);
        }
      } else {
        await supabase.from('leaderboard').insert([{ user_id: user.id, username: username, score: finalScore, game_slug: gameSlug }]);
        setHighScore(finalScore);
      }
    } catch (error) {
      console.error("Error saving high score:", error);
    }
  }, []);

  // Listen for Unity events (Dispatched from ReactInterop.jslib)
  useEffect(() => {
    const handleUnityGameOver = (event) => {
      const score = event.detail;
      saveHighScore(score);
    };

    window.addEventListener("OnUnityGameOver", handleUnityGameOver);
    return () => {
      window.removeEventListener("OnUnityGameOver", handleUnityGameOver);
    };
  }, [saveHighScore]);

  return (
    <div className="relative w-full h-screen bg-[#060412] text-white font-['Orbitron'] overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')}
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
            style={{ width: "100%", height: "100%", visibility: isLoaded ? "visible" : "hidden" }} 
        />
      </div>
    </div>
  );
}
