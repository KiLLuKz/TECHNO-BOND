import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CyberBasket = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Game states: 'menu' -> 'countdown' -> 'playing'
  const [gameStatus, setGameStatus] = useState('menu');
  const [countdownText, setCountdownText] = useState('3');

  // --- GAME CONFIG & STATE (Bypassing React for 60FPS) ---
  const GAME_WIDTH = 1000;
  const GAME_HEIGHT = 600;
  const GRAVITY = 0.15; // ลด Gravity ลงอีก
  const MAX_SCORE = 5;

  const gameState = useRef({
    players: [],
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 0, vy: 0, radius: 14, holder: null, cooldown: 0, justCaught: false },
    hoops: [
      { x: 100, y: 250, radius: 30, team: 1 }, // Left Hoop
      { x: GAME_WIDTH - 100, y: 250, radius: 30, team: 2 } // Right Hoop
    ],
    status: 'menu',
    keys: { p1: false, p2: false },
    charge: { p1: 0, p2: 0 },
    time: 0,
    cameraShake: 0
  });

  const initGame = () => {
    setScore({ p1: 0, p2: 0 });
    setGameOver(false);
    setWinner(null);
    setGameStatus('menu');
    gameState.current.status = 'menu';
    resetPositions();
  };

  const startGame = () => {
    setGameStatus('countdown');
    
    let count = 3;
    setCountdownText(count.toString());
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownText(count.toString());
      } else if (count === 0) {
        setCountdownText('GO!');
      } else {
        clearInterval(interval);
        setGameStatus('playing');
        gameState.current.status = 'playing';
      }
    }, 1000);
  };

  const resetPositions = () => {
    gameState.current.players = [
      // Team 1 (Left) - ขยับมาใกล้ตรงกลางมากขึ้น
      { id: 'p1_1', team: 1, x: 400, y: GAME_HEIGHT - 100, vx: 0, vy: 0, w: 35, h: 90, angle: 0, grounded: false, color: '#7ecfff' },
      { id: 'p1_2', team: 1, x: 300, y: GAME_HEIGHT - 100, vx: 0, vy: 0, w: 35, h: 90, angle: 0, grounded: false, color: '#4f2ec3' },
      // Team 2 (Right) - ขยับมาใกล้ตรงกลางมากขึ้น
      { id: 'p2_1', team: 2, x: 600, y: GAME_HEIGHT - 100, vx: 0, vy: 0, w: 35, h: 90, angle: 0, grounded: false, color: '#ff4d4d' },
      { id: 'p2_2', team: 2, x: 700, y: GAME_HEIGHT - 100, vx: 0, vy: 0, w: 35, h: 90, angle: 0, grounded: false, color: '#990000' }
    ];
    
    // Toss ball in middle, high up for jump ball
    gameState.current.ball = { 
      x: GAME_WIDTH / 2, 
      y: 100, 
      vx: 0, 
      vy: -10, 
      radius: 14, 
      holder: null, 
      cooldown: 40,
      justCaught: false
    };
  };

  // --- PHYSICS ENGINE ---
  const updatePhysics = () => {
    const state = gameState.current;
    state.time += 0.012; // ชะลอความเร็วการโยกเยกให้ช้าลงอีก

    // Charge power
    if (state.keys.p1) state.charge.p1 = Math.min(state.charge.p1 + 0.3, 10); // ลด Max charge ลงครึ่งนึง (จาก 20 เหลือ 10)
    if (state.keys.p2) state.charge.p2 = Math.min(state.charge.p2 + 0.3, 10);

    // Shake
    if (state.cameraShake > 0) state.cameraShake -= 1;

    // Update Players
    state.players.forEach(p => {
      // Swaying logic when grounded
      if (p.grounded) {
        // Base sway speed, random phase per player (using their x as offset)
        p.angle = Math.sin(state.time * 2 + p.id.charCodeAt(3)) * 0.45; // เพิ่มมุมโยกเยกให้เอียงเยอะขึ้น
      } else {
        p.vy += GRAVITY;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Friction
      p.vx *= 0.96; // ลดความหนืดเพื่อให้ขยับสมูทขึ้น

      // Floor collision
      if (p.y + p.h / 2 >= GAME_HEIGHT - 40) {
        p.y = GAME_HEIGHT - 40 - p.h / 2;
        p.vy = 0;
        p.grounded = true;
      } else {
        p.grounded = false;
      }

      // Wall collision
      if (p.x - p.w / 2 < 0) { p.x = p.w / 2; p.vx *= -0.5; }
      if (p.x + p.w / 2 > GAME_WIDTH) { p.x = GAME_WIDTH - p.w / 2; p.vx *= -0.5; }
    });

    // Update Ball
    const b = state.ball;
    if (b.cooldown > 0) b.cooldown--;

    if (b.holder) {
      // Ball follows holder's hand
      const h = b.holder;
      const handOffset = h.team === 1 ? 25 : -25;
      // Calculate hand position based on rotation
      const armX = h.x + Math.cos(h.angle) * handOffset - Math.sin(h.angle) * -45;
      const armY = h.y + Math.sin(h.angle) * handOffset + Math.cos(h.angle) * -45;
      
      b.x = armX;
      b.y = armY;
      b.vx = h.vx;
      b.vy = h.vy;
    } else {
      b.vy += GRAVITY * 0.9;
      b.x += b.vx;
      b.y += b.vy;

      // Ball Floor
      if (b.y + b.radius >= GAME_HEIGHT - 40) {
        b.y = GAME_HEIGHT - 40 - b.radius;
        b.vy *= -0.7; // Bounce
        b.vx *= 0.98;
      }
      // Ball Walls
      if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -0.8; }
      if (b.x + b.radius > GAME_WIDTH) { b.x = GAME_WIDTH - b.radius; b.vx *= -0.8; }

      // Ball Hoops Collision & Scoring
      state.hoops.forEach(hoop => {
        // Hoop Rim collision (approximate)
        const dx = b.x - hoop.x;
        const dy = b.y - hoop.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Inside the hoop rim (scoring)
        // Check if ball is moving down (vy > 0) and is below the hoop line (b.y > hoop.y)
        if (dist < hoop.radius && b.vy > 0 && Math.abs(b.x - hoop.x) < hoop.radius * 0.8 && b.y > hoop.y + 10) {
           // SCORE!
           if (hoop.team === 1) handleScore(2); // Team 2 scores in Team 1's hoop
           if (hoop.team === 2) handleScore(1); // Team 1 scores in Team 2's hoop
           
           b.vy = 2; // slow down passing through net
        }
        
        // Bouncing off rims (simplification: rims are on edges of hoop radius)
        const leftRimX = hoop.x - hoop.radius;
        const rightRimX = hoop.x + hoop.radius;
        const rimY = hoop.y;

        [leftRimX, rightRimX].forEach(rimX => {
          const rDx = b.x - rimX;
          const rDy = b.y - rimY;
          const rDist = Math.sqrt(rDx * rDx + rDy * rDy);
          if (rDist < b.radius + 8) {
             // Push out and bounce
             const nx = rDx / rDist;
             const ny = rDy / rDist;
             b.x = rimX + nx * (b.radius + 8);
             b.y = rimY + ny * (b.radius + 8);
             
             const dot = b.vx * nx + b.vy * ny;
             b.vx -= 2 * dot * nx;
             b.vy -= 2 * dot * ny;
             b.vx *= 0.8;
             b.vy *= 0.8;
          }
        });
      });
    }

    // Ball Player Collision (Picking up & Stealing)
    if (b.cooldown <= 0) {
      if (!b.holder) {
        // Picking up free ball
        state.players.forEach(p => {
          if (b.holder) return;
          if (b.x > p.x - p.w && b.x < p.x + p.w && b.y > p.y - p.h && b.y < p.y + p.h) {
            b.holder = p;
            // If caught while pressing key, flag it so they don't instantly shoot on release
            if ((p.team === 1 && state.keys.p1) || (p.team === 2 && state.keys.p2)) {
              b.justCaught = true;
            }
          }
        });
      } else {
        // Stealing ball from opponent
        state.players.forEach(p => {
          if (p.team !== b.holder.team) {
            // Upper body collision (stealing)
            // p.y is center. Upper body is y - h/2 to y
            if (b.x > p.x - p.w && b.x < p.x + p.w && b.y > p.y - p.h && b.y < p.y) {
               // Steal successful
               b.holder = p;
               b.cooldown = 30; // Cooldown before they can be stolen from again (briefly)
               // Set justCaught so they don't immediately throw if holding button
               if ((p.team === 1 && state.keys.p1) || (p.team === 2 && state.keys.p2)) {
                 b.justCaught = true;
               }
            }
          }
        });
      }
    }
  };

  const handleScore = (scoringTeam) => {
    gameState.current.cameraShake = 20;
    
    setScore(prev => {
      const newScore = { ...prev };
      if (scoringTeam === 1) newScore.p1 += 1;
      else newScore.p2 += 1;
      
      if (newScore.p1 >= MAX_SCORE) {
        setWinner(1);
        setGameOver(true);
      } else if (newScore.p2 >= MAX_SCORE) {
        setWinner(2);
        setGameOver(true);
      }
      
      return newScore;
    });

    // Reset positions after a short delay
    if (!gameOver) {
      setTimeout(resetPositions, 1000);
    }
  };

  const handleAction = (team, type) => {
    const state = gameState.current;
    
    if (type === 'press') {
      // Jump logic
      state.players.filter(p => p.team === team).forEach(p => {
        if (p.grounded) {
          p.vy = -8; // เพิ่มพลังกระโดดให้สูงขึ้น
          p.vx = Math.sin(p.angle) * 16; // เพิ่มแรงกระโดดแนวนอนให้พุ่งไกลขึ้น
          p.grounded = false;
        }
      });
      // Reset charge on press
      if (team === 1) state.charge.p1 = 0;
      else state.charge.p2 = 0;
    } 
    else if (type === 'release') {
      // Throw logic
      if (state.ball.holder && state.ball.holder.team === team) {
        const b = state.ball;
        
        // If they just caught it mid-air while holding the button, do NOT throw.
        // It requires a new press-release cycle.
        if (b.justCaught) {
          b.justCaught = false;
        } else {
          const h = state.ball.holder;
          b.holder = null;
          b.cooldown = 20;
          
          // Throw towards opponent's hoop
          const targetHoop = team === 1 ? state.hoops[1] : state.hoops[0];
          const dx = targetHoop.x - h.x;
        // Aim high for an arc. The longer the charge, the higher it goes.
        const dy = (targetHoop.y - 150) - h.y; 
        
        // Normalize
        const mag = Math.sqrt(dx * dx + dy * dy);
        
        // Power based on charge (min 5, max 15)
        const chargeVal = team === 1 ? state.charge.p1 : state.charge.p2;
        const throwPower = 5 + chargeVal; // ลด Base power จาก 8 เหลือ 5
        
        // Add velocity with a more pronounced arc (more Y force)
        b.vx = (dx / mag) * throwPower * 0.7 + h.vx * 0.3; // ลดตัวคูณแกน X เล็กน้อยเพื่อไม่ให้พุ่งแรงไป
        b.vy = (dy / mag) * throwPower * 0.9 - 1 + h.vy * 0.3; // ลดตัวคูณแกน Y ไม่ให้บอลพุ่งทะลุจอ
        }
      }
      
      // Reset charge
      if (team === 1) state.charge.p1 = 0;
      else state.charge.p2 = 0;
    }
  };

  // --- RENDER ENGINE ---
  const render = (ctx) => {
    const state = gameState.current;
    
    // Clear & Draw BG
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#060412';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Apply Camera Shake
    ctx.save();
    if (state.cameraShake > 0) {
      const sx = (Math.random() - 0.5) * state.cameraShake;
      const sy = (Math.random() - 0.5) * state.cameraShake;
      ctx.translate(sx, sy);
    }

    // Grid background
    ctx.strokeStyle = 'rgba(153, 238, 221, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<GAME_WIDTH; i+=40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, GAME_HEIGHT); ctx.stroke();
    }
    for(let i=0; i<GAME_HEIGHT; i+=40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(GAME_WIDTH, i); ctx.stroke();
    }

    // Floor
    ctx.fillStyle = '#111';
    ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);
    ctx.strokeStyle = '#99eedd';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GAME_HEIGHT - 40); ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 40); ctx.stroke();

    // Draw Hoops
    state.hoops.forEach(hoop => {
      // Backboard
      ctx.fillStyle = hoop.team === 1 ? 'rgba(126, 207, 255, 0.2)' : 'rgba(255, 77, 77, 0.2)';
      ctx.strokeStyle = hoop.team === 1 ? '#7ecfff' : '#ff4d4d';
      ctx.lineWidth = 4;
      const bx = hoop.team === 1 ? hoop.x - 35 : hoop.x + 35;
      ctx.fillRect(bx - 5, hoop.y - 50, 10, 100);
      ctx.strokeRect(bx - 5, hoop.y - 50, 10, 100);

      // Rim
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(hoop.x - hoop.radius, hoop.y);
      ctx.lineTo(hoop.x + hoop.radius, hoop.y);
      ctx.stroke();

      // Net
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hoop.x - hoop.radius, hoop.y);
      ctx.lineTo(hoop.x - hoop.radius + 10, hoop.y + 40);
      ctx.lineTo(hoop.x + hoop.radius - 10, hoop.y + 40);
      ctx.lineTo(hoop.x + hoop.radius, hoop.y);
      ctx.stroke();
    });

    // Draw Players
    state.players.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      
      // Shadow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;

      // Body
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

      // Head (simple block)
      ctx.fillRect(-p.w / 2, -p.h / 2 - 25, p.w, 20);

      // Eye
      ctx.fillStyle = '#fff';
      const eyeOffset = p.team === 1 ? 5 : -15;
      ctx.fillRect(eyeOffset, -p.h / 2 - 20, 10, 5);

      ctx.restore();
    });

    // Draw Ball
    const b = state.ball;
    ctx.save();
    ctx.translate(b.x, b.y);
    // Rotate ball based on vx
    ctx.rotate(state.time * b.vx * 0.5);
    
    ctx.fillStyle = '#ff8800';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-b.radius, 0); ctx.lineTo(b.radius, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -b.radius); ctx.lineTo(0, b.radius); ctx.stroke();
    
    ctx.restore();

    ctx.restore(); // Restore camera shake
  };

  const gameLoop = () => {
    if (gameOver) return;
    
    // Only run physics if playing
    if (gameState.current.status === 'playing') {
      updatePhysics();
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      render(ctx);
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // --- LIFECYCLE & INPUTS ---
  useEffect(() => {
    initGame();
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.repeat) return; // Prevent key hold spam
      if (e.key.toLowerCase() === 'w') {
        gameState.current.keys.p1 = true;
        handleAction(1, 'press');
      }
      if (e.key === 'ArrowUp') {
        gameState.current.keys.p2 = true;
        handleAction(2, 'press');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w') {
        gameState.current.keys.p1 = false;
        handleAction(1, 'release');
      }
      if (e.key === 'ArrowUp') {
        gameState.current.keys.p2 = false;
        handleAction(2, 'release');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver]);

  // Mobile Touch Controls
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling
    if (gameOver) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Divide screen in half
      if (touch.clientX < window.innerWidth / 2) {
        gameState.current.keys.p1 = true;
        handleAction(1, 'press');
      } else {
        gameState.current.keys.p2 = true;
        handleAction(2, 'press');
      }
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (gameOver) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.clientX < window.innerWidth / 2) {
        gameState.current.keys.p1 = false;
        handleAction(1, 'release');
      } else {
        gameState.current.keys.p2 = false;
        handleAction(2, 'release');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08050f] text-white flex flex-col font-['Orbitron'] relative overflow-hidden touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7ecfff]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d966ff]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto p-4 flex flex-col items-center h-full">
        {/* Header */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} /> <span className="hidden sm:inline">BACK</span>
          </button>
          
          <h1 className="text-3xl font-bold tracking-widest text-[#ffe066] drop-shadow-[0_0_10px_rgba(255,224,102,0.5)]">
            CYBER HOOPS
          </h1>
          
          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Scoreboard */}
        <div className="flex gap-8 mb-6 text-4xl font-bold">
          <div className="text-[#7ecfff] drop-shadow-[0_0_15px_rgba(126,207,255,0.6)]">
            {score.p1}
          </div>
          <div className="text-gray-500">-</div>
          <div className="text-[#ff4d4d] drop-shadow-[0_0_15px_rgba(255,77,77,0.6)]">
            {score.p2}
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="relative w-full max-w-6xl aspect-[16/9] bg-black/50 border-2 border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
          <canvas 
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="w-full h-full object-contain"
          />

          {/* Controls Overlay (Fades out) */}
          {gameStatus === 'playing' && (
            <div className="absolute inset-0 pointer-events-none flex justify-between px-10 items-end pb-8 opacity-40">
              <div className="text-[#7ecfff] text-center">
                <div className="text-2xl font-bold mb-1">P1 (BLUE)</div>
                <div className="text-sm tracking-wider font-['Inter']">TAP LEFT / KEY: W</div>
              </div>
              <div className="text-[#ff4d4d] text-center">
                <div className="text-2xl font-bold mb-1">P2 (RED)</div>
                <div className="text-sm tracking-wider font-['Inter']">TAP RIGHT / KEY: UP</div>
              </div>
            </div>
          )}

          {/* Menu Overlay */}
          <AnimatePresence>
            {gameStatus === 'menu' && !gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <h2 className="text-5xl font-bold text-[#ffe066] mb-8 tracking-widest drop-shadow-[0_0_15px_rgba(255,224,102,0.8)]">
                  READY TO HOOP?
                </h2>
                <button 
                  onClick={startGame}
                  className="px-12 py-4 bg-[#ffe066] text-black rounded-xl font-bold text-2xl tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,224,102,0.6)]"
                >
                  PLAY
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown Overlay */}
          <AnimatePresence>
            {gameStatus === 'countdown' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute inset-0 z-30 flex items-center justify-center"
              >
                <motion.div 
                  key={countdownText}
                  initial={{ opacity: 0, y: -20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 1.5 }}
                  className="text-8xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]"
                >
                  {countdownText}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Over Screen */}
        <AnimatePresence>
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-[#08050f] border border-white/20 p-10 rounded-3xl flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <Trophy size={64} className={winner === 1 ? 'text-[#7ecfff] mb-4' : 'text-[#ff4d4d] mb-4'} />
                <h2 className="text-4xl font-bold mb-2 tracking-widest text-white">
                  PLAYER {winner} WINS!
                </h2>
                <p className="text-gray-400 mb-8">First to {MAX_SCORE} points</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={initGame}
                    className="px-8 py-4 bg-[#ffe066]/20 border border-[#ffe066] text-[#ffe066] rounded-xl font-bold tracking-widest hover:bg-[#ffe066]/40 transition-all flex items-center gap-3"
                  >
                    <RotateCcw size={20} /> PLAY AGAIN
                  </button>
                  <button 
                    onClick={() => navigate(-1)}
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold tracking-widest hover:bg-white/10 transition-all"
                  >
                    EXIT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CyberBasket;
