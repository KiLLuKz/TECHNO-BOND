import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, Rocket, Crosshair, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Skull, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; 

// --- ฟังก์ชันบันทึกคะแนน ---
const saveScore = async (finalScore) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const username = user.email ? user.email.split('@')[0] : 'Player'; 
    const gameSlug = 'shoot-em-up'; 
    const { data: existingData, error: fetchError } = await supabase.from('leaderboard').select('id, score').eq('username', username).eq('game_slug', gameSlug).single(); 
    if (fetchError && fetchError.code !== 'PGRST116') return;
    if (existingData) {
      if (finalScore > existingData.score) await supabase.from('leaderboard').update({ score: finalScore }).eq('id', existingData.id); 
    } else {
      await supabase.from('leaderboard').insert([{ username: username, score: finalScore, game_slug: gameSlug }]);
    }
  } catch (error) { console.error("Error saving score:", error); }
};

const formatScore = (score) => {
  if (score >= 1000) return (score / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return score.toLocaleString();
};

const ShootEmUp = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [wave, setWave] = useState(1);
  const [buffTimeUI, setBuffTimeUI] = useState(0); 
  const [healTextUI, setHealTextUI] = useState(false);
  
  const [canvasSize, setCanvasSize] = useState({ width: 450, height: 800 });

  const gameState = useRef({
    player: { x: 200, y: 600, width: 36, height: 36 },
    bullets: [],
    enemies: [],
    particles: [],
    stars: [],
    items: [], 
    keys: {},
    frame: 0,
    score: 0,
    hp: 100,
    wave: 1,
    gameOver: false,
    speedBuffTimer: 0 
  });

  const touchState = useRef({ left: false, right: false, up: false, down: false, fire: false });
  const buffRef = useRef(0);
  const audioCtx = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const newWidth = Math.min(clientWidth, 600);
        setCanvasSize({ width: newWidth, height: clientHeight });
        
        if (!started && gameState.current.frame === 0) {
            gameState.current.player.x = newWidth / 2 - 18;
            gameState.current.player.y = clientHeight - 150; 
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, [started]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playShoot = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'square'; o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.start(); o.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  const playExplosion = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const data = buf.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource(); const g = ctx.createGain();
      src.buffer = buf; src.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.3, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      src.start();
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  const playHit = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sawtooth';
      o.frequency.setValueAtTime(110, ctx.currentTime); g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 150; i++) stars.push({ x: Math.random() * 1000, y: Math.random() * 2000, r: Math.random() * 1.5 + 0.3, speed: Math.random() * 1.2 + 0.3, alpha: Math.random() * 0.7 + 0.3 });
    gameState.current.stars = stars;
  }, []);

  useEffect(() => {
    const down = (e) => {
      gameState.current.keys[e.code] = true;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
    };
    const up = (e) => { gameState.current.keys[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let localScore = 0;
    let localHp = 100;
    let localWave = 1;
    const state = gameState.current;
    
    if (state.score === 0 && state.frame === 0) {
        state.bullets = []; state.enemies = []; state.particles = []; state.items = [];
        state.speedBuffTimer = 0; setBuffTimeUI(0); buffRef.current = 0; setHealTextUI(false);
        state.player.x = canvas.width / 2 - 18; state.player.y = canvas.height - 150;
    }

    const spawnParticles = (x, y, color, count = 8) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = Math.random() * 3 + 1;
        state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: Math.random() * 3 + 1 });
      }
    };

    const loop = () => {
      if (state.gameOver) return;
      state.frame++;
      const W = canvasSize.width;
      const H = canvasSize.height;

      const hasBuff = state.speedBuffTimer > state.frame;
      const fireRate = hasBuff ? 6 : 10; 
      const bSpeed = hasBuff ? 20 : 14;

      let newBuffTime = hasBuff ? Math.ceil((state.speedBuffTimer - state.frame) / 60) : 0;
      if (newBuffTime !== buffRef.current) {
          buffRef.current = newBuffTime;
          setBuffTimeUI(newBuffTime);
      }

      const moveLeft = state.keys['ArrowLeft'] || state.keys['KeyA'] || touchState.current.left;
      const moveRight = state.keys['ArrowRight'] || state.keys['KeyD'] || touchState.current.right;
      const moveUp = state.keys['ArrowUp'] || state.keys['KeyW'] || touchState.current.up;
      const moveDown = state.keys['ArrowDown'] || state.keys['KeyS'] || touchState.current.down;
      const firing = (state.keys['Space'] || state.keys['KeyZ'] || state.keys['KeyX'] || touchState.current.fire) && state.frame % fireRate === 0;

      const spd = 6;
      if (moveLeft && state.player.x > 0) state.player.x -= spd;
      if (moveRight && state.player.x < W - state.player.width) state.player.x += spd;
      if (moveUp && state.player.y > 0) state.player.y -= spd;
      if (moveDown && state.player.y < H - state.player.height) state.player.y += spd;

      if (firing) {
        const bx = state.player.x + state.player.width / 2 - 3;
        const by = state.player.y - 10;
        state.bullets.push({ x: bx, y: by, vx: 0, vy: -bSpeed, width: 6, height: 18, trail: [] });
        
        if (hasBuff) {
           const spreadAngle = 0.2; 
           const vxSpread = Math.sin(spreadAngle) * bSpeed;
           const vySpread = -Math.cos(spreadAngle) * bSpeed;
           state.bullets.push({ x: bx - 10, y: by, vx: -vxSpread, vy: vySpread, width: 6, height: 18, trail: [] });
           state.bullets.push({ x: bx + 10, y: by, vx: vxSpread, vy: vySpread, width: 6, height: 18, trail: [] });
        }
        playShoot();
      }

      state.bullets = state.bullets.filter(b => b.y > -20 && b.x > -20 && b.x < W + 20).map(b => {
        b.trail.unshift({ x: b.x, y: b.y });
        if (b.trail.length > 5) b.trail.pop();
        return { ...b, x: b.x + b.vx, y: b.y + b.vy };
      });

      state.stars.forEach(s => { s.y += s.speed; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });

      if (state.frame % 150 === 0) {
          const rand = Math.random();
          if (rand < 0.15) { 
            state.items.push({ x: Math.random() * (W - 24), y: -30, width: 24, height: 24, type: 'speed' });
          } else if (rand > 0.85) { 
            state.items.push({ x: Math.random() * (W - 24), y: -30, width: 24, height: 24, type: 'heal' });
          }
      }
      state.items = state.items.filter(i => i.y < H).map(i => ({ ...i, y: i.y + 2 }));

      const waveSpeed = 1.5 + localWave * 0.3; 
      const spawnRate = Math.max(40, 80 - localWave * 5); 
      
      if (state.frame % spawnRate === 0) {
        state.enemies.push({
          x: Math.random() * (W - 40), y: -50, width: 36, height: 36,
          hp: 1 + Math.floor(localWave / 3), maxHp: 1 + Math.floor(localWave / 3),
          wobble: Math.random() * Math.PI * 2, wobbleSpeed: (Math.random() - 0.5) * 0.05,
        });
      }
      state.enemies = state.enemies.filter(e => e.y < H + 50).map(e => ({
        ...e, y: e.y + waveSpeed, x: e.x + Math.sin(e.wobble) * 1.2, wobble: e.wobble + e.wobbleSpeed,
      }));

      state.particles = state.particles.filter(p => p.life > 0).map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1, life: p.life - 0.04, size: p.size * 0.95
      }));

      state.items.forEach(i => {
         if (state.player.x < i.x + i.width && state.player.x + state.player.width > i.x &&
             state.player.y < i.y + i.height && state.player.y + state.player.height > i.y) {
             i.dead = true;
             if (i.type === 'speed') {
                 state.speedBuffTimer = state.frame + (60 * 15); 
                 spawnParticles(i.x, i.y, '#3CFF00', 15);
             } else if (i.type === 'heal') {
                 localHp = Math.min(200, localHp + 100); 
                 state.hp = localHp; setHp(localHp);
                 spawnParticles(i.x, i.y, '#FF1493', 15);
                 setHealTextUI(true);
                 setTimeout(() => setHealTextUI(false), 1500);
             }
         }
      });
      state.items = state.items.filter(i => !i.dead);

      const deadBullets = new Set();
      const deadEnemies = new Set();
      state.bullets.forEach((b, bi) => {
        state.enemies.forEach((e, ei) => {
          if (!deadBullets.has(bi) && !deadEnemies.has(ei) &&
            b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
            deadBullets.add(bi); e.hp--;
            if (e.hp <= 0) {
              deadEnemies.add(ei);
              spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff6b6b', 10);
              playExplosion();
              localScore += 100 * localWave;
              state.score = localScore; setScore(localScore);
              if (localScore > 0 && localScore % 1000 === 0) {
                localWave++; state.wave = localWave; setWave(localWave);
              }
            } else { spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ffaa00', 4); }
          }
        });
      });
      state.bullets = state.bullets.filter((_, i) => !deadBullets.has(i));

      state.enemies.forEach((e, ei) => {
        if (!deadEnemies.has(ei) &&
          state.player.x < e.x + e.width && state.player.x + state.player.width > e.x &&
          state.player.y < e.y + e.height && state.player.y + state.player.height > e.y) {
          deadEnemies.add(ei);
          spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff4444', 12);
          playHit();
          localHp = Math.max(0, localHp - 20); state.hp = localHp; setHp(localHp);
          if (localHp <= 0) {
            state.gameOver = true; setGameOver(true);
            saveScore(localScore); return;
          }
        }
      });
      state.enemies = state.enemies.filter((_, i) => !deadEnemies.has(i));

      // --- DRAW ---
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#060412'; ctx.fillRect(0, 0, W, H);

      state.stars.forEach(s => { 
          if(s.x > W) s.x = Math.random() * W;
          ctx.globalAlpha = s.alpha; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); 
      });
      ctx.globalAlpha = 1;

      state.particles.forEach(p => { ctx.globalAlpha = p.life * 0.9; ctx.fillStyle = p.color; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); });
      ctx.globalAlpha = 1;

      state.items.forEach(i => {
         const cx = i.x + i.width/2; const cy = i.y + i.height/2;
         ctx.save(); ctx.translate(cx, cy);
         if (i.type === 'speed') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#3CFF00';
            ctx.fillStyle = `rgba(60, 255, 0, ${0.7 + Math.sin(state.frame * 0.1) * 0.3})`;
            ctx.beginPath(); ctx.arc(0, 0, i.width/2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#FFF'; ctx.font = 'bold 14px Orbitron'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('S', 0, 1);
         } else if (i.type === 'heal') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#FF1493';
            ctx.fillStyle = `rgba(255, 20, 147, ${0.7 + Math.sin(state.frame * 0.1) * 0.3})`;
            ctx.beginPath(); ctx.arc(0, 0, i.width/2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#FFF'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('+', 0, 1);
         }
         ctx.restore();
      });

      state.bullets.forEach(b => {
        b.trail.forEach((t, ti) => {
          ctx.globalAlpha = (1 - ti / b.trail.length) * 0.4;
          ctx.fillStyle = hasBuff ? '#3CFF00' : '#ffe066';
          ctx.fillRect(t.x + 1, t.y, 4, 6);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(b.x + b.width/2, b.y + b.height/2);
        const angle = Math.atan2(b.vy, b.vx) + Math.PI/2; 
        ctx.rotate(angle);

        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
        grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.4, hasBuff ? '#3CFF00' : '#ffe066'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(-b.width/2, -b.height/2, b.width + 2, b.height + 4);
        ctx.restore();
      });

      state.enemies.forEach(e => {
        const cx = e.x + e.width / 2;
        const cy = e.y + e.height / 2;
        const hpRatio = e.hp / e.maxHp;
        ctx.save(); ctx.translate(cx, cy);
        if (e.maxHp > 1) {
          ctx.fillStyle = '#333'; ctx.fillRect(-14, -26, 28, 3);
          ctx.fillStyle = hpRatio > 0.5 ? '#44ff88' : '#ff4444';
          ctx.fillRect(-14, -26, 28 * hpRatio, 3);
        }
        ctx.rotate(Math.PI); 
        ctx.fillStyle = hpRatio < 0.5 ? '#cc3333' : '#ff4444';
        ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(16, 12); ctx.lineTo(8, 6);
        ctx.lineTo(0, 10); ctx.lineTo(-8, 6); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff9966'; ctx.beginPath(); ctx.arc(0, -4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,100,100,${0.3 + Math.sin(state.frame * 0.2) * 0.2})`;
        ctx.beginPath(); ctx.ellipse(0, 12, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      const px = state.player.x + state.player.width / 2;
      const py = state.player.y + state.player.height / 2;
      ctx.save(); ctx.translate(px, py);
      ctx.fillStyle = `rgba(80,180,255,${0.4 + Math.sin(state.frame * 0.3) * 0.2})`;
      ctx.beginPath(); ctx.ellipse(0, 20, 7, 5 + Math.sin(state.frame * 0.4) * 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ecfff'; ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(-20, 18); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6, 5); ctx.lineTo(20, 18); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a8e6ff'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(10, 8); ctx.lineTo(6, 16); ctx.lineTo(-6, 16); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ddf5ff'; ctx.beginPath(); ctx.arc(0, -6, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [started, gameOver, playShoot, playExplosion, playHit, canvasSize]);

  const restart = () => {
    // รีเซ็ตค่าใน Ref เบื้องหลัง
    gameState.current.score = 0; 
    gameState.current.frame = 0;
    gameState.current.gameOver = false; // <--- จุดที่ต้องเพิ่มเข้าไปครับ!

    // รีเซ็ต State ของหน้าจอ
    setScore(0); 
    setHp(100); 
    setWave(1); 
    setGameOver(false); 
    setStarted(true);
  };

  const onTouchStart = (dir) => (e) => { e.preventDefault(); touchState.current[dir] = true; };
  const onTouchEnd = (dir) => (e) => { e.preventDefault(); touchState.current[dir] = false; };

  const hpColor = hp > 60 ? '#44e88a' : hp > 30 ? '#ffa500' : '#ff4444';

  return (
    <div ref={containerRef} className="relative w-full h-[100dvh] bg-[#060412] font-['Orbitron'] select-none overflow-hidden flex justify-center">
      
      {/* ---------------- CANVAS LAYER ---------------- */}
      <canvas 
        ref={canvasRef} 
        width={canvasSize.width} 
        height={canvasSize.height} 
        className="block bg-[#060412]"
        style={{ width: `${canvasSize.width}px`, height: '100%' }}
      />

      {/* ---------------- HUD OVERLAY ---------------- */}
      <div className="absolute top-0 left-0 w-full z-10 px-4 py-4 md:px-8 pointer-events-none">
        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-2 pointer-events-auto">
            <div className="flex justify-between items-start">
                {/* กลุ่มฝั่งซ้าย: ปุ่มควบคุม + Score */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => navigate('/dashboard/minigames')} className="bg-black/40 hover:bg-white/20 p-2 md:p-3 rounded-xl border border-white/10 text-white backdrop-blur-sm transition-all flex items-center justify-center">
                            <ArrowLeft size={24} />
                        </button>
                        <button onClick={() => setIsMuted(m => !m)} className="bg-black/40 hover:bg-white/20 p-2 md:p-3 rounded-xl border border-white/10 text-white backdrop-blur-sm transition-all flex items-center justify-center">
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>

                    {/* Score อยู่ฝั่งซ้าย */}
                    <div className="flex flex-col items-start bg-black/40 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm h-[96px] justify-center">
                        <span className="text-[10px] md:text-xs text-[#7ecfff] tracking-widest uppercase">Score</span>
                        <span className="text-xl md:text-2xl font-bold text-[#ffe066] leading-none drop-shadow-[0_0_8px_rgba(255,224,102,0.5)]">
                            {formatScore(score)}
                        </span>
                    </div>
                </div>
            </div>

            {/* แถบ HP */}
            <div className="flex items-center gap-3 px-2 mt-1">
                <span className="text-gray-300 text-xs font-bold w-6 drop-shadow-md">HP</span>
                <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, hp)}%`, backgroundColor: hpColor, boxShadow: `0 0 10px ${hpColor}` }} />
                </div>
                <span className="text-xs font-bold w-8 text-right drop-shadow-md" style={{ color: hpColor }}>{hp}%</span>
            </div>
            
            {/* สถานะ Buff/Heal */}
            <div className="h-4 px-2 flex justify-start items-center w-full mt-1 gap-4">
            {healTextUI && (
                <span className="text-[#FF1493] text-sm font-bold flex items-center gap-1 animate-[bounce_0.5s_infinite] drop-shadow-[0_0_8px_#FF1493]">
                    <Heart size={14}/> +20 HP
                </span>
            )}
            {buffTimeUI > 0 && (
                <span className="text-[#3CFF00] text-sm font-bold flex items-center gap-1 animate-pulse drop-shadow-[0_0_8px_#3CFF00]">
                    <Zap size={14}/> SPEED: {buffTimeUI}s
                </span>
            )}
            </div>
        </div>
      </div>

      {/* ---------------- OVERLAY MENUS (Start & Game Over) ---------------- */}
      {!started && !gameOver && (
        <div className="absolute inset-0 bg-[#060412]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50">
          <Rocket size={72} className="text-[#7ecfff] mb-6 animate-pulse drop-shadow-[0_0_20px_#7ecfff]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#7ecfff] tracking-[0.2em] mb-4 text-center">STARFIGHTER</h1>
          <div className="text-gray-300 text-sm tracking-wider text-center leading-loose mb-10 font-['Rajdhani'] bg-black/40 px-6 py-4 rounded-xl border border-white/10 pointer-events-auto">
            <span className="text-white font-bold">W A S D / Arrows :</span> Move <br/> 
            <span className="text-white font-bold">Space / Z :</span> Fire <br/> 
            <span className="text-gray-500 mt-2 block">or Use On-Screen Controls</span>
          </div>
          <button onClick={() => setStarted(true)} className="px-10 py-4 bg-[#7ecfff]/10 border-2 border-[#7ecfff] text-[#7ecfff] rounded-xl hover:bg-[#7ecfff]/30 transition-all font-bold tracking-[0.3em] shadow-[0_0_20px_rgba(126,207,255,0.4)] text-lg pointer-events-auto">
            LAUNCH
          </button>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-[#060412]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate__animated animate__fadeIn">
          <Skull size={64} className="text-red-500 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <h1 className="text-4xl font-bold text-red-500 tracking-[0.2em] mb-8 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h1>
          
          <div className="bg-black/50 border border-white/10 p-6 rounded-2xl text-center mb-8 w-full max-w-sm backdrop-blur-sm pointer-events-auto">
             <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">Final Score</p>
             <p className="text-5xl font-bold text-[#ffe066] drop-shadow-[0_0_20px_rgba(255,224,102,0.6)] mb-4">{score.toLocaleString()}</p>
             <p className="text-gray-500 text-sm tracking-wider">Reached Wave {wave}</p>
          </div>

          {/* ปรับให้ปุ่มนี้กดติดแน่นอนด้วย pointer-events-auto */}
          <button onClick={restart} className="px-10 py-4 bg-[#7ecfff]/10 border-2 border-[#7ecfff] text-[#7ecfff] rounded-xl hover:bg-[#7ecfff]/30 transition-all font-bold tracking-[0.3em] text-lg shadow-[0_0_15px_rgba(126,207,255,0.3)] pointer-events-auto relative z-[60]">
            TRY AGAIN
          </button>
        </div>
      )}

      {/* ---------------- MOBILE CONTROLS OVERLAY ---------------- */}
      <div className="absolute bottom-6 w-full z-10 px-4 pointer-events-none">
        <div className="w-full max-w-[600px] mx-auto flex justify-between items-end pointer-events-auto">
            <div className="grid grid-cols-3 grid-rows-3 gap-1">
                <div />
                <button onTouchStart={onTouchStart('up')} onTouchEnd={onTouchEnd('up')} onMouseDown={onTouchStart('up')} onMouseUp={onTouchEnd('up')} onMouseLeave={onTouchEnd('up')} className="w-14 h-14 rounded-2xl bg-black/40 border border-[#7ecfff]/40 flex items-center justify-center text-[#7ecfff] active:bg-[#7ecfff]/30 backdrop-blur-md shadow-[0_0_10px_rgba(126,207,255,0.2)]"><ChevronUp size={32} /></button>
                <div />
                <button onTouchStart={onTouchStart('left')} onTouchEnd={onTouchEnd('left')} onMouseDown={onTouchStart('left')} onMouseUp={onTouchEnd('left')} onMouseLeave={onTouchEnd('left')} className="w-14 h-14 rounded-2xl bg-black/40 border border-[#7ecfff]/40 flex items-center justify-center text-[#7ecfff] active:bg-[#7ecfff]/30 backdrop-blur-md shadow-[0_0_10px_rgba(126,207,255,0.2)]"><ChevronLeft size={32} /></button>
                <div className="w-14 h-14 flex items-center justify-center text-[#7ecfff]/20 text-xs">⚫</div>
                <button onTouchStart={onTouchStart('right')} onTouchEnd={onTouchEnd('right')} onMouseDown={onTouchStart('right')} onMouseUp={onTouchEnd('right')} onMouseLeave={onTouchEnd('right')} className="w-14 h-14 rounded-2xl bg-black/40 border border-[#7ecfff]/40 flex items-center justify-center text-[#7ecfff] active:bg-[#7ecfff]/30 backdrop-blur-md shadow-[0_0_10px_rgba(126,207,255,0.2)]"><ChevronRight size={32} /></button>
                <div />
                <button onTouchStart={onTouchStart('down')} onTouchEnd={onTouchEnd('down')} onMouseDown={onTouchStart('down')} onMouseUp={onTouchEnd('down')} onMouseLeave={onTouchEnd('down')} className="w-14 h-14 rounded-2xl bg-black/40 border border-[#7ecfff]/40 flex items-center justify-center text-[#7ecfff] active:bg-[#7ecfff]/30 backdrop-blur-md shadow-[0_0_10px_rgba(126,207,255,0.2)]"><ChevronDown size={32} /></button>
                <div />
            </div>

            <button onTouchStart={onTouchStart('fire')} onTouchEnd={onTouchEnd('fire')} onMouseDown={onTouchStart('fire')} onMouseUp={onTouchEnd('fire')} onMouseLeave={onTouchEnd('fire')} className="w-24 h-24 mb-4 rounded-full bg-black/40 border-2 border-red-500/60 flex items-center justify-center text-red-500 active:bg-red-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <Crosshair size={48} />
            </button>
        </div>
      </div>

    </div>
  );
};

export default ShootEmUp;