import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ArrowLeft } from 'lucide-react';
import { drawGrid, drawBlock, getGridOffset, drawGhostBlock, blockCollision, findBestGridPlacement, checkAndGetClearedLines, canPlaceAnyBlock, drawTray, createTrayBlocks, updateTrayBlockPositions, GRID_SIZE, CELL_SIZE, drawClearingEffects } from './gameFunctions';
import { BLOCK_SHAPES } from './blocks';
import { useNavigate } from 'react-router-dom';
import SystemAlert from "../../SystemAlert";

const playSound = (type, isMuted) => {
  if (isMuted) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'grab') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'drop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'clear') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'gameover') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }
};

const BlockBlastGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [alertState, setAlertState] = useState({ 
    isOpen: false, type: 'warning', title: '', message: '', onConfirm: null 
  });

  const CANVAS_WIDTH = isDesktop ? 1400 : 800; 
  const CANVAS_HEIGHT = isDesktop ? 900 : 1250; 
  const TRAY_BLOCK_SIZE = 45; 

  const performReset = () => {
    const canvas = canvasRef.current;
    gameData.current.grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    gameData.current.activeBlock = null;
    gameData.current.clearingEffects = [];
    setScore(0);
    setCombo(0);
    setGameOver(false);
    createTrayBlocks({ availableBlocks: gameData.current.availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS: 3, BLOCK_SHAPES });
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmReset = () => {
    setAlertState({
      isOpen: true,
      type: 'warning',
      title: 'RESTART GAME',
      message: 'ยืนยันการเริ่มเกมใหม่หรือไม่? คะแนนปัจจุบันจะถูกล้างทั้งหมด',
      onConfirm: performReset
    });
  };

  const gameData = useRef({
    const comboTimerRef = useRef(null);
    grid: Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)),
    availableBlocks: [],
    activeBlock: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0, 
    startY: 0, 
    isDragging: false, 
    clearingEffects: [], 
  });

  useEffect(() => {
    const handleResize = () => {
        const desktop = window.innerWidth >= 1024;
        if (isDesktop !== desktop) {
            setIsDesktop(desktop);
            setTimeout(() => {
                if (canvasRef.current) {
                    updateTrayBlockPositions(canvasRef.current, gameData.current.availableBlocks, TRAY_BLOCK_SIZE);
                }
            }, 50);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDesktop]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    // ลบ alpha: false ออก เพื่อให้ Canvas โปร่งใสได้
    const ctx = canvas.getContext("2d"); 

    createTrayBlocks({ availableBlocks: gameData.current.availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS: 3, BLOCK_SHAPES });

    const gameLoop = () => {
      // เปลี่ยนมาใช้ clearRect แทนการเทสีทึบ เพื่อให้กลืนไปกับ Background นอกกรอบ
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid(ctx, canvas, gameData.current.grid);
      
      if (gameData.current.clearingEffects.length > 0) {
         drawClearingEffects(ctx, canvas, gameData.current.clearingEffects);
         gameData.current.clearingEffects = gameData.current.clearingEffects
            .map(cell => ({ ...cell, opacity: cell.opacity - 0.05, scale: cell.scale + 0.02 }))
            .filter(cell => cell.opacity > 0); 
      }

      drawTray(ctx, gameData.current.availableBlocks, TRAY_BLOCK_SIZE);

      if (gameData.current.activeBlock) {
        const { activeBlock, offsetX, offsetY, isDragging } = gameData.current;
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = activeBlock.color;
        
        drawBlock(ctx, activeBlock.shape, activeBlock.x, activeBlock.y, CELL_SIZE, 0.9, activeBlock.color);
        
        ctx.shadowBlur = 0; 

        if (isDragging) {
            const placement = findBestGridPlacement({ canvas, grid: gameData.current.grid, block: activeBlock, offsetX, offsetY, blockX: activeBlock.x, blockY: activeBlock.y });
            if (placement.canPlace) {
                drawGhostBlock(ctx, activeBlock.shape, placement.gridX, placement.gridY, canvas, 0.5, activeBlock.color);
            }
        }
      }
      requestAnimationFrame(gameLoop);
    };
    
    const raf = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(raf);
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
    
    gameData.current.availableBlocks.forEach((block) => {
      if (block.active && blockCollision(x, y, block, TRAY_BLOCK_SIZE)) {
        gameData.current.activeBlock = { ...block }; 
        block.active = false; 
        
        gameData.current.startX = x;
        gameData.current.startY = y;

        const scaleRatio = CELL_SIZE / TRAY_BLOCK_SIZE;
        gameData.current.offsetX = (x - block.x) * scaleRatio;
        gameData.current.offsetY = (y - block.y) * scaleRatio;

        gameData.current.isDragging = false; 
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
    if (moveDist > 10) {
      gameData.current.isDragging = true;
    }

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
          if (activeBlock.shape[y][x]) {
            gameData.current.grid[placement.gridY + y][placement.gridX + x] = activeBlock.color;
          }
        }
      }
      
      gameData.current.availableBlocks = gameData.current.availableBlocks.filter(b => b.id !== activeBlock.id);
      playSound('drop', isMuted);

      const { linesCleared, clearedCellsData } = checkAndGetClearedLines(gameData.current.grid);
      
      if (linesCleared > 0) {
        setCombo(c => c + 1);
        setScore(s => s + (linesCleared * 100 * (combo + 1)));
        gameData.current.clearingEffects = clearedCellsData; 
        setTimeout(() => playSound('clear', isMuted), 100); 
      } else {
        setCombo(0);
      }

      if (gameData.current.availableBlocks.length === 0) {
         createTrayBlocks({ availableBlocks: gameData.current.availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS: 3, BLOCK_SHAPES });
      }

      if (!canPlaceAnyBlock({ grid: gameData.current.grid, availableBlocks: gameData.current.availableBlocks })) {
        setGameOver(true);
        playSound('gameover', isMuted); 
      }
    } else {
      const originalBlock = gameData.current.availableBlocks.find(b => b.id === activeBlock.id);
      if (originalBlock) originalBlock.active = true;
    }
    
    gameData.current.activeBlock = null;
    gameData.current.isDragging = false;
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-[450px] lg:max-w-[1200px] xl:max-w-[1400px] mx-auto pt-4 md:pt-8">
      
      {/* 1. จุดที่ต้องเพิ่ม: นำ Alert มาวางไว้ตรงนี้ */}
      <SystemAlert 
        {...alertState} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
      />

      <div className="absolute top-4 left-4 lg:top-10 lg:left-4 xl:left-0 z-10 flex flex-col items-start gap-4 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
            <button 
                onClick={() => navigate('/dashboard/minigames')}
                className="bg-[#08050f]/60 hover:bg-white/20 p-3 rounded-xl border border-white/10 backdrop-blur-md text-white transition-all shadow-lg"
            >
                <ArrowLeft size={22} />
            </button>
            {/* 2. แก้ไขปุ่มนี้: เปลี่ยนจาก resetGame เป็น handleConfirmReset */}
            <button 
                onClick={handleConfirmReset} 
                className="bg-[#08050f]/60 hover:bg-white/20 p-3 rounded-xl border border-white/10 backdrop-blur-md text-white transition-all shadow-lg"
            >
                <RotateCcw size={22} />
            </button>
            <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="bg-[#08050f]/60 hover:bg-white/20 p-3 rounded-xl border border-white/10 backdrop-blur-md text-white transition-all shadow-lg"
            >
                {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
        </div>

        {/* กล่องคะแนน */}
        <div className="bg-[#08050f]/60 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col min-w-[120px] shadow-lg pointer-events-auto">
            <span className="text-xs text-gray-400 font-['Orbitron']">SCORE</span>
            <span className="text-3xl font-bold text-[#99eedd] font-['Orbitron'] tracking-wider drop-shadow-md">{score}</span>
            {combo > 0 && <span className="text-yellow-400 text-xs mt-1 font-['Orbitron']">COMBO x{combo}</span>}
        </div>

      </div>

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-auto touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp} 
        onTouchStart={handleMouseDown}
        onTouchMove={(e) => { e.preventDefault(); handleMouseMove(e); }} 
        onTouchEnd={handleMouseUp}
      />
      
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl animate__animated animate__fadeIn">
          <div className="bg-[#110b1c] border-2 border-indigo-500/50 p-10 rounded-3xl text-center w-[85%] max-w-[400px]">
            <h2 className="text-4xl font-bold text-white mb-2 font-['Orbitron']">OUT OF MOVES</h2>
            <p className="text-gray-400 mb-8 font-['Rajdhani'] text-lg mt-4">
              FINAL SCORE<br/><span className="text-[#99eedd] font-bold text-6xl drop-shadow-[0_0_15px_rgba(153,238,221,0.5)]">{score}</span>
            </p>
            <button 
              onClick={performReset} // เปลี่ยนจากโค้ดก้อนใหญ่ๆ มาเป็น performReset เลยครับ
              className="w-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 py-4 rounded-2xl ..."
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockBlastGame;
