//src/pages/MiniGames.jsx (หรือ path ที่คุณเก็บไฟล์นี้ไว้)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import แค่ ICON ที่ใช้ในหน้าหลัก (Header/Leaderboard)
import { Gamepad2, Trophy, Filter, Loader2, Users, Crown, User } from 'lucide-react'; 
import { supabase } from '../../supabaseClient'; 
import { gamesData } from '../../data/gamesData'; // Import ข้อมูลเกมจากไฟล์ใหม่
import { motion, AnimatePresence } from 'framer-motion';
import HoloIDModal from '../common/HoloIDModal';

const MiniGames = () => {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('games');
 const [gameFilter, setGameFilter] = useState('all');

 const [leaderboard, setLeaderboard] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedProfile, setSelectedProfile] = useState(null);

 const formatScore = (score) => {
   if (score >= 1000000) {
     return (score / 1000000).toFixed(2) + ' M';
   }
   return score.toLocaleString();
 };

 useEffect(() => {
 const fetchScores = async () => {
 setLoading(true);
 try {
 const { data, error } = await supabase
 .from('leaderboard')
 .select('*')
 .order('score', { ascending: false });

 if (error) throw error;

 if (data && data.length > 0) {
 // Use username (which acts as student_id in leaderboard) to match with profiles.student_id
 const usernames = [...new Set(data.map(d => d.username))].filter(Boolean);
 const { data: profilesData, error: profilesError } = await supabase
 .from('profiles')
 .select('id, username, avatar_url, banner_url, student_id, role')
 .in('student_id', usernames);

 if (!profilesError && profilesData) {
   const userIds = profilesData.map(p => p.id).filter(Boolean);
   let activityMap = {};
   
   if (userIds.length > 0) {
     const { data: activityData } = await supabase
       .from('user_activity_states')
       .select('user_id, exp')
       .in('user_id', userIds);
       
     if (activityData) {
       activityData.forEach(a => {
         activityMap[a.user_id] = a.exp;
       });
     }
   }

   const profileMap = {};
   // Map by student_id to match with leaderboard's username
   profilesData.forEach(p => { 
     if (p.student_id) {
       profileMap[p.student_id.toLowerCase()] = {
         ...p,
         exp: activityMap[p.id] || 0
       };
     }
   });
 
   data.forEach(d => {
     if (d.username) {
       d.profiles = profileMap[d.username.toLowerCase()] || null;
     }
   });
 }
 }

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


 const handleAvatarClick = (profile, username) => {
  if (!profile) {
    setSelectedProfile({
      username: username,
      avatar_url: null,
      banner_url: null,
      student_id: username,
      exp: 0,
      role: 'PLAYER'
    });
    return;
  }
  setSelectedProfile({
    username: profile.username || username,
    avatar_url: profile.avatar_url,
    banner_url: profile.banner_url,
    student_id: profile.student_id || username,
    exp: profile.exp || 0,
    role: profile.role || 'PLAYER'
  });
 };

 return (

 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
 className="min-h-screen p-6 md:p-10 text-white max-w-[1200px] mx-auto"
 >
 
 {/* ----------------- ส่วน Header และ ปุ่มเปลี่ยน Tab ----------------- */}
 <div className="mb-10 border-b border-white/10">
 <h1 className="font-['Orbitron'] text-3xl md:text-4xl text-[#99eedd] font-bold tracking-widest flex items-center gap-3 mb-6">
 <Gamepad2 size={36} className="text-[#d966ff]" /> MINI GAMES HUB
 </h1>
 <div className="flex gap-8">
 <button 
 onClick={() => setActiveTab('games')}
 className={`pb-4 text-lg font-bold transition-all border-b-2 ${
 activeTab === 'games' ? 'border-[#99eedd] text-[#99eedd]' : 'border-transparent text-gray-500 hover:text-gray-300'
 }`}
 >
 <Gamepad2 size={20} className="inline mr-2 -mt-1" /> GAMES
 </button>
 <button 
 onClick={() => setActiveTab('leaderboard')}
 className={`pb-4 text-lg font-bold transition-all border-b-2 ${
 activeTab === 'leaderboard' ? 'border-[#d966ff] text-[#d966ff]' : 'border-transparent text-gray-500 hover:text-gray-300'
 }`}
 >
 <Trophy size={20} className="inline mr-2 -mt-1" /> LEADERBOARD
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
 className={`absolute top-0 right-0 bg-gradient-to-l ${game.tagGradient} text-xs md:text-sm md:text-base font-bold px-4 py-1.5 rounded-bl-xl z-10`}
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
 <p className="text-sm md:text-base text-gray-400 font-['Rajdhani'] line-clamp-2 mb-6 flex-grow">
 {game.desc}
 </p>
 
 <div className="mt-auto flex items-center gap-4 text-xs md:text-sm md:text-base text-gray-500 font-bold bg-white/5 p-3 rounded-lg border border-white/5">
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
 <p className="text-gray-400 font-['Orbitron'] text-lg">หอเกียรติยศยอดฝีมือ (TOP PLAYERS)</p>
 <div className="flex items-center gap-2 bg-[#08050f]/60 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
 <Filter size={18} className="text-gray-400 ml-2" />
 <select 
 value={gameFilter}
 onChange={(e) => setGameFilter(e.target.value)}
 className="bg-transparent text-white border-none outline-none text-sm md:text-base p-2 cursor-pointer"
 >
 <option value="all" className="bg-[#110b1c]">ALL GAMES</option>
 <option value="block-blast" className="bg-[#110b1c]">BLOCK BLAST</option>
 <option value="shoot-em-up" className="bg-[#110b1c]">SHOOT'EM UP</option>
 <option value="flappy_drone" className="bg-[#110b1c]">FLAPPY DRONE</option>
 </select>
 </div>
 </div>

 {loading ? (
 <div className="text-center py-20 text-[#99eedd]"><Loader2 className="animate-spin mx-auto" size={40}/></div>
 ) : (
 <div className="flex flex-col gap-3">
 {filteredLeaderboard.length > 0 ? (
 filteredLeaderboard.map((player, index) => {
 const profile = player.profiles || {};
 const displayName = profile.username || player.username; 
 const avatarUrl = profile.avatar_url;
 
 let rankColor = "text-gray-500";
 let rankSize = "text-xl md:text-2xl";
 let isTop3 = false;
 if (index === 0) { rankColor = "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"; rankSize = "text-3xl md:text-4xl"; isTop3 = true; }
 else if (index === 1) { rankColor = "text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.8)]"; rankSize = "text-3xl md:text-4xl"; isTop3 = true; }
 else if (index === 2) { rankColor = "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]"; rankSize = "text-3xl md:text-4xl"; isTop3 = true; }

 return (
 <div key={player.id} onClick={() => handleAvatarClick(player.profiles, player.username)} className="flex items-center justify-between p-3 md:p-4 bg-[#08050f]/60 border border-white/5 rounded-2xl shadow-md hover:bg-white/10 transition-colors cursor-pointer">
 <div className="flex items-center gap-2 md:gap-5">
 
 <div className={`w-16 md:w-24 grid grid-cols-2 items-center font-bold font-['Orbitron'] ${rankSize}`}>
 <div className="flex justify-end pr-1 md:pr-2">
 {isTop3 && <Crown size={20} className={`-mt-1 md:size-6 md:-mt-2 ${rankColor}`} />}
 </div>
 <div className={`text-left ${rankColor}`}>{index + 1}</div>
 </div>
 
 <div className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/20 flex items-center justify-center">
 {avatarUrl ? (
 <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
 ) : (
 <User size={20} className="text-gray-400 md:size-6" />
 )}
 </div>

 <div>
 <h3 className="font-['Orbitron'] font-bold flex items-baseline gap-1 md:gap-2 text-xs md:text-base">
 {displayName}
 <span className="text-[9px] md:text-xs text-gray-500 font-['Rajdhani'] tracking-wider lowercase hidden sm:inline">@{player.username}</span>
 </h3>
 <div className="flex items-center gap-1 md:gap-2 mt-0.5">
 {(() => {
   const displayRole = (profile?.role || 'PLAYER').toUpperCase();
   if (displayRole === 'ADMIN') return <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">ADMIN</span>;
   if (displayRole === 'SENIOR') return <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded bg-[#d966ff]/20 text-[#d966ff] border border-[#d966ff]/30">SENIOR</span>;
   if (displayRole === 'JUNIOR') return <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded bg-[#99eedd]/20 text-[#99eedd] border border-[#99eedd]/30">JUNIOR</span>;
   return null;
 })()}
 {(profile?.student_id === '99999' || profile?.student_id === '99998') && (
   <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold tracking-wider">TEST-ID</span>
 )}
 <p className="text-[9px] md:text-xs text-gray-500 uppercase ml-1">{player.game_slug.replace(/-/g, ' ')}</p>
 </div>
 </div>
 </div>
 <span className="text-sm md:text-xl font-bold text-[#99eedd] pl-2 whitespace-nowrap">{formatScore(player.score)}</span>
 </div>
 );
 })
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

  <HoloIDModal 
    isOpen={!!selectedProfile} 
    onClose={() => setSelectedProfile(null)}
    profile={selectedProfile}
    exp={selectedProfile?.exp || 0}
    role={selectedProfile?.role || 'PLAYER'}
  />
  </motion.div>
 );
};

export default MiniGames;