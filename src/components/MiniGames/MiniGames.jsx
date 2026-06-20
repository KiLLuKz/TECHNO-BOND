//src/pages/MiniGames.jsx (หรือ path ที่คุณเก็บไฟล์นี้ไว้)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import แค่ ICON ที่ใช้ในหน้าหลัก (Header/Leaderboard)
import { Gamepad2, Trophy, Filter, Loader2, Users } from 'lucide-react'; 
import { supabase } from '../../supabaseClient'; 
import { gamesData } from '../../data/gamesData'; // Import ข้อมูลเกมจากไฟล์ใหม่
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen p-6 md:p-10 font-['Orbitron'] text-white max-w-[1200px] mx-auto"
    >
      
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

      {/* ----------------- TAB 1: หน้าเลือกเกม (ปรับปรุงใหม่ใช้ .map) ----------------- */}
      <AnimatePresence mode="wait">
      {activeTab === 'games' && (
        <motion.div 
          key="games"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
        >
          <p className="text-gray-400 mb-6 font-['Rajdhani'] text-lg">เลือกเกมที่คุณต้องการเล่น</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* วนลูปสร้าง Card เกมจากข้อมูลในไฟล์ gamesData.js */}
            {gamesData.map((game) => {
              const { IconComponent } = game;
              const isWIP = game.tag === 'WIP'; // เช็คสถานะ WIP

              return (
                <div 
                  key={game.id}
                  // ถ้าเป็น WIP ให้ onClick เป็น undefined (กดไม่ได้) ถ้าไม่ใช่ให้สั่ง navigate
                  onClick={isWIP ? undefined : () => navigate(`/dashboard/minigames/${game.id}`)}
                  // เพิ่ม logic ปรับ opacity และ cursor ให้ผู้เล่นรู้ว่ากดไม่ได้
                  className={`game-card group relative bg-[#08050f]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl transition-all duration-300 overflow-hidden flex flex-col
                    ${isWIP ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} 
                  `}
                  style={{'--hover-border-color': game.colorTheme}}
                >
                  {/* TAG มุมขวาบน */}
                  <div 
                    className={`absolute top-0 right-0 bg-gradient-to-l ${game.tagGradient} text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10`}
                    style={{ color: game.tagTextColor }} 
                  >
                    {game.tag}
                  </div>
                  
                  {/* Thumbnail Icon */}
                  <div className="w-full h-48 bg-[#110b1c] rounded-xl mb-6 border border-white/5 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                    
                    {/* เอฟเฟกต์แสงด้านหลัง */}
                    <div 
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity z-0 blur-3xl"
                      style={{ backgroundColor: game.colorTheme }}
                    ></div>

                    {/* LOGIC เลือกแสดงผล */}
                    {game.image ? (
                      // ถ้ามีรูป ให้โชว์รูป
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover z-10 transition-transform duration-500" 
                      />
                    ) : (
                      // ถ้าไม่มีรูป ให้โชว์ Icon ตามปกติ
                      <IconComponent 
                        size={100} 
                        className="game-thumbnail-icon z-10 transition-colors duration-300"
                        style={{ color: `${game.colorTheme}40` }} 
                      />
                    )}
                  </div>

                  {/* ชื่อเกม */}
                  <h2 
                    className="text-2xl font-bold text-white mb-2 transition-colors tracking-wider group-hover-text-theme"
                    style={{'--hover-text-color': game.colorTheme}}
                  >
                    {game.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">
                    {game.desc}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-4 text-xs text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Trophy size={14} style={{ color: game.colorTheme }}/>
                      {game.players}
                    </span>
                  </div>
                </div>
              );
            })}

          </div>
        </motion.div>
      )}

      {/* ----------------- TAB 2: หน้า LEADERBOARD (คงเดิม) ----------------- */}
      {activeTab === 'leaderboard' && (
        <motion.div 
          key="leaderboard"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
        >
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
                <option value="shoot-em-up" className="bg-[#110b1c]">SHOOT'EM UP</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#99eedd]"><Loader2 className="animate-spin mx-auto" size={40}/></div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-[#08050f]/60 border border-white/5 rounded-2xl shadow-md">
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
        </motion.div>
      )}
      </AnimatePresence>

      {/* ----------------------------------------------------------- */}
      {/* ส่วน STYLE TAG สำหรับจัดการ CSS Hover แบบไดนามิก */}
      {/* ----------------------------------------------------------- */}
      <style>{`
        /* เมื่อ hover ที่ card ให้เปลี่ยนสี border ตาม CSS Variable ที่ส่งมา */
        .game-card:hover {
          border-color: var(--hover-border-color) !important;
          box-shadow: 0 0 20px -5px var(--hover-border-color);
        }
        
        /* เมื่อ hover ที่ card ให้เปลี่ยนสี Icon Thumbnail ให้สว่างขึ้น */
        .game-card:hover .game-thumbnail-icon {
          color: var(--hover-border-color) !important;
        }
        
        /* เมื่อ hover ที่ card ให้เปลี่ยนสีชื่อเกม */
        .game-card:hover .group-hover-text-theme {
          color: var(--hover-border-color) !important;
        }
          
        .tag-text {
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
      `}</style>

    </motion.div>
  );
};

export default MiniGames;