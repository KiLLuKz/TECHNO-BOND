import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Crown, Bot, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemAlert from"../../SystemAlert"; 
import { supabase } from '../../../supabaseClient';
import { addExpToUser } from '../../../api/activityApi';

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

 const [gameMode, setGameMode] = useState('pvp');
 const [screen, setScreen] = useState('menu');

 // AI Logic
 useEffect(() => {
 if (gameMode === 'ai' && turn === 2 && !alertState.isOpen && board.some(r => r.some(c => c !== null))) {
 const timer = setTimeout(() => {
 playAITurn();
 }, 600);
 return () => clearTimeout(timer);
 }
 }, [turn, gameMode, alertState.isOpen, mandatoryJumpers, board]);

 const playAITurn = () => {
 let pieces = [];
 if (mandatoryJumpers.length > 0) {
 pieces = [...mandatoryJumpers];
 } else {
 for (let r = 0; r < SIZE; r++) {
 for (let c = 0; c < SIZE; c++) {
 if (board[r][c] && board[r][c].player === 2) {
 const moves = calculateValidMoves(r, c, board, false);
 if (moves.length > 0) pieces.push({ r, c });
 }
 }
 }
 }

 if (pieces.length === 0) return;

 const simulateMove = (startR, startC, move, currentBoard) => {
 let b = currentBoard.map(row => [...row]);
 let r = move.r;
 let c = move.c;
 let piece = { ...b[startR][startC] };
 
 b[r][c] = piece;
 b[startR][startC] = null;
 let jumpsMade = 0;
 let promoted = false;

 if (move.type === 'jump') {
 b[move.jumpR][move.jumpC] = null;
 jumpsMade++;
 if (!piece.isKing && r === SIZE - 1) {
 piece.isKing = true;
 promoted = true;
 }
 
 if (!promoted) {
 let nextJumps = calculateValidMoves(r, c, b, true).filter(m => m.type === 'jump');
 while (nextJumps.length > 0) {
 let next = nextJumps[0];
 b[next.r][next.c] = piece;
 b[r][c] = null;
 b[next.jumpR][next.jumpC] = null;
 jumpsMade++;
 r = next.r;
 c = next.c;
 if (!piece.isKing && r === SIZE - 1) {
 piece.isKing = true;
 break;
 }
 nextJumps = calculateValidMoves(r, c, b, true).filter(m => m.type === 'jump');
 }
 }
 } else {
 if (!piece.isKing && r === SIZE - 1) {
 piece.isKing = true;
 }
 }

 let score = jumpsMade * 10; 
 if (!piece.isKing) score += (r - startR); 
 if (piece.isKing) score += 5;
 score += Math.random() * 2;
 return { finalBoard: b, score };
 };

 let bestScore = -Infinity;
 let bestBoard = null;

 for (let p of pieces) {
 const moves = calculateValidMoves(p.r, p.c, board, mandatoryJumpers.length > 0);
 for (let m of moves) {
 const { finalBoard, score } = simulateMove(p.r, p.c, m, board);
 if (score > bestScore) {
 bestScore = score;
 bestBoard = finalBoard;
 }
 }
 }

 if (bestBoard) {
 if (Math.random() < 0.2) {
 const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
 const randomMoves = calculateValidMoves(randomPiece.r, randomPiece.c, board, mandatoryJumpers.length > 0);
 const randomMove = randomMoves[Math.floor(Math.random() * randomMoves.length)];
 const { finalBoard } = simulateMove(randomPiece.r, randomPiece.c, randomMove, board);
 setBoard(finalBoard);
 } else {
 setBoard(bestBoard);
 }
 setSelected(null);
 setValidMoves([]);
 setMustJumpPiece(null);
 setMandatoryJumpers([]);
 setTurn(1);
 }
 };

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
 isOpen: true, 
 type: 'success', 
 title: 'GAME OVER!', 
 message: (
 <div className="flex flex-col items-center">
 <span>{`PLAYER ${winner} WINS THE MATCH!`}</span>
 <span className="text-xl font-bold text-[#ffe066] drop-shadow-[0_0_10px_rgba(255,224,102,0.8)] mt-4 animate-pulse">
 +{gameMode === 'ai' ? 20 : 40} EXP
 </span>
 </div>
 ), 
 onConfirm: handleRestart, confirmText: 'PLAY AGAIN', cancelText: 'CLOSE'
 });
 
 const rewardExp = async () => {
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (user) {
 const expAmount = gameMode === 'ai' ? 20 : 40;
 await addExpToUser(user.id, expAmount);
 }
 } catch (error) {
 console.error("Error rewarding EXP:", error);
 }
 };
 rewardExp();
 return;
 }

 setMandatoryJumpers(currentJumpers.length > 0 ? currentJumpers : []);
 }, [turn, board]); 

 const handleCellClick = (r, c) => {
 if (gameMode === 'ai' && turn === 2) return; // Block interaction on AI's turn

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

 if (screen === 'menu') {
 return (
 <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-4 text-white overflow-hidden">
 <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-bold tracking-widest text-[#d966ff] mb-12 drop-shadow-[0_0_15px_rgba(217,102,255,0.5)]">
 THAI CHECKERS
 </h1>
 <div className="flex flex-col gap-4 w-full max-w-sm">
 <button 
 onClick={() => { setGameMode('ai'); setScreen('game'); handleRestart(); }}
 className="flex items-center justify-center gap-3 p-4 bg-[#d966ff]/10 hover:bg-[#d966ff]/20 border border-[#d966ff]/50 rounded-2xl transition-all group"
 >
 <Bot size={28} className="text-[#d966ff] group-hover:scale-110 transition-transform" />
 <span className="text-xl font-bold tracking-widest text-[#d966ff]">VS AI</span>
 </button>
 <button 
 onClick={() => { setGameMode('pvp'); setScreen('game'); handleRestart(); }}
 className="flex items-center justify-center gap-3 p-4 bg-[#4ECDC4]/10 hover:bg-[#4ECDC4]/20 border border-[#4ECDC4]/50 rounded-2xl transition-all group"
 >
 <Users size={28} className="text-[#4ECDC4] group-hover:scale-110 transition-transform" />
 <span className="text-xl font-bold tracking-widest text-[#4ECDC4]">VS PLAYER</span>
 </button>
 </div>
 <button onClick={() => navigate('/dashboard/minigames')} className="mt-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
 <ArrowLeft size={18} /> BACK
 </button>
 </div>
 );
 }

 return (
 <div className="w-full min-h-[100dvh] flex flex-col items-center p-2 md:p-6 text-white overflow-hidden mt-25 md:mt-0">
 <SystemAlert {...alertState} onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} />

 {/* Header */}
 <div className="w-full max-w-4xl flex items-center justify-between mb-4 md:mb-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
 <button onClick={() => setScreen('menu')} className="p-2 hover:bg-white/10 rounded-full transition-all"><ArrowLeft /></button>
 <div className="flex flex-col items-center">
 <h1 className="font-['Orbitron'] text-lg md:text-2xl font-bold text-[#4ECDC4] tracking-widest">THAI CHECKERS</h1>
 <span className="text-xs md:text-sm md:text-base text-gray-400 font-bold tracking-widest flex items-center gap-1">
 {gameMode === 'ai' ? <><Bot size={12}/> VS AI</> : <><Users size={12}/> VS PLAYER</>}
 </span>
 </div>
 <button onClick={() => {
 setAlertState({ isOpen: true, type: 'warning', title: 'RESTART GAME', message: 'Do you want to reset the board?', onConfirm: handleRestart });
 }} className="p-2 hover:bg-white/10 rounded-full transition-all"><RotateCcw /></button>
 </div>

 {/* Turn Indicator */}
 <div className="flex gap-4 mb-4 md:mb-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
 <span className={`text-sm md:text-base md:text-lg font-bold tracking-widest transition-colors ${turn === 1 ? 'text-[#FF6B6B]' : 'text-[#FFD166]'}`}>
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

 {/* เอฟเฟกต์กะพริบแจ้งเตือนว่า"ต้องกินด้วยตัวนี้!" */}
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