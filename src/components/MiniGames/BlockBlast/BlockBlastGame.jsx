import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ArrowLeft } from 'lucide-react';
import { drawGrid, drawBlock, getGridOffset, drawGhostBlock, findBestGridPlacement, checkAndGetClearedLines, canPlaceAnyBlock, drawTray, createTrayBlocks, updateTrayBlockPositions, GRID_SIZE, CELL_SIZE, drawClearingEffects } from './gameFunctions';
import { BLOCK_SHAPES } from './blocks';
import { useNavigate } from 'react-router-dom';
import SystemAlert from "../../SystemAlert";

import { supabase } from "../../../supabaseClient";

// ฟังก์ชันบันทึกคะแนนลง Supabase (แบบเช็ค High Score)
const saveScore = async (finalScore) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const username = user.email ? user.email.split('@')[0] : 'Player'; 
    const gameSlug = 'block-blast';

    // 1. ดึงข้อมูลคะแนนเดิมของ User คนนี้ในเกมนี้มาดูก่อน
    const { data: existingData, error: fetchError } = await supabase
      .from('leaderboard')
      .select('id, score')
      .eq('username', username)
      .eq('game_slug', gameSlug)
      .single(); // ดึงมาแค่แถวเดียว

    // ถ้ารหัส Error คือ PGRST116 แปลว่า "หาข้อมูลไม่เจอ" (ผู้เล่นเพิ่งเคยเล่นครั้งแรก) ซึ่งไม่ใช่ปัญหา
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching old score:", fetchError);
      return;
    }

    if (existingData) {
      // 2. ถ้าเคยมีคะแนนอยู่แล้ว ให้เทียบว่าคะแนนใหม่เยอะกว่าคะแนนเดิมไหม
      if (finalScore > existingData.score) {
        await supabase
          .from('leaderboard')
          .update({ score: finalScore })
          .eq('id', existingData.id); // อัปเดตแถวเดิมด้วยคะแนนใหม่
      }
      // ถ้าน้อยกว่า หรือเท่าเดิม ก็ปล่อยผ่าน ไม่ต้องทำอะไรเลย
    } else {
      // 3. ถ้าไม่เคยมีข้อมูล (เพิ่งเล่นครั้งแรก) ให้ Insert แถวใหม่
      await supabase.from('leaderboard').insert([
        { username: username, score: finalScore, game_slug: gameSlug }
      ]);
    }
  } catch (error) {
    console.error("Error saving score:", error);
  }
};


const playSound = (type, isMuted, comboCount = 0) => {
  if (isMuted) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'grab') { 
    osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1); 
  }
  else if (type === 'drop') { 
    osc.type = 'sine'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1); 
  }
  else if (type === 'clear') { 
    osc.type = 'square'; 
    const pitchShift = Math.min(comboCount, 10) * 150; 

    osc.frequency.setValueAtTime(400 + pitchShift, ctx.currentTime);
    osc.frequency.setValueAtTime(600 + pitchShift, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800 + pitchShift, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3); 
  }
  else if (type === 'gameover') { 
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5); 
  }
};

const BlockBlastGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const comboTimerRef = useRef(null); 

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [alertState, setAlertState] = useState({ 
    isOpen: false, type: 'warning', title: '', message: '', onConfirm: null 
  });

  const CANVAS_WIDTH = isDesktop ? 1250 : 600; 
  const CANVAS_HEIGHT = isDesktop ? 650 : 900; 
  const TRAY_BLOCK_SIZE = isDesktop ? 45 : 40; 

  const gameData = useRef({
    grid: Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)),
    availableBlocks: [],
    activeBlock: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0, 
    startY: 0, 
    isDragging: false, 
    clearingEffects: [], 
    floatingTexts: [], 
    megaEffect: { active: false, phase: 0, progress: 0 } 
  });

  const performReset = () => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    const canvas = canvasRef.current;
    gameData.current.grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    gameData.current.activeBlock = null;
    gameData.current.clearingEffects = [];
    gameData.current.floatingTexts = [];
    gameData.current.megaEffect = { active: false, phase: 0, progress: 0 };
    setScore(0);
    setCombo(0);
    setGameOver(false);
    createTrayBlocks({ availableBlocks: gameData.current.availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS: 3, BLOCK_SHAPES });
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmReset = () => {
    setAlertState({ isOpen: true, type: 'warning', title: 'RESTART GAME', message: 'ยืนยันการเริ่มเกมใหม่หรือไม่? คะแนนปัจจุบันจะถูกล้างทั้งหมด', onConfirm: performReset });
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { 
        overscroll-behavior-y: none; 
        overflow: hidden; 
      }
      .game-wrapper { 
        touch-action: none; 
        overscroll-behavior: none; 
      }
      canvas { 
        background-color: transparent !important; 
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    return () => { if (comboTimerRef.current) clearTimeout(comboTimerRef.current); };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    createTrayBlocks({ availableBlocks: gameData.current.availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS: 3, BLOCK_SHAPES });

    let animationFrameId;
    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      // 1. วาดกระดานหลัก
      drawGrid(ctx, canvas, gameData.current.grid);

      // 2. วาดเอฟเฟกต์บล็อกหาย
      if (gameData.current.clearingEffects.length > 0) {
         drawClearingEffects(ctx, canvas, gameData.current.clearingEffects);
         gameData.current.clearingEffects = gameData.current.clearingEffects
            .map(cell => ({ ...cell, opacity: cell.opacity - 0.05, scale: cell.scale + 0.02 }))
            .filter(cell => cell.opacity > 0); 
      }

      // 3. วาดเอฟเฟกต์ทำคอมโบ 3 แถว (Mega Effect)
      if (gameData.current.megaEffect.active) {
        const effect = gameData.current.megaEffect;
        const offset = getGridOffset(canvas);
        const W = GRID_SIZE * CELL_SIZE; 

        if (effect.phase === 1) {
            effect.progress += 0.035; 
            ctx.save();
            for (let i = 0; i < 25; i++) {
                const p = effect.progress - (i * 0.01); 
                if (p < 0 || p > 1) continue;

                const getPos = (prog) => {
                    let s = prog * 4 * W;
                    if (s < W) return { x: s, y: 0 }; 
                    if (s < 2*W) return { x: W, y: s - W }; 
                    if (s < 3*W) return { x: W - (s - 2*W), y: W }; 
                    return { x: 0, y: W - (s - 3*W) }; 
                };

                const pos = getPos(p);
                const hue = (p * 720) % 360; 
                const alpha = 1 - (i / 25);

                ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                ctx.shadowBlur = 20;
                ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

                ctx.beginPath();
                ctx.arc(offset.x + pos.x, offset.y + pos.y, 4 + (alpha * 6), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            if (effect.progress >= 1) {
                effect.phase = 2;
                effect.progress = 1; 
            }
        } else if (effect.phase === 2) {
            effect.progress -= 0.02; 

            ctx.save();
            const opacity = Math.max(0, effect.progress);
            ctx.shadowBlur = 50;
            ctx.shadowColor = `rgba(153, 238, 221, ${opacity})`;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 6 + (1 - opacity) * 10; 

            ctx.strokeRect(offset.x, offset.y, W, W);

            ctx.fillStyle = `rgba(153, 238, 221, ${opacity * 0.15})`;
            ctx.fillRect(offset.x, offset.y, W, W);
            ctx.restore();

            if (effect.progress <= 0) effect.active = false; 
        }
      }

      // --- 4. วาดกรอบ Slot คงที่ 3 ช่อง (Inventory UI) ---
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"; // สีเส้นประจางๆ
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); 
      
      // ขนาดกรอบ 4.5 ช่อง ให้กว้างพอใส่บล็อกที่ใหญ่ที่สุดได้พอดีๆ
      const MAX_SLOT_SIZE = 4.5 * TRAY_BLOCK_SIZE; 
      
      const isLandscape = canvas.width > canvas.height;
      const offset = getGridOffset(canvas);
      const gridWidth = GRID_SIZE * CELL_SIZE;

      for (let i = 0; i < 3; i++) {
          let slotCenterX, slotCenterY;
          if (isLandscape) {
              const rightSpaceX = offset.x + gridWidth;
              const trayWidth = canvas.width - rightSpaceX;
              slotCenterX = rightSpaceX + (trayWidth / 2) + 40;
              const slotHeight = canvas.height / 3;
              slotCenterY = (i * slotHeight) + (slotHeight / 2);
          } else {
              const slotWidth = canvas.width / 3;
              slotCenterX = (i * slotWidth) + (slotWidth / 2);
              const bottomSpaceY = offset.y + gridWidth;
              const trayHeight = canvas.height - bottomSpaceY;
              slotCenterY = bottomSpaceY + Math.max(100, trayHeight / 2);
          }
          
          // วาดกล่องสี่เหลี่ยมให้อยู่กึ่งกลางพอดี
          ctx.strokeRect(slotCenterX - MAX_SLOT_SIZE/2, slotCenterY - MAX_SLOT_SIZE/2, MAX_SLOT_SIZE, MAX_SLOT_SIZE);
      }
      ctx.restore();
      // ------------------------------------------------

      // 5. วาดบล็อกตัวเลือกทั้ง 3 ชิ้นลงในกรอบ
      drawTray(ctx, gameData.current.availableBlocks, TRAY_BLOCK_SIZE);

      // 6. วาดบล็อกที่กำลังใช้นิ้วลากอยู่ และเงา (Ghost Block) บนกระดาน
      if (gameData.current.activeBlock) {
        const { activeBlock, offsetX, offsetY, isDragging } = gameData.current;
        ctx.shadowBlur = 15; 
        ctx.shadowColor = activeBlock.color;
        drawBlock(ctx, activeBlock.shape, activeBlock.x, activeBlock.y, CELL_SIZE, 0.9, activeBlock.color);
        ctx.shadowBlur = 0; 

        if (isDragging) {
            const placement = findBestGridPlacement({ canvas, grid: gameData.current.grid, block: activeBlock, offsetX, offsetY, blockX: activeBlock.x, blockY: activeBlock.y });
            if (placement.canPlace) drawGhostBlock(ctx, activeBlock.shape, placement.gridX, placement.gridY, canvas, 0.5, activeBlock.color);
        }
      }

      // 7. วาดข้อความเด้งตอนเคลียร์แถว (Combo, Score)
      if (gameData.current.floatingTexts && gameData.current.floatingTexts.length > 0) {
        gameData.current.floatingTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.opacity);
            ctx.fillStyle = ft.color;
            ctx.font = "bold 56px 'Orbitron', sans-serif";
            ctx.textAlign = "center";
            ctx.shadowBlur = 20;
            ctx.shadowColor = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y + ft.offsetY);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
            ctx.lineWidth = 4;
            ctx.strokeText(ft.text, ft.x, ft.y + ft.offsetY);
            ctx.restore();
            ft.offsetY -= 2;
            ft.opacity -= 0.012; 
        });
        gameData.current.floatingTexts = gameData.current.floatingTexts.filter(ft => ft.opacity > 0);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };
    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]); 

  const handleMouseDown = (e) => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // ขนาดกรอบที่ตั้งไว้ (4.5 ช่อง)
    const MAX_SLOT_SIZE = 4.5 * TRAY_BLOCK_SIZE; 

    gameData.current.availableBlocks.forEach((block) => {
      // คำนวณความกว้างยาวจริงของตัวบล็อกเพื่อไปสร้างระยะห่างตอนลาก
      const blockWidth = block.shape[0].length * TRAY_BLOCK_SIZE;
      const blockHeight = block.shape.length * TRAY_BLOCK_SIZE;

      // ลอจิกใหม่: เช็คว่านิ้วจิ้มโดนใน "กรอบเส้นประ" เลยหรือเปล่า
      // แค่จิ้มโดนกรอบ ก็ถือว่าจับบล็อกได้ทันที ไม่ต้องสนว่าจิ้มโดนตัวบล็อกสีๆ ไหม!
      const isHit = (x >= block.baseX - MAX_SLOT_SIZE/2) && 
                    (x <= block.baseX + MAX_SLOT_SIZE/2) && 
                    (y >= block.baseY - MAX_SLOT_SIZE/2) && 
                    (y <= block.baseY + MAX_SLOT_SIZE/2);

      if (block.active && isHit) {
        gameData.current.activeBlock = { ...block }; 
        block.active = false; 
        gameData.current.startX = x; 
        gameData.current.startY = y;
        
        const scaleRatio = CELL_SIZE / TRAY_BLOCK_SIZE;
        // ล็อกให้บล็อกเด้งมาอยู่กึ่งกลางปลายนิ้วพอดี
        gameData.current.offsetX = (blockWidth / 2) * scaleRatio;
        gameData.current.offsetY = (blockHeight / 2) * scaleRatio;

        gameData.current.activeBlock.x = x - gameData.current.offsetX;
        gameData.current.activeBlock.y = y - gameData.current.offsetY;
        
        gameData.current.isDragging = true; 
        playSound('grab', isMuted); 
      }
    });
  };
  const handleMouseMove = (e) => {
    if (!gameData.current.activeBlock) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const moveDist = Math.hypot(x - gameData.current.startX, y - gameData.current.startY);
    if (moveDist > 10) gameData.current.isDragging = true;
    gameData.current.activeBlock.x = x - gameData.current.offsetX;
    gameData.current.activeBlock.y = y - gameData.current.offsetY;
  };

  const handleMouseUp = () => {
    if (!gameData.current.activeBlock) return;
    const canvas = canvasRef.current;
    const activeBlock = gameData.current.activeBlock;
    const { isDragging } = gameData.current;

    if (!isDragging) {
        const originalBlock = gameData.current.availableBlocks.find(b => b.id === activeBlock.id);
        if (originalBlock) originalBlock.active = true;
        gameData.current.activeBlock = null;
        return;
    }
    const placement = findBestGridPlacement({ canvas, grid: gameData.current.grid, block: activeBlock, offsetX: gameData.current.offsetX, offsetY: gameData.current.offsetY, blockX: activeBlock.x, blockY: activeBlock.y });

    if (placement.canPlace) {
      for (let y = 0; y < activeBlock.shape.length; y++) {
        for (let x = 0; x < activeBlock.shape[y].length; x++) {
          if (activeBlock.shape[y][x]) gameData.current.grid[placement.gridY + y][placement.gridX + x] = activeBlock.color;
        }
      }
      gameData.current.availableBlocks = gameData.current.availableBlocks.filter(b => b.id !== activeBlock.id);
      playSound('drop', isMuted);
      const { linesCleared, clearedCellsData } = checkAndGetClearedLines(gameData.current.grid);

      if (linesCleared > 0) {
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        const nextCombo = combo + 1;
        setCombo(nextCombo);

        setScore(s => s + (linesCleared * 100 * nextCombo));

        gameData.current.clearingEffects = clearedCellsData; 

        let popText = "";
        let popColor = "#99eedd";

        if (nextCombo > 1) {
            popText = `COMBO x${nextCombo}!`;
            popColor = "#FFD166"; 
        } else if (linesCleared >= 4) {
            popText = "AMAZING!";
            popColor = "#F15BB5"; 
        } else if (linesCleared >= 2) {
            popText = "GREAT!";
            popColor = "#4ECDC4"; 
        } else {
            popText = "NICE!";
            popColor = "#99eedd"; 
        }

        if (linesCleared >= 3) {
            gameData.current.megaEffect = { active: true, phase: 1, progress: 0 };
        }

        const blockWidth = activeBlock.shape[0].length * CELL_SIZE;
        const dropX = activeBlock.x + (blockWidth / 2);
        const dropY = activeBlock.y;

        gameData.current.floatingTexts.push({
            id: Date.now(), text: popText, x: dropX, y: dropY, opacity: 1, offsetY: 0, color: popColor
        });

        setTimeout(() => playSound('clear', isMuted, nextCombo), 100); 
      } else {
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => setCombo(0), 3000); 
      }

      if (gameData.current.availableBlocks.length === 0) createTrayBlocks({ availableBlocks: gameData.current.availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS: 3, BLOCK_SHAPES });

      if (!canPlaceAnyBlock({ grid: gameData.current.grid, availableBlocks: gameData.current.availableBlocks })) {
        setGameOver(true); 
        playSound('gameover', isMuted);
        saveScore(score); 
      }
    } else {
      const originalBlock = gameData.current.availableBlocks.find(b => b.id === activeBlock.id);
      if (originalBlock) originalBlock.active = true;
    }
    gameData.current.activeBlock = null; gameData.current.isDragging = false;
  };

  return (
    <div className="relative flex flex-col items-center w-full h-[100dvh] overflow-hidden" style={{ isolation: 'isolate' }}>
      <SystemAlert {...alertState} onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} />

      <div className="w-full absolute top-0 left-0 right-0 z-10 px-4 py-4 md:px-8 pointer-events-none">
        <div className="flex flex-row md:flex-col items-start justify-between md:justify-start gap-4 pointer-events-auto">
          <div className="flex gap-2">
              <button onClick={() => navigate('/dashboard/minigames')} className="bg-transparent hover:bg-white/10 p-2 md:p-3 rounded-xl text-white transition-all"><ArrowLeft size={24} /></button>
              <button onClick={handleConfirmReset} className="bg-transparent hover:bg-white/10 p-2 md:p-3 rounded-xl text-white transition-all"><RotateCcw size={24} /></button>
              <button onClick={() => setIsMuted(!isMuted)} className="bg-transparent hover:bg-white/10 p-2 md:p-3 rounded-xl text-white transition-all">{isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 bg-transparent border-none shadow-none flex flex-col items-center md:items-start min-w-[100px]">
              <span className="text-[10px] md:text-sm text-gray-400 font-['Orbitron'] drop-shadow-md">SCORE</span>
              <span className="text-2xl md:text-4xl font-bold text-[#99eedd] font-['Orbitron'] leading-none drop-shadow-lg">{score}</span>
              {combo > 0 && <span className="text-yellow-400 text-xs md:text-sm font-['Orbitron'] mt-1 animate-pulse drop-shadow-md">COMBO x{combo}</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center px-2 pt-16 md:pt-0">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
            style={{ willChange: 'transform', backfaceVisibility: 'hidden' }} 
            className="max-w-full max-h-[85vh] md:max-h-none object-contain touch-none"
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseOut={handleMouseUp} 
            onTouchStart={handleMouseDown} onTouchMove={(e) => { e.preventDefault(); handleMouseMove(e); }} onTouchEnd={handleMouseUp}
          />
        </div>

      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl animate__animated animate__fadeIn">
          <div className="bg-[#110b1c] border border-indigo-500/30 p-8 rounded-3xl text-center w-[90%] max-w-[350px]">
            <h2 className="text-3xl font-bold text-white mb-2 font-['Orbitron']">OUT OF MOVES</h2>
            <p className="text-gray-400 mb-6 font-['Rajdhani'] text-lg">FINAL SCORE <span className="text-[#99eedd] font-bold text-4xl block mt-2">{score}</span></p>
            <button onClick={performReset} className="w-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 py-3 rounded-xl font-bold tracking-widest hover:bg-indigo-600/50 transition-all">TRY AGAIN</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockBlastGame;