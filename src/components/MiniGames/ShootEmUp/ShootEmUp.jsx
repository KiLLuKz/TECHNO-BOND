import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, Rocket, Skull, Zap, Heart, ShieldAlert, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; 
import { motion, AnimatePresence } from 'framer-motion';

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

const VIRTUAL_WIDTH = 600;

// EXP Table: Required EXP to reach the next level
const EXP_TABLE = {
  1: 100,
  2: 250,
  3: 500,
  4: 1000,
  5: 999999 // Max Level
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
  const [shieldActiveUI, setShieldActiveUI] = useState(false);
  
  // Progression UI State
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const gameState = useRef({
    player: { x: VIRTUAL_WIDTH / 2 - 18, y: 800 - 150, width: 36, height: 36 },
    bullets: [], enemies: [], particles: [], stars: [], items: [], floatingTexts: [],
    keys: {}, frame: 0, score: 0, hp: 100, wave: 1, gameOver: false,
    speedBuffTimer: 0, shieldActive: false, screenShake: 0,
    level: 1, exp: 0,
    vh: 800 // Virtual Height, will be dynamic based on screen
  });

  const touchState = useRef({ isDragging: false, startX: 0, startY: 0, initialPlayerX: 0, initialPlayerY: 0 });
  const buffRef = useRef(0);
  const audioCtx = useRef(null);
  const drawScale = useRef(1);

  // Responsive & Virtual Canvas Setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        // หักลบ pt-[80px] หรือขนาด Header
        const containerHeight = container.clientHeight - 80; 
        
        // จำกัดความกว้างสูงสุดไว้ที่ 600px ป้องกันภาพแตก/ยืดแนวนอนเวลาเล่นบน PC
        const containerWidth = Math.min(container.clientWidth, 600);
        
        // Dynamic Virtual Height: ให้ Aspect Ratio ของเกมพอดีกับจอเป๊ะๆ ไม่มีขอบดำ
        const ratio = containerHeight / containerWidth;
        const vHeight = VIRTUAL_WIDTH * ratio;
        gameState.current.vh = vHeight;

        // Scale
        const scale = containerWidth / VIRTUAL_WIDTH;
        drawScale.current = scale;
        
        const cssWidth = VIRTUAL_WIDTH * scale;
        const cssHeight = vHeight * scale;
        
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        
        // จัดการความคมชัดบนจอ High-DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(scale * dpr, scale * dpr);

        // Adjust player position on init
        if (!started && gameState.current.frame === 0) {
           gameState.current.player.y = vHeight - 150;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    setTimeout(handleResize, 100);
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
      g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
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

  const playLevelUp = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
      o.frequency.setValueAtTime(440, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      o.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch (_) {}
  }, [isMuted, getAudioCtx]);

  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 150; i++) stars.push({ x: Math.random() * VIRTUAL_WIDTH, y: Math.random() * 2000, r: Math.random() * 1.5 + 0.3, speed: Math.random() * 1.2 + 0.3, alpha: Math.random() * 0.7 + 0.3 });
    gameState.current.stars = stars;
  }, []);

  useEffect(() => {
    const down = (e) => {
      gameState.current.keys[e.code] = true;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
    };
    const up = (e) => { gameState.current.keys[e.code] = false; };
    window.addEventListener('keydown', down, {passive: false});
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
    let localExp = 0;
    let localLevel = 1;
    const state = gameState.current;
    
    if (state.score === 0 && state.frame === 0) {
        state.bullets = []; state.enemies = []; state.particles = []; state.items = []; state.floatingTexts = [];
        state.speedBuffTimer = 0; setBuffTimeUI(0); buffRef.current = 0; setHealTextUI(false);
        state.shieldActive = false; setShieldActiveUI(false); state.screenShake = 0;
        state.level = 1; state.exp = 0; setLevel(1); setExp(0);
        state.player.x = VIRTUAL_WIDTH / 2 - 18; state.player.y = state.vh - 150;
    }

    const spawnParticles = (x, y, color, count = 8, spread = 3) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = Math.random() * spread + 1;
        state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: Math.random() * 3 + 2 });
      }
    };

    const addFloatingText = (x, y, text, color) => {
      state.floatingTexts.push({ x, y, text, color, life: 1, vy: -1 });
    };

    const addExp = (amount) => {
        if (localLevel >= 5) return;
        localExp += amount;
        let req = EXP_TABLE[localLevel];
        if (localExp >= req) {
            localExp -= req;
            localLevel++;
            state.level = localLevel; setLevel(localLevel);
            playLevelUp();
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 2000);
            
            // Burst Effect on Level Up
            spawnParticles(state.player.x + 18, state.player.y + 18, '#ffe066', 40, 8);
        }
        state.exp = localExp; setExp(localExp);
    };

    const loop = () => {
      if (state.gameOver) return;
      state.frame++;
      const W = VIRTUAL_WIDTH;
      const H = state.vh;

      const hasBuff = state.speedBuffTimer > state.frame;
      
      // Weapon Config based on Level
      let fireRate = 12;
      let bSpeed = 16;
      let dmgMult = 1;

      if (localLevel >= 3) fireRate = 8;
      if (localLevel >= 5) { fireRate = 6; dmgMult = 1.5; bSpeed = 20; }
      if (hasBuff) fireRate = Math.max(3, fireRate - 4); // Speed buff makes it even faster

      let newBuffTime = hasBuff ? Math.ceil((state.speedBuffTimer - state.frame) / 60) : 0;
      if (newBuffTime !== buffRef.current) {
          buffRef.current = newBuffTime;
          setBuffTimeUI(newBuffTime);
      }

      const moveLeft = state.keys['ArrowLeft'] || state.keys['KeyA'];
      const moveRight = state.keys['ArrowRight'] || state.keys['KeyD'];
      const moveUp = state.keys['ArrowUp'] || state.keys['KeyW'];
      const moveDown = state.keys['ArrowDown'] || state.keys['KeyS'];

      const spd = 7;
      if (moveLeft && state.player.x > 0) state.player.x -= spd;
      if (moveRight && state.player.x < W - state.player.width) state.player.x += spd;
      if (moveUp && state.player.y > 0) state.player.y -= spd;
      if (moveDown && state.player.y < H - state.player.height) state.player.y += spd;

      // Auto Fire Logic based on Weapon Level
      if (state.frame % fireRate === 0) {
        const bx = state.player.x + state.player.width / 2;
        const by = state.player.y - 5;
        
        if (localLevel === 1) {
            // Lvl 1: Single straight
            state.bullets.push({ x: bx - 3, y: by, vx: 0, vy: -bSpeed, width: 6, height: 18, dmg: dmgMult, trail: [] });
        } else if (localLevel === 2 || localLevel === 3) {
            // Lvl 2-3: Double straight
            state.bullets.push({ x: bx - 10, y: by, vx: 0, vy: -bSpeed, width: 6, height: 18, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx + 4, y: by, vx: 0, vy: -bSpeed, width: 6, height: 18, dmg: dmgMult, trail: [] });
        } else if (localLevel === 4) {
            // Lvl 4: Triple Spread
            state.bullets.push({ x: bx - 3, y: by, vx: 0, vy: -bSpeed, width: 6, height: 18, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx - 15, y: by, vx: -bSpeed*0.15, vy: -bSpeed*0.98, width: 6, height: 18, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx + 9, y: by, vx: bSpeed*0.15, vy: -bSpeed*0.98, width: 6, height: 18, dmg: dmgMult, trail: [] });
        } else if (localLevel >= 5) {
            // Lvl 5: Penta Spread
            state.bullets.push({ x: bx - 3, y: by, vx: 0, vy: -bSpeed, width: 8, height: 20, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx - 12, y: by, vx: -bSpeed*0.15, vy: -bSpeed*0.98, width: 6, height: 18, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx + 6, y: by, vx: bSpeed*0.15, vy: -bSpeed*0.98, width: 6, height: 18, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx - 20, y: by + 5, vx: -bSpeed*0.3, vy: -bSpeed*0.95, width: 6, height: 18, dmg: dmgMult, trail: [] });
            state.bullets.push({ x: bx + 14, y: by + 5, vx: bSpeed*0.3, vy: -bSpeed*0.95, width: 6, height: 18, dmg: dmgMult, trail: [] });
        }

        playShoot();
      }

      state.bullets = state.bullets.filter(b => b.y > -20 && b.x > -20 && b.x < W + 20).map(b => {
        b.trail.unshift({ x: b.x, y: b.y });
        if (b.trail.length > 5) b.trail.pop();
        return { ...b, x: b.x + b.vx, y: b.y + b.vy };
      });

      state.stars.forEach(s => { s.y += s.speed; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });

      if (state.frame % 200 === 0) {
          const rand = Math.random();
          if (rand < 0.15) { 
            state.items.push({ x: Math.random() * (W - 24), y: -30, width: 24, height: 24, type: 'speed' });
          } else if (rand > 0.85) { 
            state.items.push({ x: Math.random() * (W - 24), y: -30, width: 24, height: 24, type: 'heal' });
          } else if (rand > 0.70 && !state.shieldActive) {
            state.items.push({ x: Math.random() * (W - 24), y: -30, width: 24, height: 24, type: 'shield' });
          }
      }
      state.items = state.items.filter(i => i.y < H).map(i => ({ ...i, y: i.y + 2 }));

      const waveSpeed = 1.5 + localWave * 0.05; 
      const spawnRate = Math.max(25, 70 - localWave * 1.5); 
      
      if (state.frame % spawnRate === 0) {
        const randType = Math.random();
        let type = 'basic';
        let hpMult = 1;
        let w = 36, h = 36;
        let speedMult = 1;

        if (localWave > 2 && randType < 0.2) {
            type = 'tank'; hpMult = 4; w = 50; h = 50; speedMult = 0.5;
        } else if (localWave > 1 && randType > 0.7) {
            type = 'scout'; hpMult = 0.8; w = 28; h = 28; speedMult = 1.5;
        }

        const maxHp = Math.ceil((1 + Math.floor(localWave / 7)) * hpMult);
        state.enemies.push({
          x: Math.random() * (W - w), y: -50, width: w, height: h, type,
          hp: maxHp, maxHp: maxHp,
          wobble: Math.random() * Math.PI * 2, wobbleSpeed: (Math.random() - 0.5) * 0.05,
          speedMult
        });
      }

      state.enemies = state.enemies.filter(e => e.y < H + 50).map(e => {
        let newX = e.x;
        let newY = e.y + (waveSpeed * e.speedMult);
        if (e.type === 'scout') {
            newX = e.x + Math.sin(e.wobble) * 4;
        } else if (e.type === 'basic') {
            newX = e.x + Math.sin(e.wobble) * 1.2;
        }
        return { ...e, y: newY, x: newX, wobble: e.wobble + e.wobbleSpeed };
      });

      // Physics logic
      state.particles = state.particles.filter(p => p.life > 0).map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 0.03, size: p.size * 0.95
      }));
      state.floatingTexts = state.floatingTexts.filter(f => f.life > 0).map(f => ({
        ...f, y: f.y + f.vy, life: f.life - 0.02
      }));

      // Player Engine Trail
      if (state.frame % 2 === 0) {
        state.particles.push({
            x: state.player.x + state.player.width / 2 + (Math.random() - 0.5) * 10,
            y: state.player.y + state.player.height,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 2 + 2,
            life: 0.6, color: '#7ecfff', size: Math.random() * 4 + 2
        });
      }

      state.items.forEach(i => {
         if (state.player.x < i.x + i.width && state.player.x + state.player.width > i.x &&
             state.player.y < i.y + i.height && state.player.y + state.player.height > i.y) {
             i.dead = true;
             // Any item heals slightly at high levels
             if (localLevel >= 4) localHp = Math.min(200, localHp + 5); 
             if (i.type === 'speed') {
                 state.speedBuffTimer = state.frame + (60 * 15); 
                 spawnParticles(i.x, i.y, '#3CFF00', 20, 5);
             } else if (i.type === 'heal') {
                 localHp = Math.min(200, localHp + 50); 
                 state.hp = localHp; setHp(localHp);
                 spawnParticles(i.x, i.y, '#FF1493', 20, 5);
                 setHealTextUI(true);
                 setTimeout(() => setHealTextUI(false), 1500);
             } else if (i.type === 'shield') {
                 state.shieldActive = true; setShieldActiveUI(true);
                 spawnParticles(i.x, i.y, '#4ECDC4', 20, 5);
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
            deadBullets.add(bi); 
            e.hp -= b.dmg; // Damage scaling from bullets
            
            if (e.hp <= 0) {
              deadEnemies.add(ei);
              spawnParticles(e.x + e.width / 2, e.y + e.height / 2, e.type === 'tank' ? '#ffaa00' : '#ff6b6b', e.type === 'tank' ? 25 : 12, e.type === 'tank' ? 6 : 3);
              playExplosion();
              if (e.type === 'tank') state.screenShake = 10;
              
              const points = e.type === 'tank' ? 300 : e.type === 'scout' ? 150 : 100;
              const expGiven = e.type === 'tank' ? 100 : e.type === 'scout' ? 30 : 25;
              
              addExp(expGiven);
              addFloatingText(e.x + e.width/2, e.y, `+${expGiven} EXP`, '#ffe066');

              localScore += points * localWave;
              state.score = localScore; setScore(localScore);
              
              if (localScore > 0 && localScore % 2000 < (points * localWave)) { 
                localWave++; state.wave = localWave; setWave(localWave);
              }
            } else { 
                spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ffaa00', 4, 2); 
            }
          }
        });
      });
      state.bullets = state.bullets.filter((_, i) => !deadBullets.has(i));

      state.enemies.forEach((e, ei) => {
        if (!deadEnemies.has(ei) &&
          state.player.x + 5 < e.x + e.width && state.player.x + state.player.width - 5 > e.x &&
          state.player.y + 5 < e.y + e.height && state.player.y + state.player.height - 5 > e.y) {
          deadEnemies.add(ei);
          spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff4444', 20, 5);
          playHit();
          state.screenShake = 15;
          
          if (state.shieldActive) {
             state.shieldActive = false; setShieldActiveUI(false);
             spawnParticles(state.player.x + state.player.width/2, state.player.y + state.player.height/2, '#4ECDC4', 30, 8);
          } else {
             localHp = Math.max(0, localHp - (e.type === 'tank' ? 40 : 20)); state.hp = localHp; setHp(localHp);
             if (localHp <= 0) {
               state.gameOver = true; setGameOver(true);
               spawnParticles(state.player.x + state.player.width/2, state.player.y + state.player.height/2, '#7ecfff', 50, 10);
               saveScore(localScore); return;
             }
          }
        }
      });
      state.enemies = state.enemies.filter((_, i) => !deadEnemies.has(i));

      // --- DRAW ---
      ctx.clearRect(0, 0, W, H);
      
      // Screen Shake Application
      ctx.save();
      if (state.screenShake > 0) {
          ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
          state.screenShake *= 0.9;
          if (state.screenShake < 0.5) state.screenShake = 0;
      }

      ctx.fillStyle = '#060412'; ctx.fillRect(0, 0, W, H);

      state.stars.forEach(s => { 
          if(s.x > W) s.x = Math.random() * W;
          ctx.globalAlpha = s.alpha; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); 
      });
      ctx.globalAlpha = 1;

      state.particles.forEach(p => { 
          ctx.globalAlpha = Math.max(0, p.life); 
          ctx.fillStyle = p.color; 
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
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
         } else if (i.type === 'shield') {
            ctx.shadowBlur = 15; ctx.shadowColor = '#4ECDC4';
            ctx.fillStyle = `rgba(78, 205, 196, ${0.7 + Math.sin(state.frame * 0.1) * 0.3})`;
            ctx.beginPath(); ctx.arc(0, 0, i.width/2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#FFF'; ctx.font = 'bold 14px Orbitron'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('O', 0, 1);
         }
         ctx.restore();
      });

      state.bullets.forEach(b => {
        b.trail.forEach((t, ti) => {
          ctx.globalAlpha = (1 - ti / b.trail.length) * 0.4;
          ctx.fillStyle = hasBuff || localLevel >= 5 ? '#3CFF00' : '#ffe066';
          ctx.fillRect(t.x + 1, t.y, 4, 6);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(b.x + b.width/2, b.y + b.height/2);
        const angle = Math.atan2(b.vy, b.vx) + Math.PI/2; 
        ctx.rotate(angle);

        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
        grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.4, hasBuff || localLevel >= 5 ? '#3CFF00' : '#ffe066'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(-b.width/2, -b.height/2, b.width + 2, b.height + 4);
        ctx.restore();
      });

      state.enemies.forEach(e => {
        const cx = e.x + e.width / 2;
        const cy = e.y + e.height / 2;
        const hpRatio = e.hp / e.maxHp;
        ctx.save(); ctx.translate(cx, cy);
        
        if (e.maxHp > 1) {
          ctx.fillStyle = '#333'; ctx.fillRect(-14, -e.height/2 - 10, 28, 3);
          ctx.fillStyle = hpRatio > 0.5 ? '#44ff88' : '#ff4444';
          ctx.fillRect(-14, -e.height/2 - 10, 28 * hpRatio, 3);
        }
        
        ctx.rotate(Math.PI); 
        
        if (e.type === 'tank') {
            ctx.fillStyle = '#ff6b6b'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff6b6b';
            ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(20, -10); ctx.lineTo(25, 10); ctx.lineTo(0, 20); ctx.lineTo(-25, 10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
        } else if (e.type === 'scout') {
            ctx.fillStyle = '#4ECDC4'; ctx.shadowBlur = 10; ctx.shadowColor = '#4ECDC4';
            ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(15, 15); ctx.lineTo(0, 5); ctx.lineTo(-15, 15); ctx.closePath(); ctx.fill();
        } else {
            ctx.fillStyle = hpRatio < 0.5 ? '#cc3333' : '#ff4444';
            ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(16, 12); ctx.lineTo(8, 6);
            ctx.lineTo(0, 10); ctx.lineTo(-8, 6); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ff9966'; ctx.beginPath(); ctx.arc(0, -4, 5, 0, Math.PI * 2); ctx.fill();
        }
        
        ctx.fillStyle = `rgba(255,100,100,${0.3 + Math.sin(state.frame * 0.2) * 0.2})`;
        ctx.beginPath(); ctx.ellipse(0, e.height/2 - 2, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // Player
      if (!state.gameOver) {
          const px = state.player.x + state.player.width / 2;
          const py = state.player.y + state.player.height / 2;
          ctx.save(); ctx.translate(px, py);
          
          if (state.shieldActive) {
             ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI*2);
             ctx.fillStyle = `rgba(78, 205, 196, ${0.2 + Math.sin(state.frame*0.1)*0.1})`;
             ctx.fill();
             ctx.strokeStyle = '#4ECDC4'; ctx.lineWidth = 2; ctx.stroke();
          }

          ctx.fillStyle = `rgba(80,180,255,${0.4 + Math.sin(state.frame * 0.3) * 0.2})`;
          ctx.beginPath(); ctx.ellipse(0, 20, 7, 5 + Math.sin(state.frame * 0.4) * 3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#7ecfff'; ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(-20, 18); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(6, 5); ctx.lineTo(20, 18); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#a8e6ff'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(10, 8); ctx.lineTo(6, 16); ctx.lineTo(-6, 16); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#ddf5ff'; ctx.beginPath(); ctx.arc(0, -6, 5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
      }

      // Floating Texts
      state.floatingTexts.forEach(f => {
          ctx.globalAlpha = Math.max(0, f.life);
          ctx.fillStyle = f.color;
          ctx.font = 'bold 12px Orbitron';
          ctx.textAlign = 'center';
          ctx.fillText(f.text, f.x, f.y);
      });
      ctx.globalAlpha = 1;

      ctx.restore(); // Restore from Screen Shake

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [started, gameOver, playShoot, playExplosion, playHit, playLevelUp]);

  const restart = () => {
    gameState.current.score = 0; 
    gameState.current.frame = 0;
    gameState.current.gameOver = false;
    setScore(0); 
    setHp(100); 
    setWave(1); 
    setLevel(1);
    setExp(0);
    setGameOver(false); 
    setStarted(true);
  };

  const handleTouchStart = (e) => {
    if(!started || gameOver) return;
    touchState.current.isDragging = true;
    const touch = e.touches[0];
    touchState.current.startX = touch.clientX;
    touchState.current.startY = touch.clientY;
    touchState.current.initialPlayerX = gameState.current.player.x;
    touchState.current.initialPlayerY = gameState.current.player.y;
  };
  
  const handleTouchMove = (e) => {
    if(!started || gameOver || !touchState.current.isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchState.current.startX;
    const dy = touch.clientY - touchState.current.startY;
    
    const scale = 1 / drawScale.current;
    
    let newX = touchState.current.initialPlayerX + (dx * scale);
    let newY = touchState.current.initialPlayerY + (dy * scale);
    
    newX = Math.max(0, Math.min(VIRTUAL_WIDTH - gameState.current.player.width, newX));
    newY = Math.max(0, Math.min(gameState.current.vh - gameState.current.player.height, newY));
    
    gameState.current.player.x = newX;
    gameState.current.player.y = newY;
  };
  
  const handleTouchEnd = () => {
    touchState.current.isDragging = false;
  };

  const hpColor = hp > 60 ? '#44e88a' : hp > 30 ? '#ffa500' : '#ff4444';
  const expProgress = level >= 5 ? 100 : (exp / EXP_TABLE[level]) * 100;

  return (
    <div ref={containerRef} className="relative w-full h-[100dvh] bg-[#060412] font-['Orbitron'] select-none overflow-hidden flex justify-center pt-[80px]">
      
      {/* ---------------- CANVAS LAYER ---------------- */}
      <canvas 
        ref={canvasRef} 
        className="block bg-[#060412] touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />

      {/* ---------------- LEVEL UP ALERT ---------------- */}
      <AnimatePresence>
          {showLevelUp && (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-40"
              >
                  <h2 className="text-4xl md:text-6xl font-black text-[#ffe066] drop-shadow-[0_0_20px_rgba(255,224,102,0.8)] tracking-widest italic uppercase">
                      LEVEL UP!
                  </h2>
                  <p className="text-[#7ecfff] text-xl font-bold mt-2 drop-shadow-lg">
                      WEAPON UPGRADED TO LV. {level}
                  </p>
              </motion.div>
          )}
      </AnimatePresence>

      {/* ---------------- HUD OVERLAY ---------------- */}
      <div className="absolute top-[80px] left-0 w-full z-10 px-4 py-4 md:px-8 pointer-events-none">
        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-2 pointer-events-auto">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => navigate('/dashboard/minigames')} className="bg-black/40 hover:bg-white/20 p-2 md:p-3 rounded-xl border border-white/10 text-white backdrop-blur-sm transition-all flex items-center justify-center">
                            <ArrowLeft size={24} />
                        </button>
                        <button onClick={() => setIsMuted(m => !m)} className="bg-black/40 hover:bg-white/20 p-2 md:p-3 rounded-xl border border-white/10 text-white backdrop-blur-sm transition-all flex items-center justify-center">
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>

                    <div className="flex flex-col items-start bg-black/40 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm h-[96px] justify-center">
                        <span className="text-[10px] md:text-xs text-[#7ecfff] tracking-widest uppercase">Score</span>
                        <span className="text-xl md:text-2xl font-bold text-[#ffe066] leading-none drop-shadow-[0_0_8px_rgba(255,224,102,0.5)]">
                            {formatScore(score)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end bg-black/40 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm h-[96px] justify-center">
                    <span className="text-[10px] md:text-xs text-[#d966ff] tracking-widest uppercase flex items-center gap-1">
                        <Star size={12}/> Level
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-white leading-none drop-shadow-[0_0_8px_rgba(217,102,255,0.5)]">
                        {level >= 5 ? 'MAX' : level}
                    </span>
                </div>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-3 px-2 mt-1">
                <span className="text-gray-300 text-[10px] md:text-xs font-bold w-8 drop-shadow-md">HP</span>
                <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, hp)}%`, backgroundColor: hpColor, boxShadow: `0 0 10px ${hpColor}` }} />
                </div>
                <span className="text-[10px] md:text-xs font-bold w-8 text-right drop-shadow-md" style={{ color: hpColor }}>{hp}%</span>
            </div>

            {/* EXP Bar */}
            <div className="flex items-center gap-3 px-2">
                <span className="text-[#ffe066] text-[10px] md:text-xs font-bold w-8 drop-shadow-md">EXP</span>
                <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative backdrop-blur-sm">
                    <div className="h-full rounded-full transition-all duration-300 bg-[#ffe066] shadow-[0_0_8px_#ffe066]" style={{ width: `${expProgress}%` }} />
                </div>
                <span className="text-[10px] md:text-xs font-bold w-8 text-right text-[#ffe066] drop-shadow-md">
                   {level >= 5 ? 'MAX' : `${Math.floor(expProgress)}%`}
                </span>
            </div>
            
            {/* Status Text */}
            <div className="h-4 px-2 flex justify-start items-center w-full mt-1 gap-4">
            {healTextUI && (
                <span className="text-[#FF1493] text-[10px] md:text-xs font-bold flex items-center gap-1 animate-[bounce_0.5s_infinite] drop-shadow-[0_0_8px_#FF1493]">
                    <Heart size={12}/> +50 HP
                </span>
            )}
            {buffTimeUI > 0 && (
                <span className="text-[#3CFF00] text-[10px] md:text-xs font-bold flex items-center gap-1 animate-pulse drop-shadow-[0_0_8px_#3CFF00]">
                    <Zap size={12}/> SPEED: {buffTimeUI}s
                </span>
            )}
            {shieldActiveUI && (
                <span className="text-[#4ECDC4] text-[10px] md:text-xs font-bold flex items-center gap-1 animate-pulse drop-shadow-[0_0_8px_#4ECDC4]">
                    <ShieldAlert size={12}/> SHIELD ACTIVE
                </span>
            )}
            </div>
        </div>
      </div>

      {/* ---------------- OVERLAY MENUS ---------------- */}
      {!started && !gameOver && (
        <div className="absolute inset-0 bg-[#060412]/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50">
          <Rocket size={72} className="text-[#7ecfff] mb-6 animate-pulse drop-shadow-[0_0_20px_#7ecfff]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#7ecfff] tracking-[0.2em] mb-4 text-center">STARFIGHTER</h1>
          <div className="text-gray-300 text-sm tracking-wider text-center leading-loose mb-10 font-['Rajdhani'] bg-black/40 px-6 py-4 rounded-xl border border-white/10 pointer-events-auto">
            <span className="text-white font-bold">W A S D / Arrows :</span> Move <br/> 
            <span className="text-[#4ECDC4] font-bold">Touch & Drag :</span> Move (Auto-Fire) <br/> 
            <span className="text-[#ffe066] font-bold mt-2 inline-block">Defeat enemies to Level Up!</span>
          </div>
          <button onClick={() => setStarted(true)} className="px-10 py-4 bg-[#7ecfff]/10 border-2 border-[#7ecfff] text-[#7ecfff] rounded-xl hover:bg-[#7ecfff]/30 transition-all font-bold tracking-[0.3em] shadow-[0_0_20px_rgba(126,207,255,0.4)] text-lg pointer-events-auto">
            LAUNCH
          </button>
        </div>
      )}

      {gameOver && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-[#060412]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50"
        >
          <Skull size={64} className="text-red-500 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <h1 className="text-4xl font-bold text-red-500 tracking-[0.2em] mb-8 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GAME OVER</h1>
          
          <div className="bg-black/50 border border-white/10 p-6 rounded-2xl text-center mb-8 w-full max-w-sm backdrop-blur-sm pointer-events-auto">
             <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">Final Score</p>
             <p className="text-5xl font-bold text-[#ffe066] drop-shadow-[0_0_20px_rgba(255,224,102,0.6)] mb-2">{score.toLocaleString()}</p>
             <p className="text-[#d966ff] text-sm tracking-wider font-bold mb-2">Weapon Level: {level >= 5 ? 'MAX' : level}</p>
             <p className="text-gray-500 text-sm tracking-wider">Reached Wave {wave}</p>
          </div>

          <button onClick={restart} className="px-10 py-4 bg-[#7ecfff]/10 border-2 border-[#7ecfff] text-[#7ecfff] rounded-xl hover:bg-[#7ecfff]/30 transition-all font-bold tracking-[0.3em] text-lg shadow-[0_0_15px_rgba(126,207,255,0.3)] pointer-events-auto relative z-[60]">
            TRY AGAIN
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default ShootEmUp;