import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SystemAlert from '../../SystemAlert'
export default function TicTacToe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State สำหรับเปิด/ปิด Alert

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  // ตรวจจับเมื่อมีผู้ชนะหรือเสมอ
  useEffect(() => {
    if (winner || isDraw) {
      setIsAlertOpen(true);
    }
  }, [winner, isDraw]);

  const handleClick = (i) => {
    if (board[i] || winner) return;
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

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 font-['Orbitron'] text-white">
      
      {/* --- ส่วนของเกม (เหมือนเดิม) --- */}
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="w-full flex items-center justify-between mb-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <button onClick={() => navigate('/dashboard/minigames')} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4ECDC4] to-[#99eedd] bg-clip-text text-transparent">
            TIC TAC TOE
          </h1>
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
        type={winner ? "success" : "info"}
        title={winner ? "VICTORY!" : "DRAW!"}
        message={winner ? `Player ${winner} has won the match!` : "The game ended in a draw."}
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