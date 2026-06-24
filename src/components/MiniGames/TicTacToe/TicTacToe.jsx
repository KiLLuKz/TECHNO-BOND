import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bot, User, Users } from 'lucide-react';
import SystemAlert from '../../SystemAlert'
export default function TicTacToe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false); 
  const [gameMode, setGameMode] = useState('pvp');
  const [screen, setScreen] = useState('menu');

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  useEffect(() => {
    if (winner || isDraw) {
      setIsAlertOpen(true);
    }
  }, [winner, isDraw]);

  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...board]);
        if (aiMove !== -1) {
          const nextBoard = board.slice();
          nextBoard[aiMove] = 'O';
          setBoard(nextBoard);
          setIsXNext(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, winner, isDraw, board]);

  const getAIMove = (currentBoard) => {
    const availableSpots = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (availableSpots.length === 0) return -1;
    
    // 30% chance to make a random move so it's beatable
    if (Math.random() < 0.3) {
      return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }

    const minimax = (tempBoard, depth, isMaximizing) => {
      const w = calculateWinner(tempBoard);
      if (w === 'O') return 10 - depth;
      if (w === 'X') return depth - 10;
      if (tempBoard.every(cell => cell !== null)) return 0;

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < tempBoard.length; i++) {
          if (!tempBoard[i]) {
            tempBoard[i] = 'O';
            let score = minimax(tempBoard, depth + 1, false);
            tempBoard[i] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < tempBoard.length; i++) {
          if (!tempBoard[i]) {
            tempBoard[i] = 'X';
            let score = minimax(tempBoard, depth + 1, true);
            tempBoard[i] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    };

    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < currentBoard.length; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        let score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = (i) => {
    // If playing against AI, block clicks when it's O's turn
    if (board[i] || winner || (gameMode === 'ai' && !isXNext)) return;
    const nextBoard = board.slice();
    nextBoard[i] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setIsAlertOpen(false);
  };

  if (screen === 'menu') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 font-['Orbitron'] text-white">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4ECDC4] mb-12 drop-shadow-[0_0_15px_rgba(78,205,196,0.5)]">
          TIC TAC TOE
        </h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button 
            onClick={() => { setGameMode('ai'); setScreen('game'); handleReset(); }}
            className="flex items-center justify-center gap-3 p-4 bg-[#d966ff]/10 hover:bg-[#d966ff]/20 border border-[#d966ff]/50 rounded-2xl transition-all group"
          >
            <Bot size={28} className="text-[#d966ff] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-widest text-[#d966ff]">VS AI</span>
          </button>
          <button 
            onClick={() => { setGameMode('pvp'); setScreen('game'); handleReset(); }}
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 font-['Orbitron'] text-white">
      
      {/* --- ส่วนของเกม --- */}
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="w-full flex items-center justify-between mb-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <button onClick={() => setScreen('menu')} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
             <h1 className="text-2xl font-bold text-[#4ECDC4]">TIC TAC TOE</h1>
             <span className="text-xs text-gray-400 font-bold tracking-widest flex items-center gap-1">
                {gameMode === 'ai' ? <><Bot size={12}/> VS AI</> : <><Users size={12}/> VS PLAYER</>}
             </span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mb-8">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {board.map((value, i) => (
              <button 
                key={i} 
                onClick={() => handleClick(i)}
                className={`w-20 h-20 md:w-28 md:h-28 text-3xl md:text-5xl font-bold rounded-2xl transition-all duration-300 
                  flex items-center justify-center border border-white/5 
                  ${!value ? 'bg-white/5 hover:bg-white/10' : 'bg-white/10'}
                  ${value === 'X' ? 'text-[#4ECDC4]' : 'text-[#d966ff]'}
                  active:scale-95`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleReset} 
          className="px-8 py-3 bg-[#4ECDC4]/20 border border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-black font-bold rounded-xl flex items-center gap-2 mx-auto transition-all"
        >
          <RefreshCw size={18} /> RESET GAME
        </button>
      </div>

      {/* --- ใส่ SystemAlert ตรงนี้ --- */}
      <SystemAlert 
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleReset}
        type={winner ? (gameMode === 'ai' && winner === 'O' ? "error" : "success") : "info"}
        title={winner ? (gameMode === 'ai' && winner === 'O' ? "DEFEATED!" : "VICTORY!") : "DRAW!"}
        message={winner ? (gameMode === 'ai' && winner === 'O' ? "The Bot has won the match!" : `Player ${winner} has won the match!`) : "The game ended in a draw."}
        confirmText="PLAY AGAIN"
        cancelText="CLOSE"
      />
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
  }
  return null;
}