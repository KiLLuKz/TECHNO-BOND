import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; 

export default function FlappyDrone() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioCtx = useRef(null);

  // Core Game Variables
  const gameRef = useRef({
    drone: { x: window.innerWidth < 768 ? window.innerWidth * 0.25 : window.innerWidth * 0.35, y: window.innerHeight / 2, velocity: 0, gravity: window.innerWidth < 768 ? 0.15 : 0.2, jump: window.innerWidth < 768 ? -5.5 : -6.5, radius: 15 },
    pipes: [],
    frame: 0,
    score: 0,
    speed: window.innerWidth < 768 ? 3 : 3.5,
    pipeWidth: 60,
    pipeGap: window.innerWidth < 768 ? 180 : 200,
    pipeSpawnFrames: window.innerWidth < 768 ? 90 : 100
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
    const isMobile = window.innerWidth < 768;
    gameRef.current = {
      drone: { 
        x: isMobile ? window.innerWidth * 0.2 : window.innerWidth * 0.35, // ขยับมาซ้ายอีกนิดบนมือถือ
        y: canvasRef.current?.height / 2 || 350, 
        velocity: isMobile ? -4.5 : -6.5, 
        gravity: isMobile ? 0.12 : 0.2, 
        jump: isMobile ? -4.5 : -6.5, 
        radius: isMobile ? 12 : 15 
      },
      pipes: [],
      particles: [],
      frame: 0,
      score: 0,
      speed: isMobile ? 1.8 : 3.5, // ช้าลงมากบนมือถือ
      pipeWidth: isMobile ? 45 : 60, // เสาเล็กลงหน่อย
      pipeGap: isMobile ? 220 : 200, // ช่องว่างกว้างขึ้น
      pipeSpawnFrames: isMobile ? 120 : 100, // ปล่อยเสาถี่น้อยลง (แต่สัมพันธ์กับความเร็วที่ช้าลง)
    };
    setScore(0);
    setGameState('playing');
  };


  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playJump = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sine'; 
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      o.start(); o.stop(ctx.currentTime + 0.1);
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  const playScore = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'square'; 
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      o.start(); o.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  const playCrash = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i=0; i<data.length; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ctx.createBufferSource(); noise.buffer = buf;
      const g = ctx.createGain(); noise.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      noise.start();
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  const gameOver = useCallback(() => {
    playCrash();
    setGameState('gameover');
    saveHighScore(gameRef.current.score);
  }, [playCrash]);

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      gameRef.current.drone.velocity = gameRef.current.drone.jump;
      playJump();
    } else if (gameState === 'menu' || gameState === 'gameover') {
      startGame();
      playJump();
    }
  }, [gameState, playJump]);

  // Main Game Loop & Initial Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      gameRef.current.drone.x = isMobile ? window.innerWidth * 0.25 : window.innerWidth * 0.35;
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

      // Background Buildings Logic
      if (!state.buildings) {
        state.buildings = [];
        let curX = 0;
        // Generate a huge buffer (3 times screen width or at least 4000px) to never run out
        const targetWidth = Math.max(canvas.width * 3, 4000);
        while (curX < targetWidth) {
           let w = Math.random() * 80 + 60; // Thinner buildings
           let gap = 0; // No gap, buildings connected
           state.buildings.push({ 
             x: curX, 
             width: w, 
             height: Math.random() * (canvas.height * 0.6) + 100, 
             color: `hsl(280, 50%, ${Math.floor(Math.random()*10 + 5)}%)` 
           });
           curX += w + gap;
        }
      }

      // Update & Draw Buildings
      let maxX = 0;
      state.buildings.forEach(b => { if (b.x > maxX) maxX = b.x; });
      for (let i = state.buildings.length - 1; i >= 0; i--) {
        let b = state.buildings[i];
        
        // Move buildings FASTER than pipes as requested by user
        if (gameState === 'playing') {
          b.x -= (state.speed * 1.5); 
        } else {
          b.x -= 2; // slow scroll in menu
        }

        if (b.x + b.width < -100) {
           let gap = 0; // No gap
           // Ensure it always spawns off-screen to the right, even if maxX fell behind
           b.x = Math.max(maxX, canvas.width + 100) + gap; 
           maxX = b.x + b.width;
           b.height = Math.random() * (canvas.height * 0.6) + 100; // New random height
        }
        
        // Draw building body
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, canvas.height - b.height, b.width, b.height);
        
        // Draw simple window lights (using pseudo-random to avoid flicker)
        ctx.fillStyle = 'rgba(255, 224, 102, 0.3)';
        const cols = Math.floor(b.width / 25);
        const rows = Math.floor(b.height / 35);
        for(let r = 0; r < rows; r++) {
          for(let c = 0; c < cols; c++) {
            if ((c * 7 + r * 13 + Math.floor(b.height)) % 10 < 1.5) { // Reduced window lights
               ctx.fillRect(b.x + c * 25 + 10, canvas.height - b.height + r * 35 + 15, 12, 18);
            }
          }
        }
      }

      // Drone Physics & Float
      if (gameState === 'playing') {
        drone.velocity += drone.gravity;
        drone.y += drone.velocity;
        
        // Trail particles
        if (state.frame % 3 === 0) {
           if (!state.particles) state.particles = [];
           state.particles.push({
             x: drone.x - drone.radius,
             y: drone.y,
             alpha: 1,
             size: Math.random() * 5 + 3,
             vy: (Math.random() - 0.5) * 2
           });
        }
      } else if (gameState === 'menu') {
        // Floating effect
        drone.y = (canvas.height / 2) + Math.sin(state.frame * 0.05) * 10;
      }

      // Draw Particles
      if (state.particles) {
         for (let i = state.particles.length - 1; i >= 0; i--) {
           const p = state.particles[i];
           p.x -= state.speed;
           p.y += p.vy;
           p.alpha -= 0.05;
           if (p.alpha <= 0) { state.particles.splice(i, 1); }
           else {
             ctx.fillStyle = `rgba(78, 205, 196, ${p.alpha})`;
             ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
           }
         }
      }

      // Draw Drone (Glowing Circle)
      ctx.save();
      ctx.translate(drone.x, drone.y);
      
      // Tilt drone based on velocity
      let targetAngle = (drone.velocity * 3) * Math.PI / 180;
      targetAngle = Math.max(-Math.PI/4, Math.min(Math.PI/4, targetAngle));
      ctx.rotate(targetAngle);

      ctx.beginPath();
      ctx.arc(0, 0, drone.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#4ECDC4';
      ctx.fill();
      
      // Draw outer glow without using expensive shadowBlur
      ctx.beginPath();
      ctx.arc(0, 0, drone.radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
      ctx.fill();

      // Drone Tech Details
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
      ctx.restore();

      // Only update pipes and collisions if playing
      if (gameState === 'playing') {
        // Pipes Logic
        // Spawn pipes dynamically based on responsive variable
        if (state.frame % state.pipeSpawnFrames === 0) { 
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

        // Draw Pipes with Textures/Details
        const grad = ctx.createLinearGradient(p.x, 0, p.x + state.pipeWidth, 0);
        grad.addColorStop(0, '#2a0a4a');
        grad.addColorStop(0.5, '#d966ff');
        grad.addColorStop(1, '#2a0a4a');
        ctx.fillStyle = grad;
        
        // Body
        ctx.fillRect(p.x, 0, state.pipeWidth, p.top);
        ctx.fillRect(p.x, p.bottom, state.pipeWidth, canvas.height - p.bottom);
        
        // Glowing Rim at the tips (using simple rect with opacity for glow instead of shadowBlur)
        ctx.fillStyle = 'rgba(255, 51, 102, 0.4)';
        ctx.fillRect(p.x - 8, p.top - 23, state.pipeWidth + 16, 26); // Top glow aura
        ctx.fillRect(p.x - 8, p.bottom - 3, state.pipeWidth + 16, 26); // Bottom glow aura
        
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(p.x - 5, p.top - 20, state.pipeWidth + 10, 20); // Top rim
        ctx.fillRect(p.x - 5, p.bottom, state.pipeWidth + 10, 20);   // Bottom rim
        
        // Tech lines/details on the pipes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        for (let y = 30; y < p.top - 30; y += 60) {
           ctx.beginPath(); ctx.moveTo(p.x + 10, y); ctx.lineTo(p.x + state.pipeWidth - 10, y); ctx.stroke();
        }
        for (let y = p.bottom + 30; y < canvas.height; y += 60) {
           ctx.beginPath(); ctx.moveTo(p.x + 10, y); ctx.lineTo(p.x + state.pipeWidth - 10, y); ctx.stroke();
        }

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
          playScore();
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
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={() => navigate('/dashboard/minigames')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} 
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
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
