import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROWS = 6;
const COLS = 7;

const ConnectFourGame = () => {
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1); 
  const [winner, setWinner] = useState(null); 
  const [winningCells, setWinningCells] = useState([]);

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

  const handleDrop = (col) => {
    if (winner) return; 

    const row = getLowestEmptyRow(board, col);
    if (row === -1) return; 

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const winCells = checkWin(newBoard, row, col, currentPlayer);
    
    if (winCells) {
      setWinner(currentPlayer);
      setWinningCells(winCells);
    } else if (newBoard.flat().every(cell => cell !== null)) {
      setWinner('draw'); 
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
  };

  const isWinningCell = (r, c) => winningCells.some(cell => cell.r === r && cell.c === c);

  return (
    <div className="min-h-screen  text-white font-['Orbitron'] flex flex-col items-center pt-8 md:pt-12 px-4 relative overflow-hidden isolate">
      
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
        <button onClick={() => navigate('/dashboard/minigames')} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#4ECDC4] to-[#2EC4B6] drop-shadow-lg">
            CONNECT-4
          </h1>
          {!winner ? (
            <div className="flex items-center gap-3 mt-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <div className={`w-4 h-4 rounded-full shadow-lg ${currentPlayer === 1 ? 'bg-[#FF6B6B] shadow-[#FF6B6B]/50' : 'bg-[#FFD166] shadow-[#FFD166]/50'} transition-colors duration-300`}></div>
              <span className="text-sm tracking-widest font-bold">PLAYER {currentPlayer} TURN</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-4 bg-[#FFD166]/20 px-6 py-2 rounded-full border border-[#FFD166]/30 backdrop-blur-md text-[#FFD166] animate-pulse">
              <Trophy size={18} />
              <span className="text-sm tracking-widest font-bold">
                {winner === 'draw' ? "IT'S A DRAW!" : `PLAYER ${winner} WINS!`}
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

      {winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn">
          <div className="bg-[#110b1c] border border-[#2EC4B6]/30 p-8 rounded-3xl text-center shadow-2xl transform transition-all hover:scale-105">
            <Trophy size={64} className={`mx-auto mb-4 ${winner === 1 ? 'text-[#FF6B6B]' : winner === 2 ? 'text-[#FFD166]' : 'text-gray-400'}`} />
            <h2 className="text-3xl font-bold text-white mb-6 font-['Orbitron'] tracking-widest">
              {winner === 'draw' ? 'DRAW!' : `PLAYER ${winner} WINS`}
            </h2>
            <button onClick={resetGame} className="w-full bg-[#2EC4B6]/20 border border-[#2EC4B6] text-[#4ECDC4] py-3 px-8 rounded-xl font-bold tracking-widest hover:bg-[#2EC4B6]/40 transition-all hover:shadow-[0_0_20px_rgba(46,196,182,0.4)]">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectFourGame;