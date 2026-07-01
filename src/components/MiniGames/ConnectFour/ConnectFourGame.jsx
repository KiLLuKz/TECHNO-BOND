import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Bot, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../supabaseClient';
import { addExpToUser } from '../../../api/activityApi';

const ROWS = 6;
const COLS = 7;

const ConnectFourGame = () => {
 const navigate = useNavigate();
 
 const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
 const [currentPlayer, setCurrentPlayer] = useState(1); 
 const [winner, setWinner] = useState(null); 
 const [winningCells, setWinningCells] = useState([]);
 const [gameMode, setGameMode] = useState('pvp');
 const [screen, setScreen] = useState('menu');
 const [showPopup, setShowPopup] = useState(false);

 useEffect(() => {
   if (winner) {
     const timer = setTimeout(() => setShowPopup(true), 1500);
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
     return () => clearTimeout(timer);
   } else {
     setShowPopup(false);
   }
 }, [winner, gameMode]);

 const getLowestEmptyRow = (currentBoard, col) => {
 for (let row = ROWS - 1; row >= 0; row--) {
 if (!currentBoard[row][col]) return row;
 }
 return -1; 
 };

 const checkWin = (currentBoard, row, col, player) => {
 const directions = [ [[0, 1], [0, -1]], [[1, 0], [-1, 0]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]] ];
 for (let dir of directions) {
 let count = 1;
 let cells = [{ r: row, c: col }];
 for (let [dr, dc] of dir) {
 let r = row + dr;
 let c = col + dc;
 while (r >= 0 && r < ROWS && c >= 0 && c < COLS && currentBoard[r][c] === player) {
 count++;
 cells.push({ r, c });
 r += dr;
 c += dc;
 }
 }
 if (count >= 4) return cells; 
 }
 return null;
 };

 useEffect(() => {
 if (gameMode === 'ai' && currentPlayer === 2 && !winner) {
 const timer = setTimeout(() => {
 const bestCol = getBestMoveConnectFour(board);
 if (bestCol !== -1) {
 executeDrop(bestCol, 2);
 }
 }, 500);
 return () => clearTimeout(timer);
 }
 }, [currentPlayer, gameMode, winner, board]);

 const getBestMoveConnectFour = (currentBoard) => {
 const validLocations = [];
 for (let c = 0; c < COLS; c++) {
 if (currentBoard[0][c] === null) validLocations.push(c);
 }

 if (validLocations.length === 0) return -1;

 const evaluateWindow = (window, player) => {
 let score = 0;
 let opp = player === 1 ? 2 : 1;
 let countP = window.filter(c => c === player).length;
 let countE = window.filter(c => c === null).length;
 let countO = window.filter(c => c === opp).length;

 if (countP === 4) score += 100;
 else if (countP === 3 && countE === 1) score += 5;
 else if (countP === 2 && countE === 2) score += 2;

 if (countO === 3 && countE === 1) score -= 4; // Block opponent

 return score;
 };

 const scorePosition = (b, player) => {
 let score = 0;
 // Score center column (prioritize middle)
 let centerArray = [];
 for(let r=0; r<ROWS; r++) centerArray.push(b[r][3]);
 let centerCount = centerArray.filter(c => c === player).length;
 score += centerCount * 3;

 // Horizontal
 for (let r = 0; r < ROWS; r++) {
 let rowArray = b[r];
 for (let c = 0; c < COLS - 3; c++) {
 let window = rowArray.slice(c, c + 4);
 score += evaluateWindow(window, player);
 }
 }
 // Vertical
 for (let c = 0; c < COLS; c++) {
 let colArray = [];
 for (let r = 0; r < ROWS; r++) colArray.push(b[r][c]);
 for (let r = 0; r < ROWS - 3; r++) {
 let window = colArray.slice(r, r + 4);
 score += evaluateWindow(window, player);
 }
 }
 // Diagonals
 for (let r = 0; r < ROWS - 3; r++) {
 for (let c = 0; c < COLS - 3; c++) {
 let window = [b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]];
 score += evaluateWindow(window, player);
 }
 }
 for (let r = 3; r < ROWS; r++) {
 for (let c = 0; c < COLS - 3; c++) {
 let window = [b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3]];
 score += evaluateWindow(window, player);
 }
 }
 return score;
 };

 const checkWinForMinimax = (b, player) => {
 // Horizontal
 for (let c = 0; c < COLS - 3; c++) {
 for (let r = 0; r < ROWS; r++) {
 if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return true;
 }
 }
 // Vertical
 for (let c = 0; c < COLS; c++) {
 for (let r = 0; r < ROWS - 3; r++) {
 if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return true;
 }
 }
 // Diagonals
 for (let c = 0; c < COLS - 3; c++) {
 for (let r = 0; r < ROWS - 3; r++) {
 if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return true;
 }
 }
 for (let c = 0; c < COLS - 3; c++) {
 for (let r = 3; r < ROWS; r++) {
 if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) return true;
 }
 }
 return false;
 };

 const minimax = (boardState, depth, alpha, beta, isMaximizing) => {
 let isTerminal = checkWinForMinimax(boardState, 1) || checkWinForMinimax(boardState, 2) || validLocations.length === 0;
 
 if (depth === 0 || isTerminal) {
 if (isTerminal) {
 if (checkWinForMinimax(boardState, 2)) return { score: 1000000 };
 else if (checkWinForMinimax(boardState, 1)) return { score: -1000000 };
 else return { score: 0 };
 } else {
 return { score: scorePosition(boardState, 2) };
 }
 }

 if (isMaximizing) {
 let value = -Infinity;
 let column = validLocations[0];
 for (let c of validLocations) {
 const row = getLowestEmptyRow(boardState, c);
 if (row === -1) continue;
 let tempBoard = boardState.map(r => [...r]);
 tempBoard[row][c] = 2;
 let newScore = minimax(tempBoard, depth - 1, alpha, beta, false).score;
 if (newScore > value) {
 value = newScore;
 column = c;
 }
 alpha = Math.max(alpha, value);
 if (alpha >= beta) break;
 }
 return { column, score: value };
 } else {
 let value = Infinity;
 let column = validLocations[0];
 for (let c of validLocations) {
 const row = getLowestEmptyRow(boardState, c);
 if (row === -1) continue;
 let tempBoard = boardState.map(r => [...r]);
 tempBoard[row][c] = 1;
 let newScore = minimax(tempBoard, depth - 1, alpha, beta, true).score;
 if (newScore < value) {
 value = newScore;
 column = c;
 }
 beta = Math.min(beta, value);
 if (alpha >= beta) break;
 }
 return { column, score: value };
 }
 };

 // 1. Check if AI can win immediately
 for (let c of validLocations) {
   const row = getLowestEmptyRow(currentBoard, c);
   if (row !== -1) {
     let tempBoard = currentBoard.map(r => [...r]);
     tempBoard[row][c] = 2; // AI
     if (checkWinForMinimax(tempBoard, 2)) return c;
   }
 }

 // 2. Check if Player is about to win and block them
 for (let c of validLocations) {
   const row = getLowestEmptyRow(currentBoard, c);
   if (row !== -1) {
     let tempBoard = currentBoard.map(r => [...r]);
     tempBoard[row][c] = 1; // Player
     if (checkWinForMinimax(tempBoard, 1)) return c;
   }
 }

 // 3. 20% chance to make a random move to ensure it's beatable
 if (Math.random() < 0.2) {
   return validLocations[Math.floor(Math.random() * validLocations.length)];
 }

 const { column } = minimax(currentBoard, 3, -Infinity, Infinity, true); 
 return column !== undefined ? column : validLocations[0];
 };

 const executeDrop = (col, player) => {
 const row = getLowestEmptyRow(board, col);
 if (row === -1) return; 

 const newBoard = board.map(r => [...r]);
 newBoard[row][col] = player;
 setBoard(newBoard);

 const winCells = checkWin(newBoard, row, col, player);
 
 if (winCells) {
 setWinner(player);
 setWinningCells(winCells);
 } else if (newBoard.flat().every(cell => cell !== null)) {
 setWinner('draw'); 
 } else {
 setCurrentPlayer(player === 1 ? 2 : 1);
 }
 };

 const handleDrop = (col) => {
 if (winner || (gameMode === 'ai' && currentPlayer === 2)) return; 
 executeDrop(col, currentPlayer);
 };

 const resetGame = () => {
 setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
 setCurrentPlayer(1);
 setWinner(null);
 setWinningCells([]);
 };

 const isWinningCell = (r, c) => winningCells.some(cell => cell.r === r && cell.c === c);

 if (screen === 'menu') {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white relative overflow-hidden isolate">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
 <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-bold tracking-widest text-[#4ECDC4] mb-12 drop-shadow-[0_0_15px_rgba(78,205,196,0.5)]">
 CONNECT-4
 </h1>
 <div className="flex flex-col gap-4 w-full max-w-sm">
 <button 
 onClick={() => { setGameMode('ai'); setScreen('game'); resetGame(); }}
 className="flex items-center justify-center gap-3 p-4 bg-[#FFD166]/10 hover:bg-[#FFD166]/20 border border-[#FFD166]/50 rounded-2xl transition-all group"
 >
 <Bot size={28} className="text-[#FFD166] group-hover:scale-110 transition-transform" />
 <span className="text-xl font-bold tracking-widest text-[#FFD166]">VS AI</span>
 </button>
 <button 
 onClick={() => { setGameMode('pvp'); setScreen('game'); resetGame(); }}
 className="flex items-center justify-center gap-3 p-4 bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 border border-[#FF6B6B]/50 rounded-2xl transition-all group"
 >
 <Users size={28} className="text-[#FF6B6B] group-hover:scale-110 transition-transform" />
 <span className="text-xl font-bold tracking-widest text-[#FF6B6B]">VS PLAYER</span>
 </button>
 </div>
 <button onClick={() => navigate('/dashboard/minigames')} className="mt-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
 <ArrowLeft size={18} /> BACK
 </button>
 </div>
 );
 }

 return (
 <div className="min-h-screen text-white flex flex-col items-center pt-8 md:pt-12 px-4 relative overflow-hidden isolate">
 
 {/* ฝัง CSS Animation สไตล์การตก + เด้งดึ๋ง */}
 <style>{`
 @keyframes dropCoin {
 0% { transform: translateY(-500px); opacity: 0; }
 60% { transform: translateY(20px); opacity: 1; }
 80% { transform: translateY(-10px); }
 100% { transform: translateY(0); }
 }
 .animate-drop {
 animation: dropCoin 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
 }
 `}</style>

 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

 <div className="w-full max-w-4xl flex items-center justify-between mb-8 z-10 mt-15 md:mt-0">
 <button onClick={() => setScreen('menu')} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all backdrop-blur-md">
 <ArrowLeft size={24} />
 </button>

 <div className="flex flex-col items-center">
 <h1 className="font-['Orbitron'] text-3xl md:text-4xl font-bold tracking-widest text-[#4ECDC4] drop-shadow-lg flex flex-col items-center">
 <span>CONNECT-4</span>
 <span className="text-xs md:text-sm md:text-base text-gray-400 font-bold tracking-widest flex items-center gap-1 mt-2">
 {gameMode === 'ai' ? <><Bot size={12}/> VS AI</> : <><Users size={12}/> VS PLAYER</>}
 </span>
 </h1>
 {!winner ? (
 <div className="flex items-center gap-3 mt-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
 <div className={`w-4 h-4 rounded-full shadow-lg ${currentPlayer === 1 ? 'bg-[#FF6B6B] shadow-[#FF6B6B]/50' : 'bg-[#FFD166] shadow-[#FFD166]/50'} transition-colors duration-300`}></div>
 <span className="text-sm md:text-base tracking-widest font-bold">PLAYER {currentPlayer} TURN</span>
 </div>
 ) : (
 <div className="flex items-center gap-3 mt-4 bg-[#FFD166]/20 px-6 py-2 rounded-full border border-[#FFD166]/30 backdrop-blur-md text-[#FFD166] animate-pulse">
 <Trophy size={18} />
 <span className="text-sm md:text-base tracking-widest font-bold">
 {winner === 'draw' ?"IT'S A DRAW!" : `PLAYER ${winner} WINS!`}
 </span>
 </div>
 )}
 </div>

 <button onClick={resetGame} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all backdrop-blur-md">
 <RotateCcw size={24} />
 </button>
 </div>

 <div className="relative z-10 p-4 md:p-6 bg-[#1a1429]/80 backdrop-blur-xl border-t-2 border-l-2 border-[#ffffff10] shadow-[10px_10px_30px_rgba(0,0,0,0.5)] rounded-3xl mt-20 md:mt-0">
 <div className="grid grid-cols-7 gap-2 md:gap-4">
 {board.map((row, rIndex) => 
 row.map((cell, cIndex) => (
 <div key={`${rIndex}-${cIndex}`} onClick={() => handleDrop(cIndex)} className="group relative cursor-pointer flex justify-center">
 <div className="absolute inset-y-[-1000px] w-full bg-white/0 group-hover:bg-white/5 transition-colors duration-200 pointer-events-none rounded-full z-0"></div>

 <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#08050f] shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10 overflow-hidden border border-white/5">
 {cell && (
 <div className={`
 animate-drop /* <--- เพิ่มคลาส Animation ตกจากข้างบนตรงนี้ */
 w-[85%] h-[85%] rounded-full shadow-[inset_-3px_-5px_10px_rgba(0,0,0,0.3)]
 ${cell === 1 ? 'bg-[#FF6B6B] shadow-[0_0_15px_rgba(255,107,107,0.5)]' : 'bg-[#FFD166] shadow-[0_0_15px_rgba(255,209,102,0.5)]'}
 ${isWinningCell(rIndex, cIndex) ? 'animate-pulse ring-4 ring-white/50 ring-offset-2 ring-offset-[#08050f]' : ''}
 `}>
 <div className="absolute top-[10%] left-[15%] w-[30%] h-[20%] bg-white/30 rounded-full blur-[2px] transform -rotate-45"></div>
 </div>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {showPopup && winner && (
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
 className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
 >
 <div className="bg-[#110b1c] border border-[#2EC4B6]/30 p-8 rounded-3xl text-center shadow-2xl transform transition-all hover:scale-105">
 <Trophy size={64} className={`mx-auto mb-4 ${winner === 1 ? 'text-[#FF6B6B]' : winner === 2 ? 'text-[#FFD166]' : 'text-gray-400'}`} />
 <h2 className="text-3xl font-bold text-white mb-2 font-['Orbitron'] tracking-widest">
 {winner === 'draw' ? 'DRAW!' : `PLAYER ${winner} WINS`}
 </h2>
 <p className="text-xl font-bold text-[#ffe066] drop-shadow-[0_0_10px_rgba(255,224,102,0.8)] mb-6 animate-pulse">
 +{gameMode === 'ai' ? 20 : 40} EXP
 </p>
 <div className="flex flex-col gap-3">
 <button onClick={resetGame} className="w-full bg-[#2EC4B6]/20 border border-[#2EC4B6] text-[#4ECDC4] py-3 px-8 rounded-xl font-bold tracking-widest hover:bg-[#2EC4B6]/40 transition-all hover:shadow-[0_0_20px_rgba(46,196,182,0.4)]">
 PLAY AGAIN
 </button>
 <button onClick={() => navigate('/dashboard/minigames')} className="w-full bg-white/5 border border-white/10 text-white py-3 px-8 rounded-xl font-bold tracking-widest hover:bg-white/10 transition-all">
 EXIT
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </div>
 );
};

export default ConnectFourGame;