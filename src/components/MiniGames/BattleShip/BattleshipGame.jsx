import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Crosshair, Droplets, Flame, Skull, Crown, Volume2, VolumeX, Users, Bot, Shuffle } from 'lucide-react';
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

  // Audio Refs 
  const playSound = (type) => {
    if (isMuted) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'miss') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'sunk') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    }
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
    setScreen('setup');
    if (mode === 'pve') randomizeFleet(setP2Board, setP2Ships);
  };

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
      } else {
        setCurrentPlayer(1);
        setScreen('playing');
        setLog("Commence firing!");
      }
    }
  };

  // --- Attack Logic ---
  useEffect(() => {
    if (screen === 'playing' && gameMode === 'pve' && currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        let r, c;
        do {
          r = Math.floor(Math.random() * ROWS);
          c = Math.floor(Math.random() * COLS);
        } while (p1Board[r][c].isHit || p1Board[r][c].isMiss);
        handleAttack(r, c, 2);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, screen, winner]);

  const handleAttack = (r, c, attackerId) => {
    if (screen !== 'playing' || winner || attackerId !== currentPlayer) return;

    const isAttackingP2 = attackerId === 1;
    const targetBoard = isAttackingP2 ? [...p2Board] : [...p1Board];
    const targetShips = isAttackingP2 ? { ...p2Ships } : { ...p1Ships };
    const cell = targetBoard[r][c];

    if (cell.isHit || cell.isMiss) return;

    targetBoard[r] = [...targetBoard[r]];
    targetBoard[r][c] = { ...cell };

    if (cell.hasShip) {
      targetBoard[r][c].isHit = true;
      targetShips[cell.shipId] -= 1;
      
      if (targetShips[cell.shipId] === 0) {
        playSound('sunk');
        setLog(`${attackerId === 1 ? 'P1' : 'P2'} SUNK the ${SHIPS_INFO.find(s=>s.id===cell.shipId).name}!`);
        targetBoard.forEach((row, rr) => row.forEach((ccell, cc) => {
          if (ccell.shipId === cell.shipId) targetBoard[rr][cc].isSunk = true;
        }));
      } else {
        playSound('hit');
        setLog(`${attackerId === 1 ? 'P1' : 'P2'} HIT!`);
      }
    } else {
      playSound('miss');
      targetBoard[r][c].isMiss = true;
      setLog(`${attackerId === 1 ? 'P1' : 'P2'} Missed.`);
    }

    if (isAttackingP2) { setP2Board(targetBoard); setP2Ships(targetShips); }
    else { setP1Board(targetBoard); setP1Ships(targetShips); }

    if (Object.values(targetShips).every(hp => hp === 0)) {
      setWinner(attackerId);
      setScreen('gameover');
      return;
    }
    setCurrentPlayer(attackerId === 1 ? 2 : 1);
  };

  // --- Rendering ---
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
      bgClass = hoverValid ? "bg-green-500/50" : "bg-red-500/50";
    }

    return (
      <div 
        key={`${r}-${c}`}
        onClick={() => onCellClick && onCellClick(r, c)}
        onMouseEnter={() => screen === 'setup' && handleMouseEnter(r, c)}
        onMouseLeave={() => screen === 'setup' && setHoverCells([])}
        // *** จุดแก้ขนาด Grid ให้อยู่ตรงนี้ ขยายขนาดในแต่ละหน้าจอ ***
        className={`w-8 h-8 min-[400px]:w-9 min-[400px]:h-9 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-14 lg:h-14 xl:w-16 xl:h-16 
          border border-white/10 flex items-center justify-center transition-all duration-300
          ${bgClass}
          ${isClickable ? 'cursor-crosshair hover:bg-white/20' : 'cursor-default'}
        `}
      >
        {content}
      </div>
    );
  };

  const renderBoardGrid = (board, isClickable, attackerId) => (
    <div className="grid grid-cols-9 gap-[1px] md:gap-1 border border-white/10 p-2 bg-black/50 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
      {board.flatMap((row, r) => row.map((cell, c) => 
        renderCell(cell, r, c, isClickable && !cell.isHit && !cell.isMiss, isClickable ? () => handleAttack(r, c, attackerId) : null)
      ))}
    </div>
  );

  if (screen === 'menu') {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-4 font-['Orbitron'] text-white">
        <div className="bg-[#110b1c]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl max-w-sm w-full">
          <Crosshair size={64} className="mx-auto mb-6 text-[#4ECDC4]" />
          <h1 className="text-3xl font-bold mb-8 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#4ECDC4] to-[#2EC4B6]">BATTLESHIP</h1>
          <div className="flex flex-col gap-4">
            <button onClick={() => handleStartGame('pve')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl flex items-center justify-center gap-3"><Bot size={20} className="text-[#FFD166]" /> VS AI</button>
            <button onClick={() => handleStartGame('pvp')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl flex items-center justify-center gap-3"><Users size={20} className="text-[#FF6B6B]" /> 2 PLAYER</button>
            <button onClick={() => navigate('/dashboard/minigames')} className="mt-4 text-gray-400 hover:text-white text-sm">BACK TO HUB</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'setup') {
    const board = currentPlayer === 1 ? p1Board : p2Board;
    return (
      <div className="w-full flex flex-col items-center px-4 py-8 md:px-8 font-['Orbitron'] text-white">
        <div className="w-full max-w-2xl flex justify-between mb-4"><h1 className="text-xl md:text-2xl font-bold text-[#4ECDC4]">PLAYER {currentPlayer} SETUP</h1></div>
        <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 shadow-2xl">
          {renderBoardGrid(board, false, null)}
          <div className="mt-6 w-full">
            {unplacedShips.length > 0 ? (
              <div className="text-center">
                <p className="text-sm md:text-base text-[#FFD166] mb-3">{unplacedShips[0].name} (Size: {unplacedShips[0].size})</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setIsHorizontal(!isHorizontal)} className="bg-white/10 px-6 py-3 rounded-lg text-sm hover:bg-white/20 transition-all font-bold flex items-center gap-2"><RotateCcw size={18}/> ROTATE</button>
                  <button onClick={() => { currentPlayer === 1 ? randomizeFleet(setP1Board, setP1Ships) : randomizeFleet(setP2Board, setP2Ships); setUnplacedShips([]); }} className="bg-white/10 px-6 py-3 rounded-lg text-sm hover:bg-white/20 transition-all font-bold flex items-center gap-2"><Shuffle size={18}/> RANDOM</button>
                </div>
              </div>
            ) : (
              <button onClick={handleSetupDone} className="w-full bg-[#4ECDC4] text-black py-4 rounded-xl font-bold tracking-widest hover:scale-[1.02] transition-transform">CONFIRM FLEET</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    // *** จุดแก้ Padding นอกสุด: เพิ่ม px-4 py-8 md:p-8 ให้มีขอบไม่ติดจอ ***
    <div className="w-full flex flex-col items-center px-2 py-6 md:p-8 font-['Orbitron'] text-white relative">
      {screen === 'gameover' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#110b1c] p-8 rounded-3xl text-center border border-white/20 shadow-[0_0_50px_rgba(78,205,196,0.3)]">
            <Crown size={64} className="mx-auto mb-4 text-[#4ECDC4]"/>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4ECDC4] mb-8">PLAYER {winner} WINS!</h2>
            <button onClick={() => setScreen('menu')} className="w-full bg-white/10 py-4 rounded-xl font-bold tracking-widest hover:bg-white/20 transition-all">BACK TO MENU</button>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
        <button onClick={() => setScreen('menu')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft /></button>
        <div className={`px-6 py-2 rounded-full font-bold tracking-widest text-sm md:text-base border ${currentPlayer === 1 ? 'bg-[#FF6B6B]/20 border-[#FF6B6B]/50 text-[#FF6B6B]' : 'bg-[#FFD166]/20 border-[#FFD166]/50 text-[#FFD166]'}`}>
          PLAYER {currentPlayer} TURN
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-full transition-colors">{isMuted ? <VolumeX /> : <Volume2 />}</button>
      </div>

      <div className="text-center text-[#4ECDC4] mb-4 h-6 font-bold tracking-widest uppercase text-sm md:text-base">{log}</div>

      {/* Boards Area */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center w-full max-w-7xl">
        <div className={`flex flex-col items-center p-4 rounded-3xl transition-all duration-300 ${currentPlayer === 2 ? 'ring-2 ring-[#4ECDC4] bg-white/5 shadow-[0_0_30px_rgba(78,205,196,0.1)]' : 'opacity-40 grayscale-[50%] pointer-events-none'}`}>
          <h2 className="mb-4 font-bold tracking-widest text-sm md:text-base text-gray-300 flex items-center gap-2"><Crosshair size={18}/> P1 RADAR</h2>
          {renderBoardGrid(p1Board, currentPlayer === 2, 2)}
        </div>

        <div className={`flex flex-col items-center p-4 rounded-3xl transition-all duration-300 ${currentPlayer === 1 ? 'ring-2 ring-[#4ECDC4] bg-white/5 shadow-[0_0_30px_rgba(78,205,196,0.1)]' : 'opacity-40 grayscale-[50%] pointer-events-none'}`}>
          <h2 className="mb-4 font-bold tracking-widest text-sm md:text-base text-gray-300 flex items-center gap-2"><Crosshair size={18}/> P2 RADAR</h2>
          {renderBoardGrid(p2Board, currentPlayer === 1, 1)}
        </div>
      </div>

    </div>
  );
}