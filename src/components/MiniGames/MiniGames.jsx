import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, Play, Medal, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient'; // ปรับ path ให้ตรงกับที่ตั้งไฟล์คุณ

const MiniGames = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [gameFilter, setGameFilter] = useState('all');
  
  // เก็บข้อมูลจาก Supabase
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

  // กรองข้อมูลจาก State จริง (ไม่ใช่ MOCK_LEADERBOARD แล้ว)
  const filteredLeaderboard = (leaderboard || [])
    .filter(entry => gameFilter === 'all' || entry.game_slug === gameFilter)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen p-6 md:p-10 font-['Orbitron'] text-white animate__animated animate__fadeIn max-w-[1200px] mx-auto">
      {/* ... (ส่วน Header คงเดิม) ... */}
      
      {activeTab === 'leaderboard' && (
        <div className="animate__animated animate__fadeIn">
          {/* ... (ส่วน Filter คงเดิม) ... */}

          {loading ? (
            <div className="text-center py-20 text-[#99eedd]"><Loader2 className="animate-spin mx-auto" size={40}/></div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-[#08050f]/60 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      {/* ใช้ player.username แทน player.name */}
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
                <div className="text-center py-20 text-gray-500">ไม่มีข้อมูลคะแนน</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniGames;
