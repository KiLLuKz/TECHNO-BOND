import React, { useState } from 'react';
import { User, Target, Users, Gamepad2, Home, LogOut, ChevronLeft, ChevronRight, Menu, NotebookTabs, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const JuniorSidebar = ({ activeTab, isAdmin }) => {
 const [isExpanded, setIsExpanded] = useState(true);
 const navigate = useNavigate();

 const handleLogout = async () => {
 await supabase.auth.signOut();
 window.location.href = '/verify';
 };

 const navItems = [
 { id: 'profile', label: 'PROFILE', icon: User },
 { id: 'activity', label: 'ACTIVITY', icon: BookOpen },
 { id: 'missions', label: 'MISSIONS', icon: Target },
 { id: 'directory', label: 'DIRECTORY', icon: Users },
 { id: 'changelog', label: 'UPDATE LOGS', icon: NotebookTabs },
 ];

 return (
 <>
 {/* Mobile Overlay */}
 <div className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsExpanded(false)}></div>

 <div className={`flex flex-col bg-[#08050f]/95 backdrop-blur-xl border-r border-[#99eedd]/20 h-[100dvh] fixed md:sticky top-0 left-0 z-50 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-0 md:w-20 overflow-hidden md:overflow-visible'} `}>
 
 {/* Toggle Button */}
 <div className={`h-[80px] flex items-center px-4 border-b border-[#99eedd]/20 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
 {isExpanded && <span className="font-bold text-[#99eedd] tracking-widest text-sm whitespace-nowrap">JUNIOR.OS</span>}
 <button 
 onClick={() => setIsExpanded(!isExpanded)} 
 className="p-2 bg-[#99eedd]/10 hover:bg-[#99eedd]/20 text-[#99eedd] rounded-lg transition-all"
 >
 {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
 </button>
 </div>

 {/* Navigation Tabs */}
 <div className={`flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-2 ${isExpanded ? 'px-3' : 'px-2'}`}>
 <div className={`text-[10px] text-gray-500 tracking-[0.2em] mb-2 px-2 uppercase ${!isExpanded && 'text-center'}`}>
 {isExpanded ? 'Dashboard' : '---'}
 </div>
 {navItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <Link
 key={item.id}
 to={`/dashboard/${item.id}`}
 onClick={() => { if (window.innerWidth < 768) setIsExpanded(false); }}
 className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all tracking-widest text-sm whitespace-nowrap
 ${isActive ? 'bg-[#99eedd]/20 text-[#99eedd] shadow-[0_0_10px_rgba(153,238,221,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
 ${!isExpanded && 'justify-center'}
 `}
 title={!isExpanded ? item.label : ''}
 >
 <Icon size={20} className={isActive ?"text-[#99eedd] shrink-0" :"text-gray-500 shrink-0"} />
 {isExpanded && <span>{item.label}</span>}
 </Link>
 );
 })}

 <div className={`text-[10px] text-gray-500 tracking-[0.2em] mb-2 px-2 uppercase mt-6 ${!isExpanded && 'text-center'}`}>
 {isExpanded ? 'Global' : '---'}
 </div>
 
 <Link to="/" className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all tracking-widest text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap ${!isExpanded && 'justify-center'}`} title="HOME">
 <Home size={20} className="text-gray-500 shrink-0" />
 {isExpanded && <span>HOME</span>}
 </Link>

 <Link to="/dashboard/minigames" className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all tracking-widest text-sm text-gray-400 hover:bg-white/5 hover:text-white whitespace-nowrap ${!isExpanded && 'justify-center'}`} title="MINI GAMES">
 <Gamepad2 size={20} className="text-[#99eedd] shrink-0" />
 {isExpanded && <span>MINI GAMES</span>}
 </Link>

 </div>

 {/* Footer Actions */}
 <div className={`p-4 border-t border-[#99eedd]/20 ${!isExpanded && 'px-2'}`}>
 <button 
 onClick={handleLogout}
 className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all tracking-widest text-sm text-[#ff7ec8] hover:bg-[#ff7ec8]/20 whitespace-nowrap ${!isExpanded && 'justify-center'}`}
 title="LOGOUT"
 >
 <LogOut size={20} className="shrink-0" />
 {isExpanded && <span>LOGOUT</span>}
 </button>
 </div>

 </div>

 {/* Floating Toggle Button for Mobile when collapsed */}
 {!isExpanded && (
 <button 
 onClick={() => setIsExpanded(true)}
 className="md:hidden fixed top-8 left-4 z-50 p-3 bg-[#08050f]/80 backdrop-blur-md border border-[#99eedd]/30 rounded-lg text-[#99eedd] shadow-[0_0_15px_rgba(153,238,221,0.2)]"
 >
 <Menu size={24} />
 </button>
 )}
 </>
 );
};

export default JuniorSidebar;
