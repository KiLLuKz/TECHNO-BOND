import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Crosshair, Droplets, Flame, Skull, Crown, Volume2, VolumeX, Users, Bot, Shuffle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLS = 9;
const ROWS = 7;
const SHIPS_INFO = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
];

const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill({ hasShip: false, shipId: null, isHit: false, isMiss: false, isSunk: false }));

// --- AI Helpers ---
const getValidNeighbors = (r, c, board) => {
  const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]; 
  return deltas
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS)
    .filter(([nr, nc]) => !board[nr][nc].isHit && !board[nr][nc].isMiss);
};

const findUnsunkHits = (board) => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isHit && !board[r][c].isSunk) {
        return { r, c };
      }
    }
  }
  return null;
};

// --- Main Component ---
export default function BattleshipGame() {
  const navigate = useNavigate();

  // Screen & Game States
  const [screen, setScreen] = useState('menu');
  const [gameMode, setGameMode] = useState('pve');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [log, setLog] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Boards
  const [p1Board, setP1Board] = useState(createEmptyBoard());
  const [p2Board, setP2Board] = useState(createEmptyBoard());
  const [p1Ships, setP1Ships] = useState({});
  const [p2Ships, setP2Ships] = useState({});

  // Setup States
  const [unplacedShips, setUnplacedShips] = useState([...SHIPS_INFO]);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [hoverCells, setHoverCells] = useState([]);

  // --- Advanced AI State Ref ---
  const aiState = useRef({
    currentHomingTarget: null, 
    homingStage: 'hunt', 
    targetQueue: [], 
    foundLineAxis: null, 
    lastHit: null, 
  });

  // Audio Refs 
  const playSound = (type) => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hit') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'miss') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'sunk') {
        osc.type = 'square'; osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start(); osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) { console.log("Audio error"); }
  };

  const resetAIState = () => {
    aiState.current = {
      currentHomingTarget: null,
      homingStage: 'hunt',
      targetQueue: [],
      foundLineAxis: null,
      lastHit: null,
    };
  };

  const randomizeFleet = (boardToSet, shipsHealthToSet) => {
    let board = createEmptyBoard();
    let health = {};

    SHIPS_INFO.forEach(ship => {
      let placed = false;
      while (!placed) {
        const isHoriz = Math.random() > 0.5;
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);

        if (isHoriz && c + ship.size <= COLS) {
          let canPlace = true;
          for (let i = 0; i < ship.size; i++) if (board[r][c + i].hasShip) canPlace = false;
          if (canPlace) {
            for (let i = 0; i < ship.size; i++) board[r][c + i] = { ...board[r][c + i], hasShip: true, shipId: ship.id };
            placed = true;
          }
        } else if (!isHoriz && r + ship.size <= ROWS) {
          let canPlace = true;
          for (let i = 0; i < ship.size; i++) if (board[r + i][c].hasShip) canPlace = false;
          if (canPlace) {
            for (let i = 0; i < ship.size; i++) board[r + i][c] = { ...board[r + i][c], hasShip: true, shipId: ship.id };
            placed = true;
          }
        }
      }
      health[ship.id] = ship.size;
    });
    boardToSet(board);
    shipsHealthToSet(health);
  };

  const handleStartGame = (mode) => {
    setGameMode(mode);
    setP1Board(createEmptyBoard());
    setP2Board(createEmptyBoard());
    setUnplacedShips([...SHIPS_INFO]);
    setIsHorizontal(true);
    setCurrentPlayer(1);
    setWinner(null);
    resetAIState();
    setScreen('setup');
    setLog(mode === 'pvp' ? "Player 1, place your fleet." : "Place your fleet, Commander.");
    if (mode === 'pve') randomizeFleet(setP2Board, setP2Ships);
  };

  // --- Keyboard Listener (กด R หมุนเรือ) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'r' || e.key === 'R') && screen === 'setup') {
        setIsHorizontal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  // --- Setup Phase ---
  const handleMouseEnter = (r, c) => {
    if (unplacedShips.length === 0) return;
    const ship = unplacedShips[0];
    let cells = [];
    let valid = true;
    const board = currentPlayer === 1 ? p1Board : p2Board;

    for (let i = 0; i < ship.size; i++) {
      const rr = isHorizontal ? r : r + i;
      const cc = isHorizontal ? c + i : c;
      if (rr >= ROWS || cc >= COLS) valid = false;
      else {
        if (board[rr][cc].hasShip) valid = false;
        cells.push({ r: rr, c: cc });
      }
    }
    setHoverCells(cells.map(cell => ({ ...cell, valid })));
  };

  const handlePlaceShip = (r, c) => {
    if (unplacedShips.length === 0 || hoverCells.some(cell => !cell.valid) || hoverCells.length === 0) return;
    const ship = unplacedShips[0];
    const board = currentPlayer === 1 ? [...p1Board] : [...p2Board];
    const health = currentPlayer === 1 ? { ...p1Ships } : { ...p2Ships };

    hoverCells.forEach(cell => {
      board[cell.r] = [...board[cell.r]];
      board[cell.r][cell.c] = { ...board[cell.r][cell.c], hasShip: true, shipId: ship.id };
    });
    health[ship.id] = ship.size;

    if (currentPlayer === 1) { setP1Board(board); setP1Ships(health); }
    else { setP2Board(board); setP2Ships(health); }

    setUnplacedShips(unplacedShips.slice(1));
    setHoverCells([]);
  };

  const handleSetupDone = () => {
    if (gameMode === 'pve') {
      setScreen('playing');
      setLog("Commence firing!");
    } else {
      if (currentPlayer === 1) {
        setCurrentPlayer(2);
        setUnplacedShips([...SHIPS_INFO]);
        setLog("Player 2, place your fleet.");
      } else {
        setCurrentPlayer(1);
        setScreen('playing');
        setLog("Commence firing!");
      }
    }
  };

  // --- Advanced AI Attack Logic ---
  useEffect(() => {
    if (screen === 'playing' && gameMode === 'pve' && currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        let r, c;
        const ai = aiState.current;
        let validTargetFound = false;
        let safetyCounter = 0;

        while (!validTargetFound && safetyCounter < 1000) {
          safetyCounter++;

          if (ai.homingStage === 'hunt') {
              const unsunkHit = findUnsunkHits(p1Board);
              if (unsunkHit) {
                  ai.currentHomingTarget = unsunkHit;
                  ai.lastHit = unsunkHit;
                  ai.homingStage = 'target';
                  ai.targetQueue = getValidNeighbors(unsunkHit.r, unsunkHit.c, p1Board);
              }
          }

          if (ai.homingStage === 'hunt') {
            r = Math.floor(Math.random() * ROWS);
            c = Math.floor(Math.random() * COLS);
          } else {
            if (ai.targetQueue.length > 0) {
              const target = ai.targetQueue.shift();
              r = target[0]; c = target[1];
            } else {
                resetAIState();
                continue; 
            }
          }

          if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !p1Board[r][c].isHit && !p1Board[r][c].isMiss) {
              validTargetFound = true;
          }
        }

        if (validTargetFound) {
          handleAIAttack(r, c);
        }

      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, screen, winner, p1Board]);

  const handleAIAttack = (r, c) => {
    const ai = aiState.current;
    const targetBoard = [...p1Board]; 
    const targetShips = { ...p1Ships };
    const cell = targetBoard[r][c];

    if (cell.hasShip) {
      targetBoard[r][c] = { ...cell, isHit: true };
      targetShips[cell.shipId] -= 1;
      ai.lastHit = { r, c };

      if (targetShips[cell.shipId] === 0) {
        playSound('sunk');
        setLog(`P2 SUNK the ${SHIPS_INFO.find(s => s.id === cell.shipId).name}!`);
        targetBoard.forEach((row, rr) => row.forEach((ccell, cc) => {
          if (ccell.shipId === cell.shipId) targetBoard[rr][cc] = { ...targetBoard[rr][cc], isSunk: true };
        }));
        resetAIState(); 
      } else {
        playSound('hit');
        setLog(`P2 HIT!`);

        if (ai.homingStage === 'hunt') {
          ai.currentHomingTarget = { r, c };
          ai.homingStage = 'target';
          ai.targetQueue = getValidNeighbors(r, c, targetBoard);
        } else if (ai.homingStage === 'target') {
            if (ai.foundLineAxis === null) {
              const isVertical = ai.currentHomingTarget.c === c;
              ai.foundLineAxis = isVertical ? 'v' : 'h';
              ai.targetQueue = ai.targetQueue.filter(t => isVertical ? t[1] === c : t[0] === r);
              
              const dr = isVertical ? (ai.currentHomingTarget.r < r ? -1 : 1) : 0;
              const dc = !isVertical ? (ai.currentHomingTarget.c < c ? -1 : 1) : 0;
              const nextR = ai.currentHomingTarget.r + dr;
              const nextC = ai.currentHomingTarget.c + dc;
              if (nextR >= 0 && nextR < ROWS && nextC >= 0 && nextC < COLS && !targetBoard[nextR][nextC].isHit && !targetBoard[nextR][nextC].isMiss) {
                  ai.targetQueue.unshift([nextR, nextC]);
              }
            }
            const dr = ai.currentHomingTarget.c === c ? (ai.currentHomingTarget.r < r ? 1 : -1) : 0;
            const dc = ai.currentHomingTarget.r === r ? (ai.currentHomingTarget.c < c ? 1 : -1) : 0;
            const nextR = r + dr;
            const nextC = c + dc;
             if (nextR >= 0 && nextR < ROWS && nextC >= 0 && nextC < COLS && !targetBoard[nextR][nextC].isHit && !targetBoard[nextR][nextC].isMiss) {
                  ai.targetQueue.unshift([nextR, nextC]); 
             }
        }
      }
    } else {
      playSound('miss');
      targetBoard[r][c] = { ...cell, isMiss: true };
      setLog(`P2 Missed.`);
    }

    setP1Board(targetBoard);
    setP1Ships(targetShips);

    if (Object.values(targetShips).every(hp => hp === 0)) {
      setWinner(2);
      setScreen('gameover');
      return;
    }
    setCurrentPlayer(1); 
  };

  // --- Manual Attack Logic (PvE and PvP) ---
  const handleManualAttack = (r, c, targetPlayerId) => {
    if (screen !== 'playing' || winner) return;
    
    // ตรวจสอบเทิร์น: P1 โจมตี P2 | P2 โจมตี P1
    if (targetPlayerId === 2 && currentPlayer !== 1) return;
    if (targetPlayerId === 1 && currentPlayer !== 2) return;

    const isAttackingP2 = targetPlayerId === 2;
    const targetBoard = isAttackingP2 ? [...p2Board] : [...p1Board];
    const targetShips = isAttackingP2 ? { ...p2Ships } : { ...p1Ships };
    const cell = targetBoard[r][c];

    if (cell.isHit || cell.isMiss) return;

    targetBoard[r][c] = { ...cell };

    if (cell.hasShip) {
      targetBoard[r][c].isHit = true;
      targetShips[cell.shipId] -= 1;

      if (targetShips[cell.shipId] === 0) {
        playSound('sunk');
        setLog(`P${currentPlayer} SUNK the ${SHIPS_INFO.find(s => s.id === cell.shipId).name}!`);
        targetBoard.forEach((row, rr) => row.forEach((ccell, cc) => {
          if (ccell.shipId === cell.shipId) targetBoard[rr][cc] = { ...targetBoard[rr][cc], isSunk: true };
        }));
      } else {
        playSound('hit');
        setLog(`P${currentPlayer} HIT!`);
      }
    } else {
      playSound('miss');
      targetBoard[r][c].isMiss = true;
      setLog(`P${currentPlayer} Missed.`);
    }

    if (isAttackingP2) { setP2Board(targetBoard); setP2Ships(targetShips); }
    else { setP1Board(targetBoard); setP1Ships(targetShips); }

    if (Object.values(targetShips).every(hp => hp === 0)) {
      setWinner(currentPlayer);
      setScreen('gameover');
      return;
    }
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };


  // --- Rendering Helpers ---
  const renderCell = (cell, r, c, isClickable, onCellClick) => {
    const isHovered = hoverCells.some(h => h.r === r && h.c === c);
    const hoverValid = isHovered ? hoverCells.find(h => h.r === r && h.c === c).valid : true;

    let bgClass = "bg-[#08050f]/60";
    let content = null;

    if (cell.isSunk) {
      bgClass = "bg-black/80 border-black/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]";
      content = <Skull size={14} className="text-gray-500 opacity-60" />;
    } else if (cell.isHit) {
      bgClass = "bg-red-500/10 border-red-500/30";
      content = <Flame size={18} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />;
    } else if (cell.isMiss) {
      bgClass = "bg-blue-500/10";
      content = <Droplets size={16} className="text-blue-400 opacity-60" />;
    } else if (screen === 'setup' && cell.hasShip) {
      bgClass = "bg-[#779556]/40";
    }

    if (isHovered && screen === 'setup') {
      bgClass = hoverValid ? "bg-green-500/50" : "bg-red-500/50 hover:cursor-not-allowed";
    }

    return (
      <div
        key={`${r}-${c}`}
        onClick={() => onCellClick && onCellClick(r, c)}
        onMouseEnter={() => screen === 'setup' && handleMouseEnter(r, c)}
        onMouseLeave={() => screen === 'setup' && setHoverCells([])}
        className={`w-8 h-8 min-[400px]:w-9 min-[400px]:h-9 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 
          border border-white/10 flex items-center justify-center transition-all duration-300
          ${bgClass}
          ${isClickable ? 'cursor-crosshair hover:bg-white/20' : 'cursor-default'}
        `}
      >
        {content}
      </div>
    );
  };

  const renderBoardGrid = (board, isClickable, onCellClickAction) => (
    <div className="grid grid-cols-9 gap-[1px] md:gap-1 border border-white/10 p-2 bg-black/50 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      {board.flatMap((row, r) => row.map((cell, c) =>
        renderCell(cell, r, c, isClickable && !cell.isHit && !cell.isMiss, isClickable ? () => onCellClickAction(r, c) : null)
      ))}
    </div>
  );

  // --- Main Render Logic ---
  if (screen === 'menu') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center font-['Orbitron'] p-6 relative">
        <button onClick={() => navigate('/dashboard/minigames')} className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><ArrowLeft size={24} /></button>
        <div className="bg-[#110b1c]/80 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] text-center shadow-2xl max-w-sm w-full">
          <Crosshair size={80} className="mx-auto mb-6 text-[#4ECDC4] animate-pulse" />
          <h1 className="text-4xl font-bold mb-10 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#4ECDC4] to-[#2EC4B6]">BATTLESHIP</h1>
          <div className="flex flex-col gap-4">
            <button onClick={() => handleStartGame('pve')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all"><Bot size={24} className="text-[#FFD166]" /> VS AI</button>
            <button onClick={() => handleStartGame('pvp')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all"><Users size={24} className="text-[#FF6B6B]" /> 2 PLAYER</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'setup') {
    const board = currentPlayer === 1 ? p1Board : p2Board;
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center  font-['Orbitron'] p-4 md:p-10 relative">
        <button onClick={() => setScreen('menu')} className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><ArrowLeft size={24} /></button>
        <div className="w-full max-w-2xl flex flex-col items-center mb-6 gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-[#4ECDC4]">FLEET setup</h1>
            <div className={`px-6 py-2 rounded-full font-bold tracking-widest text-sm border ${currentPlayer === 1 ? 'bg-[#FF6B6B]/20 border-[#FF6B6B]/50 text-[#FF6B6B]' : 'bg-[#FFD166]/20 border-[#FFD166]/50 text-[#FFD166]'}`}>
                PLAYER {currentPlayer}
            </div>
        </div>
        <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row gap-6 items-center">
          {renderBoardGrid(board, unplacedShips.length > 0, handlePlaceShip)}
          
          <div className="bg-black/50 rounded-xl border border-white/10 p-4 w-full md:w-64 self-stretch flex flex-col justify-between">
            {unplacedShips.length > 0 ? (
              <div className="flex flex-col items-center text-center gap-4">
                <AlertTriangle className='text-[#FFD166]' size={32}/>
                <h3 className='font-bold text-lg'>DEPLOYMENT</h3>
                <p className="text-xs text-gray-400">Click on the grid to deploy the ship.</p>
                <p className="text-sm md:text-base text-[#FFD166]">{unplacedShips[0].name} (Size: {unplacedShips[0].size})</p>
                <div className="flex flex-col gap-2 w-full">
                  <button onClick={() => setIsHorizontal(!isHorizontal)} className="w-full bg-white/10 px-4 py-2 rounded-lg text-xs hover:bg-white/20 transition-all font-bold flex items-center justify-center gap-2">
                    <RotateCcw size={16}/> ROTATE (Press 'R')
                  </button>
                  <button onClick={() => { currentPlayer === 1 ? randomizeFleet(setP1Board, setP1Ships) : randomizeFleet(setP2Board, setP2Ships); setUnplacedShips([]); }} className="w-full bg-white/10 px-4 py-2 rounded-lg text-xs hover:bg-white/20 transition-all font-bold flex items-center justify-center gap-2"><Shuffle size={16}/> RANDOM FLEET</button>
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-4 text-center items-center'>
                  <Crown className='text-[#4ECDC4]' size={48}/>
                  <p className="text-sm font-bold text-[#4ECDC4]">Fleet ready for battle!</p>
                  <button onClick={handleSetupDone} className="w-full bg-[#4ECDC4] text-black py-3 rounded-lg font-bold tracking-widest hover:scale-[1.02] transition-transform text-sm">CONFIRM FLEET</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Playing Screen ---
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-['Orbitron'] text-white p-4 relative">
      {screen === 'gameover' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="bg-[#110b1c] p-12 rounded-[50px] text-center border border-[#4ECDC4]/30 shadow-[0_0_50px_rgba(78,205,196,0.2)] max-w-md w-full">
            <Crown size={100} className="mx-auto mb-6 text-[#FFD166] drop-shadow-lg" />
            <h2 className="text-5xl font-bold text-[#4ECDC4] mb-10">PLAYER {winner} WINS!</h2>
            <button onClick={() => window.location.reload()} className="w-full bg-[#4ECDC4] text-black py-5 rounded-2xl font-bold text-xl hover:bg-[#2EC4B6] transition-all">PLAY AGAIN</button>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg gap-2">
        <button onClick={() => setScreen('menu')} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"><ArrowLeft size={24}/></button>
        <div className={`px-4 py-2 rounded-full font-bold tracking-widest text-xs md:text-base border text-center ${currentPlayer === 1 ? 'bg-[#FF6B6B]/20 border-[#FF6B6B]/50 text-[#FF6B6B]' : 'bg-[#FFD166]/20 border-[#FFD166]/50 text-[#FFD166]'}`}>
          PLAYER {currentPlayer} TURN
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">{isMuted ? <VolumeX size={24}/> : <Volume2 size={24}/>}</button>
      </div>

      <div className="text-center text-[#4ECDC4] mb-6 h-6 font-bold tracking-widest uppercase text-xs md:text-base">{log}</div>

      {/* Boards Area (P2 Top/Left, P1 Bottom/Right) */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center w-full max-w-7xl relative">
        
        {/* PLAYER 2 Board (Radar for P1 to attack) */}
        <div className={`flex flex-col items-center p-4 rounded-3xl transition-all duration-300 relative ${currentPlayer === 1 ? 'ring-2 ring-[#4ECDC4] bg-white/5 shadow-[0_0_30px_rgba(78,205,196,0.1)]' : 'opacity-40 grayscale-[50%] pointer-events-none'}`}>
          <h2 className="mb-4 font-bold tracking-widest text-sm md:text-base text-gray-300 flex items-center gap-2"><Crosshair size={18}/> P2 RADAR</h2>
          {/* สังเกตว่าแก้ตรงนี้: ให้ P1 เป็นคนกดยิงกระดานนี้ (เป้าหมายคือ P2) */}
          {renderBoardGrid(p2Board, currentPlayer === 1, (r, c) => handleManualAttack(r, c, 2))}
          
          {/* Overlay AI Thinking (เฉพาะโหมด vs AI) */}
          {currentPlayer === 2 && screen === 'playing' && gameMode === 'pve' && (
              <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center backdrop-blur-sm z-10 font-bold text-[#FFD166] tracking-widest uppercase">
                  P2 (AI) Thinking...
              </div>
          )}
          
          {/* Overlay บอกตา P2 (เฉพาะโหมด PvP) */}
          {currentPlayer === 2 && screen === 'playing' && gameMode === 'pvp' && (
              <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col gap-3 items-center justify-center backdrop-blur-sm z-10 pointer-events-none">
                  <Flame className='text-[#FFD166]' size={32}/>
                  <div className='font-bold tracking-widest text-xl text-[#FFD166]'>P2'S TURN</div>
                  <div className='text-center tracking-widest text-xs text-gray-300'>Attack the P1 Fleet below/right!</div>
              </div>
          )}
        </div>

        {/* PLAYER 1 Board (Self board, P2 attacks here in PvP) */}
        <div className={`flex flex-col items-center p-4 rounded-3xl transition-all duration-300 relative ${currentPlayer === 2 ? 'ring-2 ring-[#FF6B6B] bg-white/5 shadow-[0_0_30px_rgba(255,107,107,0.1)]' : 'opacity-80'}`}>
          <h2 className="mb-4 font-bold tracking-widest text-sm md:text-base text-gray-300 flex items-center gap-2"><Droplets size={18}/> P1 FLEET</h2>
          {/* สังเกตว่าแก้ตรงนี้: ให้ P2 เป็นคนกดยิงกระดานนี้ (เป้าหมายคือ P1) */}
          {renderBoardGrid(p1Board, gameMode === 'pvp' && currentPlayer === 2, (r, c) => handleManualAttack(r, c, 1))}
          
          {/* Overlay บอกตา P1 */}
          {currentPlayer === 1 && screen === 'playing' && (
              <div className="absolute inset-0 bg-black/40 rounded-3xl z-10 flex flex-col gap-3 items-center justify-center p-4 backdrop-blur-sm pointer-events-none">
                  <Flame className='text-[#FF6B6B]' size={32}/>
                  <div className='font-bold tracking-widest text-xl text-[#FF6B6B]'>P1'S TURN</div>
                  <div className='text-center tracking-widest text-xs text-gray-300'>Click the P2 Radar above/left to attack.</div>
              </div>
          )}
        </div>

      </div>

    </div>
  );
}