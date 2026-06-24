import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; 

export default function SystemDefender() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef({
    player: { x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 20, angle: 0, hp: 100, maxHp: 100 },
    projectiles: [],
    enemies: [],
    particles: [],
    frame: 0,
    score: 0,
    spawnRate: 100, // lower is faster
  });

  const mousePos = useRef({ x: 400, y: 300 });
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const isShooting = useRef(false);
  const autoLock = useRef(false);
  const [isAutoLockOn, setIsAutoLockOn] = useState(false);
  const lastShotTime = useRef(0);

  const toggleAutoLock = () => {
    autoLock.current = !autoLock.current;
    setIsAutoLockOn(autoLock.current);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
      if (key === 'e') toggleAutoLock();
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Fetch High Score
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
          .eq('game_slug', 'system_defender')
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
      const gameSlug = 'system_defender';

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
      player: { x: canvasRef.current?.width / 2 || 400, y: canvasRef.current?.height / 2 || 300, radius: 20, angle: 0, hp: 100, maxHp: 100 },
      projectiles: [],
      enemies: [],
      particles: [],
      frame: 0,
      score: 0,
      spawnRate: 120,
    };
    setScore(0);
    setGameState('playing');
  };

  const gameOver = useCallback(() => {
    setGameState('gameover');
    saveHighScore(gameRef.current.score);
  }, []);

  // Update Mouse Position
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mousePos.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Shoot handled in loop now

  // Main Game Loop & Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle Resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (gameState !== 'playing') {
        gameRef.current.player.x = canvas.width / 2;
        gameRef.current.player.y = canvas.height / 2;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const loop = () => {
      const state = gameRef.current;
      const { player, projectiles, enemies, particles } = state;
      
      // Black trail effect (Clear canvas with transparency)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(6, 4, 18, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(217, 102, 255, 0.05)';
      ctx.lineWidth = 1;
      const pulse = Math.sin(state.frame * 0.05) * 5;
      for(let i = 0; i < canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i = 0; i < canvas.height; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Player Movement (Keyboard)
      const moveSpeed = 5;
      if (keys.current.w && player.y > player.radius) player.y -= moveSpeed;
      if (keys.current.s && player.y < canvas.height - player.radius) player.y += moveSpeed;
      if (keys.current.a && player.x > player.radius) player.x -= moveSpeed;
      if (keys.current.d && player.x < canvas.width - player.radius) player.x += moveSpeed;

      // Player Movement (Touch/Mouse Drag when Auto-Lock is ON)
      if (autoLock.current && isShooting.current) {
        const dx = mousePos.current.x - player.x;
        const dy = mousePos.current.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > moveSpeed) {
          player.x += (dx / dist) * moveSpeed;
          player.y += (dy / dist) * moveSpeed;
        }
      }

      // Update Player Angle
      if (autoLock.current && enemies.length > 0) {
        // find closest enemy
        let closest = null;
        let minDist = Infinity;
        for (const e of enemies) {
          const dist = Math.hypot(player.x - e.x, player.y - e.y);
          if (dist < minDist) { minDist = dist; closest = e; }
        }
        if (closest) {
          player.angle = Math.atan2(closest.y - player.y, closest.x - player.x);
        }
      } else {
        player.angle = Math.atan2(
          mousePos.current.y - player.y,
          mousePos.current.x - player.x
        );
      }

      // Draw Player (Turret Base)
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#060412';
      ctx.fill();
      ctx.strokeStyle = '#4ECDC4';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4ECDC4';
      ctx.stroke();

      // Player HP Bar
      const hpRatio = Math.max(0, player.hp / player.maxHp);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(player.x - 20, player.y + 30, 40, 5);
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(player.x - 20, player.y + 30, 40 * hpRatio, 5);
      ctx.shadowBlur = 0;

      // Draw Turret Barrel
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(0, -5, 35, 10);
      ctx.restore();

      // Skip updates if not playing
      if (gameState !== 'playing') {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      // Auto Shoot
      if (isShooting.current && state.frame - lastShotTime.current > 8) { // shoot rate
         const pSpeed = 12;
         projectiles.push({
           x: player.x + Math.cos(player.angle) * player.radius,
           y: player.y + Math.sin(player.angle) * player.radius,
           radius: 5, color: '#ffe066',
           velocity: { x: Math.cos(player.angle) * pSpeed, y: Math.sin(player.angle) * pSpeed }
         });
         lastShotTime.current = state.frame;
      }

      // Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.velocity.x;
        p.y += p.velocity.y;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Remove offscreen
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          projectiles.splice(i, 1);
        }
      }

      // Enemies spawn
      if (state.frame % state.spawnRate === 0) {
        const radius = Math.random() * 10 + 10;
        let x, y;
        if (Math.random() < 0.5) {
          x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
          y = Math.random() * canvas.height;
        } else {
          x = Math.random() * canvas.width;
          y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const angle = Math.atan2(player.y - y, player.x - x);
        const speed = Math.random() * 1.0 + 0.5 + (state.score * 0.015);
        const maxHp = radius > 15 ? 3 : 1; // bigger enemies have 3 HP

        enemies.push({
          x, y, radius, color: '#ff3366', maxHp, hp: maxHp,
          velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }
        });
      }

      // Shrink spawn rate slowly
      if (state.frame % 300 === 0 && state.spawnRate > 20) {
        state.spawnRate -= 5;
      }

      // Enemies update & draw
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.velocity.x;
        e.y += e.velocity.y;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Enemy HP
        if (e.hp < e.maxHp) {
          const ehpRatio = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, e.radius * 2, 4);
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, (e.radius * 2) * ehpRatio, 4);
        }

        // Collision: Player vs Enemy
        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        if (distToPlayer - player.radius - e.radius < 1) {
          player.hp -= 10; // Reduced from 20 to 10
          enemies.splice(i, 1);
          
          // Player hit flash
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          if (player.hp <= 0) {
            gameOver();
          }
          continue;
        }

        // Collision: Projectile vs Enemy
        for (let j = projectiles.length - 1; j >= 0; j--) {
          const p = projectiles[j];
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist - e.radius - p.radius < 1) {
            
            projectiles.splice(j, 1);
            e.hp -= 1;
            
            if (e.hp <= 0) {
              // Explosion Particles
              for(let k = 0; k < 8; k++) {
                particles.push({
                  x: e.x, y: e.y,
                  radius: Math.random() * 3,
                  color: e.color,
                  velocity: { x: (Math.random()-0.5)*5, y: (Math.random()-0.5)*5 },
                  alpha: 1
                });
              }
              
              enemies.splice(i, 1);
              state.score += 10;
              setScore(state.score);
            } else {
              // Hit flash for enemy
              e.color = '#ffffff';
              setTimeout(() => { if (e) e.color = '#ff3366'; }, 50);
            }
            break; // inner loop break
          }
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      state.frame++;
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState, gameOver]);


  return (
    <div className="fixed inset-0 font-['Orbitron'] text-white overflow-hidden bg-black/40 backdrop-blur-sm z-50 cursor-crosshair"
         onMouseMove={handleMouseMove}
         onMouseDown={() => { isShooting.current = true; }}
         onMouseUp={() => { isShooting.current = false; }}
         onMouseLeave={() => { isShooting.current = false; }}
         onTouchStart={(e) => {
           if (e.target.closest('button')) return; // Ignore button touches
           const touch = e.touches[0];
           const canvas = canvasRef.current;
           if (!canvas) return;
           const rect = canvas.getBoundingClientRect();
           mousePos.current = {
             x: (touch.clientX - rect.left) * (canvas.width / rect.width),
             y: (touch.clientY - rect.top) * (canvas.height / rect.height)
           };
         }}
         onTouchEnd={(e) => { 
           if (!e.target.closest('button')) isShooting.current = false; 
         }}
         onTouchMove={(e) => {
           if (e.target.closest('button')) return;
           const touch = e.touches[0];
           const canvas = canvasRef.current;
           if (!canvas) return;
           const rect = canvas.getBoundingClientRect();
           mousePos.current = {
             x: (touch.clientX - rect.left) * (canvas.width / rect.width),
             y: (touch.clientY - rect.top) * (canvas.height / rect.height)
           };
         }}
    >
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate('/dashboard/minigames')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
      </div>
      {gameState !== 'playing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center w-full max-w-[80%]">
          <h1 className="text-xl md:text-3xl font-bold text-[#ff3366] tracking-widest drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]">
            SYSTEM DEFENDER
            <span className="text-[10px] md:text-xs bg-[#ffe066] text-black px-2 py-0.5 rounded-full ml-2 align-middle shadow-[0_0_5px_#ffe066]">PRE-ALPHA</span>
          </h1>
        </div>
      )}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleAutoLock} 
          className={`text-xs md:text-sm px-3 py-2 rounded-xl font-bold transition-all backdrop-blur-md border ${isAutoLockOn ? 'bg-[#4ECDC4]/20 border-[#4ECDC4] text-[#4ECDC4]' : 'bg-white/10 border-white/30 text-gray-400 hover:bg-white/20'}`}
        >
          🎯 <span className="hidden md:inline">AUTO-LOCK: </span>{isAutoLockOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />

        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none p-4">
            <Crosshair size={64} className="text-[#ff3366] mb-6 drop-shadow-[0_0_15px_rgba(255,51,102,1)] animate-pulse" />
            <h2 className="text-3xl font-bold mb-2 text-white">PROTECT THE CORE</h2>
            <p className="mb-8 text-gray-300 text-center max-w-sm">
              Use <span className="text-[#ffe066] font-bold">W A S D</span> to move.<br/>
              Press <span className="text-[#4ECDC4] font-bold">E</span> to toggle Auto-Lock.<br/>
              Hold <span className="text-[#ff3366] font-bold">Click</span> to auto shoot.
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="flex items-center gap-2 px-8 py-4 bg-[#ff3366]/20 hover:bg-[#ff3366]/40 border border-[#ff3366] rounded-xl font-bold text-xl transition-all pointer-events-auto"
            >
              <Play size={24} /> INITIATE DEFENSE
            </button>
            <div className="mt-6 text-sm text-gray-400 font-bold">HIGH SCORE: <span className="text-[#4ECDC4]">{highScore}</span></div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-red-950/60 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none p-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">CORE BREACHED</h2>
            <div className="text-2xl mb-8 flex flex-col items-center gap-2">
              <div>SCORE: <span className="text-[#ffe066] font-bold text-4xl">{score}</span></div>
              <div className="text-lg text-gray-400">HIGH SCORE: <span className="text-[#4ECDC4]">{Math.max(score, highScore)}</span></div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl font-bold text-xl transition-all pointer-events-auto"
            >
              <RotateCcw size={24} /> RETRY
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-white drop-shadow-md pointer-events-none">
              {score}
            </div>
            {/* Mobile Shoot Button */}
            <div className="absolute bottom-8 right-8 z-10 md:hidden pointer-events-auto">
              <button
                 onTouchStart={(e) => { e.preventDefault(); isShooting.current = true; }}
                 onTouchEnd={(e) => { e.preventDefault(); isShooting.current = false; }}
                 className="w-16 h-16 rounded-full bg-[#ff3366]/30 border-2 border-[#ff3366] flex justify-center items-center backdrop-blur-md shadow-[0_0_15px_rgba(255,51,102,0.5)] active:bg-[#ff3366]/60 transition-all"
              >
                <Crosshair size={32} className="text-white" />
              </button>
            </div>
          </>
        )}
    </div>
  );
}
