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
  const [mustJumpPiece, setMustJumpPiece] = useState(null); // ล็อคหมากตัวที่ต้องกินต่อ

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
    const piece = boardState[r][c];
    if (!piece) return [];
    const moves = [];

    // ทิศทางการเดิน: ฮอสเดินได้ 4 ทิศ, หมากธรรมดาเดินหน้า 2 ทิศ
    const dirs = piece.isKing 
      ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] 
      : (piece.player === 1 ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]]);

    dirs.forEach(([dr, dc]) => {
      // --- 1. ตรวจสอบการกิน (Jump) ---
      let nr = r + dr, nc = c + dc;
      let foundEnemy = null;
      
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        if (boardState[nr][nc]) {
          if (boardState[nr][nc].player !== piece.player) {
            foundEnemy = { r: nr, c: nc }; // เจอศัตรู
          }
          break; // เจอหมากไม่ว่าฝ่ายไหน ต้องหยุดมองทะลุ
        }
        if (!piece.isKing) break; // หมากธรรมดามองได้แค่ 1 ช่องติดกัน
        nr += dr; nc += dc;
      }

      if (foundEnemy) {
        // กฎหมากฮอสไทย: ต้องตกลงหลังศัตรู 1 ช่องพอดี
        const jumpR = foundEnemy.r + dr;
        const jumpC = foundEnemy.c + dc;
        if (jumpR >= 0 && jumpR < SIZE && jumpC >= 0 && jumpC < SIZE && !boardState[jumpR][jumpC]) {
          moves.push({ r: jumpR, c: jumpC, type: 'jump', jumpR: foundEnemy.r, jumpC: foundEnemy.c });
        }
      }

      // --- 2. ตรวจสอบการเดินปกติ (Slide) ---
      // จะเช็คก็ต่อเมื่อ "ไม่ได้อยู่ในโหมดบังคับกินต่อเนื่อง" เท่านั้น
      if (!onlyJumps) {
        let sr = r + dr, sc = c + dc;
        while (sr >= 0 && sr < SIZE && sc >= 0 && sc < SIZE && !boardState[sr][sc]) {
          moves.push({ r: sr, c: sc, type: 'move' });
          if (!piece.isKing) break; // หมากธรรมดาเดินได้แค่ 1 ช่อง
          sr += dr; sc += dc;
        }
      }
    });

    return moves;
  };

  const handleCellClick = (r, c) => {
    // 1. เลือกหมาก
    if (board[r][c] && board[r][c].player === turn) {
      // ถ้าระบบบังคับให้กินต่อเนื่อง ห้ามผู้เล่นไปคลิกเลือกหมากตัวอื่นเด็ดขาด!
      if (mustJumpPiece && (r !== mustJumpPiece.r || c !== mustJumpPiece.c)) return;
      
      setSelected({ r, c });
      // ถ้าติดบังคับกิน ให้หาทางไปเฉพาะตาที่ "กิน" เท่านั้น (onlyJumps = true)
      setValidMoves(calculateValidMoves(r, c, board, !!mustJumpPiece));
      return;
    }

    // 2. เดินหมาก หรือ กิน
    if (selected) {
      const move = validMoves.find(m => m.r === r && m.c === c);
      
      if (move) {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[selected.r][selected.c];

        // ย้ายตำแหน่งหมาก
        newBoard[r][c] = { ...piece };
        newBoard[selected.r][selected.c] = null;

        let promoted = false;

        if (move.type === 'jump') {
          // ลบหมากศัตรูออกทันที
          newBoard[move.jumpR][move.jumpC] = null;

          // เช็คการเข้าฮอส (ถ้าเข้าฮอสปุ๊บ กฎไทยบอกให้หยุดตานั้นทันที)
          if (!piece.isKing && ((turn === 1 && r === 0) || (turn === 2 && r === SIZE - 1))) {
            newBoard[r][c].isKing = true;
            promoted = true;
          }

          // ถ้าไม่ได้เพิ่งเข้าฮอส ให้เช็คว่า "มีตัวให้กินต่อไหม?"
          if (!promoted) {
            const nextJumps = calculateValidMoves(r, c, newBoard, true).filter(m => m.type === 'jump');
            
            // ถ้ามีตัวให้กินต่อ
            if (nextJumps.length > 0) {
              setBoard(newBoard);
              setSelected({ r, c }); // ค้างการเลือกหมากตัวเดิมไว้
              setMustJumpPiece({ r, c }); // ล็อคหมาก! ห้ามเปลี่ยนตัว
              setValidMoves(nextJumps); // โชว์จุด Guide ของการกินสเตปถัดไป
              return; // *** สำคัญ: ออกจากฟังก์ชันเลย ไม่ยอมให้สลับตาเดิน ***
            }
          }
        } else {
          // ถ้าเดินปกติ เช็คเข้าฮอสเฉยๆ
          if (!piece.isKing && ((turn === 1 && r === 0) || (turn === 2 && r === SIZE - 1))) {
            newBoard[r][c].isKing = true;
          }
        }

        // --- จบเทิร์นสมบูรณ์ (เดินเสร็จ หรือ กินต่อเนื่องจนหมดแล้ว) ---
        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);
        setMustJumpPiece(null); // ปลดล็อคหมาก
        setTurn(turn === 1 ? 2 : 1); // สลับตาให้ฝั่งตรงข้าม
        
      } else if (!mustJumpPiece) {
        // ถ้ายกเลิกการคลิกที่ว่างๆ (และไม่ได้ติดบังคับกินอยู่) ให้เคลียร์ Guide ทิ้ง
        setSelected(null);
        setValidMoves([]);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 font-['Orbitron'] text-white">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <button onClick={() => navigate('/dashboard/minigames')} className="p-2 hover:bg-white/10 rounded-full transition-all"><ArrowLeft /></button>
        <h1 className="text-xl font-bold text-[#4ECDC4] tracking-widest">THAI CHECKERS</h1>
        <button onClick={() => { setBoard(initializeBoard()); setTurn(1); setSelected(null); setMustJumpPiece(null); setValidMoves([]); }} className="p-2 hover:bg-white/10 rounded-full transition-all"><RotateCcw /></button>
      </div>

      {/* Turn Indicator */}
      <div className="flex gap-4 mb-6 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
        <span className={`text-sm font-bold tracking-widest transition-colors ${turn === 1 ? 'text-[#FF6B6B]' : 'text-[#FFD166]'}`}>
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
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center relative transition-all duration-300
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

                {/* จุด Highlight Guide */}
                {isTarget && <div className="absolute w-4 h-4 bg-white/50 rounded-full animate-pulse z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}