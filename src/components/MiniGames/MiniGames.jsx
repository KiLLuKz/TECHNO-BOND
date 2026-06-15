import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, Star, Play, Medal, Filter } from 'lucide-react';

// ข้อมูลจำลอง (Mock Data) สำหรับ Leaderboard
const MOCK_LEADERBOARD = [
  { id: 1, name: "Junior_042", score: 25400, game: "block-blast", gameName: "Block Blast" },
  { id: 2, name: "NewbieHacker", score: 18200, game: "block-blast", gameName: "Block Blast" },
  { id: 3, name: "CodeNinja", score: 15600, game: "cyber-runner", gameName: "Cyber Runner" },
  { id: 4, name: "Freshy_99", score: 12000, game: "block-blast", gameName: "Block Blast" },
  { id: 5, name: "MysterySeeker", score: 9800, game: "memory-hack", gameName: "Memory Hack" },
];

const MiniGames = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    const fetchScores = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10); // เอาแค่ Top 10
      if (data) setLeaderboard(data);
    };
    fetchScores();
  }, []);
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games'); // 'games' หรือ 'leaderboard'
  const [gameFilter, setGameFilter] = useState('all'); // 'all', 'block-blast', etc.

  // กรองข้อมูลตามเกมที่เลือกเรียงตามคะแนน
  const filteredLeaderboard = MOCK_LEADERBOARD
    .filter(entry => gameFilter === 'all' || entry.game === gameFilter)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen p-6 md:p-10 font-['Orbitron'] text-white animate__animated animate__fadeIn max-w-[1200px] mx-auto">
      
      {/* Header & Tabs */}
      <div className="mb-10 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl text-[#99eedd] font-bold tracking-widest flex items-center gap-3 mb-6">
          <Gamepad2 size={36} className="text-[#d966ff]" /> MINI GAMES HUB
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('games')}
            className={`pb-4 text-lg font-bold transition-all border-b-2 ${
              activeTab === 'games' 
                ? 'border-[#99eedd] text-[#99eedd]' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            🕹️ GAMES
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-4 text-lg font-bold transition-all border-b-2 ${
              activeTab === 'leaderboard' 
                ? 'border-[#d966ff] text-[#d966ff]' 
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            🏆 LEADERBOARD
          </button>
        </div>
      </div>

      {/* ----------------- TAB: GAMES ----------------- */}
      {activeTab === 'games' && (
        <div className="animate__animated animate__fadeIn">
          <p className="text-gray-400 mb-6 font-['Rajdhani'] text-lg">เลือกเกมที่คุณต้องการเล่นเพื่อสะสมคะแนน</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* 1. Block Blast Card */}
            <div 
              onClick={() => navigate('/dashboard/minigames/block-blast')}
              className="group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl hover:border-[#99eedd]/50 hover:shadow-[0_0_30px_rgba(153,238,221,0.15)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#d966ff] to-[#99eedd] text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">HOT GAME</div>
              <div className="w-full h-48 bg-[#110b1c] rounded-xl mb-6 border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#08050f] to-transparent opacity-50 z-0"></div>
                <Play size={48} className="text-[#99eedd]/20 group-hover:text-[#99eedd] transition-colors z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#99eedd] transition-colors tracking-wider">BLOCK BLAST</h2>
              <p className="text-sm text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">เกมต่อบล็อกสุดคลาสสิก ลากบล็อกลงตารางเพื่อเคลียร์แถว ทำคอมโบเพื่อรับคะแนนทวีคูณ!</p>
              <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5"><Trophy size={14} className="text-[#FFD166]"/> Score System</span>
              </div>
            </div>

            {/* 2. Coming Soon Card */}
            <div className="bg-[#08050f]/30 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-xl opacity-50 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Gamepad2 size={32} className="text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-500 mb-2 tracking-widest">COMING SOON</h2>
              <p className="text-sm text-gray-600 font-['Rajdhani'] text-center">มินิเกมใหม่กำลังอยู่ระหว่างการพัฒนา</p>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- TAB: LEADERBOARD ----------------- */}
      {activeTab === 'leaderboard' && (
        <div className="animate__animated animate__fadeIn">
          
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <p className="text-gray-400 font-['Rajdhani'] text-lg">หอเกียรติยศยอดฝีมือ (TOP PLAYERS)</p>
            
            <div className="flex items-center gap-2 bg-[#08050f]/60 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <Filter size={18} className="text-gray-400 ml-2" />
              <select 
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="bg-transparent text-white border-none outline-none font-['Orbitron'] text-sm p-2 cursor-pointer"
              >
                <option value="all" className="bg-[#110b1c]">ALL GAMES</option>
                <option value="block-blast" className="bg-[#110b1c]">BLOCK BLAST</option>
                <option value="cyber-runner" className="bg-[#110b1c]">CYBER RUNNER</option>
                <option value="memory-hack" className="bg-[#110b1c]">MEMORY HACK</option>
              </select>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="flex flex-col gap-3">
            {filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((player, index) => (
                <div 
                  key={player.id} 
                  className="flex items-center justify-between p-4 md:p-6 bg-[#08050f]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Rank Badge */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg
                      ${index === 0 ? 'bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50 shadow-[0_0_15px_rgba(255,209,102,0.3)]' : 
                        index === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50' : 
                        index === 2 ? 'bg-[#cd7f32]/20 text-[#cd7f32] border border-[#cd7f32]/50' : 
                        'bg-white/5 text-gray-500'}`}
                    >
                      {index < 3 ? <Medal size={20} /> : index + 1}
                    </div>
                    
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white tracking-wider">{player.name}</h3>
                      <p className="text-xs text-gray-500 font-['Rajdhani'] mt-1 tracking-widest uppercase">{player.gameName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl md:text-3xl font-bold text-[#99eedd] tracking-widest">{player.score.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-2">PTS</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-500 border border-white/5 border-dashed rounded-2xl">
                ไม่มีข้อมูลคะแนนสำหรับเกมนี้
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default MiniGames;