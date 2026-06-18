import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemAlert from "../../SystemAlert"; 

const SIZE = 8;

export default function ThaiCheckersGame() {
  const navigate = useNavigate();
  
  // Game States
  const [board, setBoard] = useState(initializeBoard());
  const [turn, setTurn] = useState(1);
  
  // Player Interaction States
  const [selected, setSelected] = useState(null); 
  const [validMoves, setValidMoves] = useState([]); 
  const [mustJumpPiece, setMustJumpPiece] = useState(null); 
  const [mandatoryJumpers, setMandatoryJumpers] = useState([]); 

  // Alert State
  const [alertState, setAlertState] = useState({ 
    isOpen: false, type: 'info', title: '', message: '', onConfirm: null 
  });

  // สร้างกระดานเริ่มต้น (เพิ่ม id ประจำตัวให้หมากแต่ละตัว เพื่อใช้ทำ Animation สไลด์)
  function initializeBoard() {
    let b = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r + c) % 2 !== 0) {
          if (r < 2) b[r][c] = { id: Math.random().toString(36).substr(2, 9), player: 2, isKing: false };
          else if (r > 5) b[r][c] = { id: Math.random().toString(36).substr(2, 9), player: 1, isKing: false };
        }
      }
    }
    return b;
  }

  const handleRestart = () => {
    setBoard(initializeBoard());
    setTurn(1);
    setSelected(null);
    setValidMoves([]);
    setMustJumpPiece(null);
    setMandatoryJumpers([]);
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const calculateValidMoves = (r, c, boardState, onlyJumps = false) => {
    const piece = boardState[r][c];
    if (!piece) return [];
    const moves = [];

    const dirs = piece.isKing 
      ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] 
      : (piece.player === 1 ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]]);

    dirs.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      let foundEnemy = null;
      
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        if (boardState[nr][nc]) {
          if (boardState[nr][nc].player !== piece.player) foundEnemy = { r: nr, c: nc };
          break;
        }
        if (!piece.isKing) break; 
        nr += dr; nc += dc;
      }

      if (foundEnemy) {
        const jumpR = foundEnemy.r + dr;
        const jumpC = foundEnemy.c + dc;
        if (jumpR >= 0 && jumpR < SIZE && jumpC >= 0 && jumpC < SIZE && !boardState[jumpR][jumpC]) {
          moves.push({ r: jumpR, c: jumpC, type: 'jump', jumpR: foundEnemy.r, jumpC: foundEnemy.c });
        }
      }

      if (!onlyJumps) {
        let sr = r + dr, sc = c + dc;
        while (sr >= 0 && sr < SIZE && sc >= 0 && sc < SIZE && !boardState[sr][sc]) {
          moves.push({ r: sr, c: sc, type: 'move' });
          if (!piece.isKing) break; 
          sr += dr; sc += dc;
        }
      }
    });
    return moves;
  };

  useEffect(() => {
    let hasAnyMove = false;
    let p1Count = 0;
    let p2Count = 0;
    const currentJumpers = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.player === 1) p1Count++;
          if (piece.player === 2) p2Count++;

          if (piece.player === turn) {
            const moves = calculateValidMoves(r, c, board, false);
            if (moves.length > 0) hasAnyMove = true; 
            if (moves.some(m => m.type === 'jump')) currentJumpers.push({ r, c });
          }
        }
      }
    }

    if (p1Count === 0 || p2Count === 0 || !hasAnyMove) {
      const winner = (p1Count === 0 || (turn === 1 && !hasAnyMove)) ? 2 : 1;
      setAlertState({
        isOpen: true, type: 'success', title: 'GAME OVER!', message: `PLAYER ${winner} WINS THE MATCH!`, onConfirm: handleRestart
      });
      return;
    }

    setMandatoryJumpers(currentJumpers.length > 0 ? currentJumpers : []);
  }, [turn, board]); 

  const handleCellClick = (r, c) => {
    // 1. เลือกหมาก
    if (board[r][c] && board[r][c].player === turn) {
      if (mustJumpPiece && (r !== mustJumpPiece.r || c !== mustJumpPiece.c)) return;
      if (!mustJumpPiece && mandatoryJumpers.length > 0) {
        const isMandatory = mandatoryJumpers.some(mj => mj.r === r && mj.c === c);
        if (!isMandatory) return; 
      }
      setSelected({ r, c });
      const forceJump = !!mustJumpPiece || mandatoryJumpers.length > 0;
      setValidMoves(calculateValidMoves(r, c, board, forceJump));
      return;
    }

    // 2. เดินหมาก
    if (selected) {
      const move = validMoves.find(m => m.r === r && m.c === c);
      
      if (move) {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[selected.r][selected.c];

        newBoard[r][c] = { ...piece }; // ก๊อปปี้ ID มาด้วย ทำให้ Animate ไปช่องใหม่ได้
        newBoard[selected.r][selected.c] = null;

        let promoted = false;

        if (move.type === 'jump') {
          newBoard[move.jumpR][move.jumpC] = null;

          if (!piece.isKing && ((turn === 1 && r === 0) || (turn === 2 && r === SIZE - 1))) {
            newBoard[r][c].isKing = true;
            promoted = true;
          }

          if (!promoted) {
            const nextJumps = calculateValidMoves(r, c, newBoard, true).filter(m => m.type === 'jump');
            if (nextJumps.length > 0) {
              setBoard(newBoard);
              setSelected({ r, c }); 
              setMustJumpPiece({ r, c }); 
              setValidMoves(nextJumps); 
              return; 
            }
          }
        } else {
          if (!piece.isKing && ((turn === 1 && r === 0) || (turn === 2 && r === SIZE - 1))) {
            newBoard[r][c].isKing = true;
          }
        }

        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);
        setMustJumpPiece(null); 
        setMandatoryJumpers([]); 
        setTurn(turn === 1 ? 2 : 1); 
        
      } else if (!mustJumpPiece) {
        setSelected(null);
        setValidMoves([]);
      }
    }
  };

  // ดึงข้อมูลหมากทั้งหมดออกมาเป็น Array แบนๆ เพื่อใช้วาดแยกเลเยอร์ให้มัน Animate ได้
  const piecesList = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) piecesList.push({ ...cell, r, c });
    });
  });

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center p-2 md:p-6 font-['Orbitron'] text-white overflow-hidden mt-25 md:mt-0">
      <SystemAlert {...alertState} onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} />

      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 md:mb-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <button onClick={() => navigate('/dashboard/minigames')} className="p-2 hover:bg-white/10 rounded-full transition-all"><ArrowLeft /></button>
        <h1 className="text-lg md:text-2xl font-bold text-[#4ECDC4] tracking-widest">THAI CHECKERS</h1>
        <button onClick={() => {
          setAlertState({ isOpen: true, type: 'warning', title: 'RESTART GAME', message: 'Do you want to reset the board?', onConfirm: handleRestart });
        }} className="p-2 hover:bg-white/10 rounded-full transition-all"><RotateCcw /></button>
      </div>

      {/* Turn Indicator */}
      <div className="flex gap-4 mb-4 md:mb-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <span className={`text-sm md:text-lg font-bold tracking-widest transition-colors ${turn === 1 ? 'text-[#FF6B6B]' : 'text-[#FFD166]'}`}>
          PLAYER {turn}'S TURN
        </span>
      </div>

      {/* Board Container (Scale ใหญ่เต็มตาบน PC และพอดีจอบนมือถือ) */}
      <div className="relative w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] aspect-square bg-[#08050f] border-4 border-white/10 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Layer 1: พื้นหลังกระดานตาราง 8x8 */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array(SIZE).fill(null).map((_, r) => 
            Array(SIZE).fill(null).map((_, c) => {
              const isBlack = (r + c) % 2 !== 0;
              const isSelectedCell = selected?.r === r && selected?.c === c;
              const isTarget = validMoves.some(m => m.r === r && m.c === c);
              
              return (
                <div 
                  key={`bg-${r}-${c}`} 
                  onClick={() => handleCellClick(r, c)}
                  className={`flex items-center justify-center relative ${isBlack ? 'cursor-pointer' : ''}
                  ${isSelectedCell ? 'bg-blue-500/30' : (isBlack ? 'bg-[#1a1429]' : 'bg-transparent')}`}
                >
                  {/* จุด Highlight ช่องที่เดินไปได้ */}
                  {isTarget && <div className="absolute w-[30%] h-[30%] bg-white/60 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
                </div>
              );
            })
          )}
        </div>

        {/* Layer 2: ตัวหมากที่สามารถสไลด์ Animate ได้ */}
        {piecesList.map((p) => {
          const isSelected = selected?.r === p.r && selected?.c === p.c;
          const isMandatoryToMove = (!selected && p.player === turn && mandatoryJumpers.some(mj => mj.r === p.r && mj.c === p.c));
          const isForcedJumper = mustJumpPiece && mustJumpPiece.r === p.r && mustJumpPiece.c === p.c;

          return (
            <div 
              key={p.id}
              onClick={(e) => { e.stopPropagation(); handleCellClick(p.r, p.c); }}
              className={`absolute transition-all duration-300 ease-in-out flex items-center justify-center cursor-pointer ${isSelected ? 'z-20' : 'z-10'}`}
              style={{
                width: '12.5%', height: '12.5%', // 100% / 8 ช่อง = 12.5%
                left: `${p.c * 12.5}%`, top: `${p.r * 12.5}%` // เลื่อนพิกัดตาม row/col (Animation CSS จะจัดการความสมูทให้เอง)
              }}
            >
              <div className={`w-[80%] h-[80%] rounded-full flex items-center justify-center relative transition-transform shadow-lg
                ${p.player === 1 ? 'bg-[#FF6B6B]' : 'bg-[#FFD166]'}
                ${isSelected ? 'scale-110 ring-4 ring-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)]' : 'ring-2 ring-black/40'}
              `}>
                {/* ไอคอนมงกุฎสำหรับหมากฮอส */}
                {p.isKing && <Crown className="w-[55%] h-[55%] text-white drop-shadow-md" />}

                {/* เอฟเฟกต์กะพริบแจ้งเตือนว่า "ต้องกินด้วยตัวนี้!" */}
                {(isMandatoryToMove || isForcedJumper) && !isSelected && (
                  <div className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}