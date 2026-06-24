import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; 

export default function FlappyDrone() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Core Game Variables
  const gameRef = useRef({
    drone: { x: 80, y: window.innerHeight / 2, velocity: 0, gravity: 0.1, jump: -6, radius: 15 },
    pipes: [],
    frame: 0,
    score: 0,
    speed: 3,
    pipeWidth: 60,
    pipeGap: 180,
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

  const saveHighScore = async (finalScore) => {
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
  };

  const startGame = () => {
    gameRef.current = {
      drone: { x: 80, y: canvasRef.current?.height / 2 || 350, velocity: 0, gravity: 0.2, jump: -6, radius: 15 },
      pipes: [],
      frame: 0,
      score: 0,
      speed: 3,
      pipeWidth: 60,
      pipeGap: 180,
    };
    setScore(0);
    setGameState('playing');
  };

  const gameOver = useCallback(() => {
    setGameState('gameover');
    saveHighScore(gameRef.current.score);
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      gameRef.current.drone.velocity = gameRef.current.drone.jump;
    }
  }, [gameState]);

  // Main Game Loop & Initial Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gameRef.current.drone.x = window.innerWidth * 0.25; // 25% from left
      if (gameState !== 'playing') {
        gameRef.current.drone.y = canvas.height / 2;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const loop = () => {
      const state = gameRef.current;
      const { drone, pipes } = state;
      
      // Clear Canvas (Transparent to let background show, but we can use a semi-transparent dark overlay)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(6, 4, 18, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Background
      ctx.strokeStyle = 'rgba(78, 205, 196, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = (state.frame % 40); i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Drone Physics & Float
      if (gameState === 'playing') {
        drone.velocity += drone.gravity;
        drone.y += drone.velocity;
      } else if (gameState === 'menu') {
        // Floating effect
        drone.y = (canvas.height / 2) + Math.sin(state.frame * 0.05) * 10;
      }

      // Draw Drone (Glowing Circle)
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, drone.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#4ECDC4';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#4ECDC4';
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Only update pipes and collisions if playing
      if (gameState === 'playing') {
        // Pipes Logic
        if (state.frame % 120 === 0) { // Slightly more space between pipes
          const minHeight = 50;
          const maxHeight = canvas.height - state.pipeGap - minHeight;
          let topHeight;
          
          if (pipes.length > 0) {
            const lastPipe = pipes[pipes.length - 1];
            // Constrain new pipe to be within +/- 200px of the last one
            const maxDiff = 200;
            const minBound = Math.max(minHeight, lastPipe.top - maxDiff);
            const maxBound = Math.min(maxHeight, lastPipe.top + maxDiff);
            topHeight = Math.floor(Math.random() * (maxBound - minBound + 1) + minBound);
          } else {
            topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
          }

          pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + state.pipeGap,
            passed: false
          });
        }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= state.speed;

        // Draw Top Pipe
        ctx.fillStyle = 'rgba(217, 102, 255, 0.2)';
        ctx.strokeStyle = '#d966ff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#d966ff';
        ctx.fillRect(p.x, 0, state.pipeWidth, p.top);
        ctx.strokeRect(p.x, 0, state.pipeWidth, p.top);

        // Draw Bottom Pipe
        ctx.fillRect(p.x, p.bottom, state.pipeWidth, canvas.height - p.bottom);
        ctx.strokeRect(p.x, p.bottom, state.pipeWidth, canvas.height - p.bottom);
        ctx.shadowBlur = 0; // reset

        // Collision Detection
        if (
          drone.x + drone.radius > p.x && 
          drone.x - drone.radius < p.x + state.pipeWidth
        ) {
          if (drone.y - drone.radius < p.top || drone.y + drone.radius > p.bottom) {
            gameOver();
          }
        }

        // Score Update
        if (p.x + state.pipeWidth < drone.x && !p.passed) {
          state.score++;
          p.passed = true;
          setScore(state.score);
          // Increase speed slightly
          if (state.score % 5 === 0) state.speed += 0.2;
        }

        // Remove off-screen pipes
        if (p.x + state.pipeWidth < 0) {
          pipes.splice(i, 1);
        }
      }

        // Ground/Ceiling Collision
        if (drone.y + drone.radius >= canvas.height || drone.y - drone.radius <= 0) {
          gameOver();
        }
      } // End of playing logic

      state.frame++;
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);


  return (
    <div className="fixed inset-0 font-['Orbitron'] text-white overflow-hidden bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
         onMouseDown={(e) => { e.preventDefault(); jump(); }}
         onTouchStart={(e) => { e.preventDefault(); jump(); }}
    >
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate('/dashboard/minigames')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
      </div>
      {gameState !== 'playing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center w-full max-w-[80%]">
          <h1 className="text-xl md:text-3xl font-bold text-[#4ECDC4] tracking-widest drop-shadow-[0_0_10px_rgba(78,205,196,0.8)]">
            FLAPPY DRONE
            <span className="text-[10px] md:text-xs bg-[#ffe066] text-black px-2 py-0.5 rounded-full ml-2 align-middle shadow-[0_0_5px_#ffe066]">PRE-ALPHA</span>
          </h1>
        </div>
      )}

      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />

        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#d966ff] drop-shadow-[0_0_15px_rgba(217,102,255,0.8)]">READY?</h2>
            <p className="mb-8 text-[#99eedd] font-bold tracking-widest animate-pulse">Space / Touch to Start</p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="flex items-center gap-2 px-8 py-4 bg-[#4ECDC4]/20 hover:bg-[#4ECDC4]/40 border border-[#4ECDC4] rounded-xl font-bold text-xl transition-all"
            >
              <Play size={24} /> INITIATE
            </button>
            <div className="mt-6 text-sm text-gray-400 font-bold">HIGH SCORE: <span className="text-[#ffe066]">{highScore}</span></div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-red-900/40 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">SYSTEM FAILURE</h2>
            <div className="text-2xl mb-8 flex flex-col items-center gap-2">
              <div>SCORE: <span className="text-[#4ECDC4] font-bold text-4xl">{score}</span></div>
              <div className="text-lg text-gray-400">HIGH SCORE: <span className="text-[#ffe066]">{Math.max(score, highScore)}</span></div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl font-bold text-xl transition-all"
            >
              <RotateCcw size={24} /> REBOOT SYSTEM
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-white drop-shadow-md pointer-events-none">
            {score}
          </div>
        )}
    </div>
  );
}
