import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SIZE = 8;

export default function ThaiCheckersGame() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(initializeBoard());
  const [selected, setSelected] = useState(null); 
  const [turn, setTurn] = useState(1);
  const [validMoves, setValidMoves] = useState([]); 
  const [mustJumpPiece, setMustJumpPiece] = useState(null); 

  function initializeBoard() {
    let b = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r + c) % 2 !== 0) {
          if (r < 2) b[r][c] = { player: 2, isKing: false };
          else if (r > 5) b[r][c] = { player: 1, isKing: false };
        }
      }
    }
    return b;
  }

  const calculateValidMoves = (r, c, boardState, onlyJumps = false) => {
    const moves = [];
    const piece = boardState[r][c];
    if (!piece) return [];

    const dirs = [[1,1], [1,-1], [-1,1], [-1,-1]]; // ทแยง 4 ทิศ

    dirs.forEach(([dr, dc]) => {
      // --- LOGIC: กิน (Jump) ---
      // หาหมากศัตรูที่อยู่ถัดไปในแนวทแยง
      let nr = r + dr, nc = c + dc;
      let foundEnemy = false;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        if (boardState[nr][nc]) {
          if (boardState[nr][nc].player !== piece.player) {
            foundEnemy = { r: nr, c: nc }; // เจอศัตรู
          }
          break; // เจอหมากไม่ว่าฝ่ายไหน ต้องหยุดดู
        }
        if (!piece.isKing) break; // ถ้าเป็นหมากธรรมดาเดินได้แค่ 1 ช่อง
        nr += dr; nc += dc;
      }

      if (foundEnemy) {
        const jumpR = foundEnemy.r + dr;
        const jumpC = foundEnemy.c + dc;
        // ต้องลงหลังศัตรูทันที (ในระยะ 1 ช่องถัดจากศัตรู)
        if (jumpR >= 0 && jumpR < SIZE && jumpC >= 0 && jumpC < SIZE && !boardState[jumpR][jumpC]) {
          moves.push({ r: jumpR, c: jumpC, type: 'jump', jumpR: foundEnemy.r, jumpC: foundEnemy.c });
        }
      }

      // --- LOGIC: เดินปกติ (Slide) ---
      if (!onlyJumps) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !boardState[nr][nc]) {
          moves.push({ r: nr, c: nc, type: 'move' });
          if (!piece.isKing) break; // หมากธรรมดาเดินได้แค่ช่องเดียว
          nr += dr; nc += dc;
        }
      }
    });
    return moves;
  };

  const handleCellClick = (r, c) => {
    // ถ้าบังคับกินต่อ ต้องเลือกหมากตัวเดิมเท่านั้น
    if (mustJumpPiece && (r !== mustJumpPiece.r || c !== mustJumpPiece.c)) return;

    if (board[r][c] && board[r][c].player === turn) {
      setSelected({ r, c });
      setValidMoves(calculateValidMoves(r, c, board, !!mustJumpPiece));
      return;
    }

    if (selected) {
      const move = validMoves.find(m => m.r === r && m.c === c);
      if (move) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = { ...newBoard[selected.r][selected.c] };
        newBoard[selected.r][selected.c] = null;

        if (move.type === 'jump') {
          newBoard[move.jumpR][move.jumpC] = null; 
          const canContinue = calculateValidMoves(r, c, newBoard, true).filter(m => m.type === 'jump');
          if (canContinue.length > 0) {
            setBoard(newBoard);
            setSelected({ r, c });
            setMustJumpPiece({ r, c });
            setValidMoves(canContinue);
            return;
          }
        }

        if ((turn === 1 && r === 0) || (turn === 2 && r === 7)) newBoard[r][c].isKing = true;

        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);
        setMustJumpPiece(null);
        setTurn(turn === 1 ? 2 : 1);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 font-['Orbitron'] text-white">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
        <button onClick={() => navigate('/dashboard/minigames')} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft /></button>
        <h1 className="text-xl font-bold text-[#4ECDC4]">THAI CHECKERS</h1>
        <button onClick={() => { setBoard(initializeBoard()); setTurn(1); setMustJumpPiece(null); }} className="p-2 hover:bg-white/10 rounded-full"><RotateCcw /></button>
      </div>

      {/* Turn Indicator */}
      <div className="flex gap-4 mb-6 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
        <span className={`text-sm font-bold tracking-widest ${turn === 1 ? 'text-[#FF6B6B]' : 'text-[#FFD166]'}`}>
          PLAYER {turn}'S TURN
        </span>
      </div>

      {/* Board */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl">
        <div className="grid grid-cols-8 gap-0.5 md:gap-1.5">
          {board.flatMap((row, r) => row.map((cell, c) => {
            const isBlack = (r + c) % 2 !== 0;
            const isSelected = selected?.r === r && selected?.c === c;
            const isTarget = validMoves.some(m => m.r === r && m.c === c);
            return (
              <div key={`${r}-${c}`} onClick={() => handleCellClick(r, c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center relative transition-all
                ${isBlack ? 'bg-[#1a1429]' : 'bg-[#08050f]'} 
                ${isSelected ? 'ring-2 ring-blue-400 z-10' : ''}
                ${isBlack ? 'cursor-pointer' : 'cursor-default'}`}>
                {cell && (
                  <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg
                    ${cell.player === 1 ? 'bg-[#FF6B6B]' : 'bg-[#FFD166]'}
                    ${isSelected ? 'scale-110 ring-2 ring-white' : ''}`}>
                    {cell.isKing && <Crown size={20} className="text-white" />}
                  </div>
                )}
                {isTarget && <div className="absolute w-4 h-4 bg-white/50 rounded-full animate-pulse z-20" />}
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}