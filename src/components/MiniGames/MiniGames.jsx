import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, Play, Filter, Loader2, Users, Crown, Hash } from 'lucide-react';
import { supabase } from '../../supabaseClient'; 

const MiniGames = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [gameFilter, setGameFilter] = useState('all');

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('score', { ascending: false });

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (err) {
        console.error("Error loading scores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const filteredLeaderboard = (leaderboard || [])
    .filter(entry => gameFilter === 'all' || entry.game_slug === gameFilter)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen p-6 md:p-10 font-['Orbitron'] text-white animate__animated animate__fadeIn max-w-[1200px] mx-auto">
      
      {/* ----------------- ส่วน Header และ ปุ่มเปลี่ยน Tab ----------------- */}
      <div className="mb-10 border-b border-white/10">
        <h1 className="text-3xl md:text-4xl text-[#99eedd] font-bold tracking-widest flex items-center gap-3 mb-6">
          <Gamepad2 size={36} className="text-[#d966ff]" /> MINI GAMES HUB
        </h1>
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('games')}
            className={`pb-4 text-lg font-bold transition-all border-b-2 ${
              activeTab === 'games' ? 'border-[#99eedd] text-[#99eedd]' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            🕹️ GAMES
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-4 text-lg font-bold transition-all border-b-2 ${
              activeTab === 'leaderboard' ? 'border-[#d966ff] text-[#d966ff]' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            🏆 LEADERBOARD
          </button>
        </div>
      </div>

      {/* ----------------- TAB 1: หน้าเลือกเกม ----------------- */}
      {activeTab === 'games' && (
        <div className="animate__animated animate__fadeIn">
          <p className="text-gray-400 mb-6 font-['Rajdhani'] text-lg">เลือกเกมที่คุณต้องการเล่นเพื่อสะสมคะแนน</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* GAME 1: BLOCK BLAST */}
            <div 
              onClick={() => navigate('/dashboard/minigames/block-blast')}
              className="group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl hover:border-[#99eedd]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
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

            {/* GAME 2: CONNECT FOUR */}
            <div 
              onClick={() => navigate('/dashboard/minigames/connect-four')}
              className="group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl hover:border-[#4ECDC4]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#4ECDC4] to-[#2EC4B6] text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">HOT PvP</div>
              <div className="w-full h-48 bg-[#110b1c] rounded-xl mb-6 border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#08050f] to-transparent opacity-50 z-0"></div>
                <Play size={48} className="text-[#4ECDC4]/20 group-hover:text-[#4ECDC4] transition-colors z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#4ECDC4] transition-colors tracking-wider">CONNECT FOUR</h2>
              <p className="text-sm text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">เกมหยอดเหรียญ 4 แถว ประลองปัญญาเรียงเหรียญสีเดียวกันให้ครบ 4 ช่องก่อนใคร!</p>
              <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-[#4ECDC4]"/> 2 Players / PvP</span>
              </div>
            </div>
            {/* GAME 3: TIC TAC TOE */}
            <div 
              onClick={() => navigate('/dashboard/minigames/tic-tac-toe')}
              className="group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl hover:border-[#779556]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#ebecd0] to-[#779556] text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">New games</div>
              <div className="w-full h-48 bg-[#110b1c] rounded-xl mb-6 border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#08050f] to-transparent opacity-50 z-0"></div>
                <Crown size={48} className="text-[#779556]/20 group-hover:text-[#779556] transition-colors z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#779556] transition-colors tracking-wider">TIC TAC TOE</h2>
              <p className="text-sm text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">เกมสุถคลาสิก X/O</p>
              <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-[#779556]"/> 2 Players </span>
              </div>
            </div>
            {/* GAME 4: THAI CHECKERS */}
            <div 
              // onClick={() => navigate('/dashboard/minigames/thai-checkers')}
              className="group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl hover:border-[#779556]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#EF4444] to-[#B91C1C] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">WIP</div>
              <div className="w-full h-48 bg-[#110b1c] rounded-xl mb-6 border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#08050f] to-transparent opacity-50 z-0"></div>
                <Crown size={48} className="text-[#779556]/20 group-hover:text-[#779556] transition-colors z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#779556] transition-colors tracking-wider">THAI CHECKERS</h2>
              <p className="text-sm text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">กำลังพัฒนา...</p>
              <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-[#779556]"/> 2 Players </span>
              </div>
            </div>
            {/* GAME 5: CLASSIC CHESS */}
            <div 
              // onClick={() => navigate('/dashboard/minigames/chess')}
              className="group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl hover:border-[#779556]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#EF4444] to-[#B91C1C] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">WIP</div>
              <div className="w-full h-48 bg-[#110b1c] rounded-xl mb-6 border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#08050f] to-transparent opacity-50 z-0"></div>
                <Crown size={48} className="text-[#779556]/20 group-hover:text-[#779556] transition-colors z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#779556] transition-colors tracking-wider">CLASSIC CHESS</h2>
              <p className="text-sm text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">กำลังพัฒนา...</p>
              <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-[#779556]"/> 2 Players / PvP</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- TAB 2: หน้า LEADERBOARD ----------------- */}
      {activeTab === 'leaderboard' && (
        <div className="animate__animated animate__fadeIn">
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
                {/* ถอดตัวเลือกเกมอื่นๆ ออก ปล่อยให้มีแค่เกมแนว Score System */}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#99eedd]"><Loader2 className="animate-spin mx-auto" size={40}/></div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-[#08050f]/60 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 font-bold">{index + 1}</div>
                      <div>
                        <h3 className="font-bold">{player.username}</h3>
                        <p className="text-xs text-gray-500 uppercase">{player.game_slug}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-[#99eedd]">{player.score.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500 border border-white/5 border-dashed rounded-2xl">ไม่มีข้อมูลคะแนน</div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MiniGames;