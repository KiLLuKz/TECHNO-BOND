import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'animate.css';

import Welcome from './components/Welcome';
import Footer from './components/Footer';
import Verify from './components/Verify';
import Background from './components/Background';
import IdentityQuiz from './components/IdentityQuiz';
import FloatingMenu from './components/FloatingMenu';
import J_Dashboard from './components/J_Dashboard';
import S_Dashboard from './components/S_Dashboard';
import { supabase } from './supabaseClient';

import DashboardLayout from './components/DashboardLayout';
import MiniGames from './components/MiniGames/MiniGames';
import BlockBlastGame from './components/MiniGames/BlockBlast/BlockBlastGame';
import AdminDashboard from './components/AdminDashboard';
import Loader from './components/Loader';

function AppRoutes({ setUserRole, setIsAdmin, userRole, isAdmin }) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/verify" element={
        <Verify 
          onLoginSuccess={(role) => {
            setUserRole(role);
            navigate(role === 'junior' ? '/quiz' : '/dashboard');
          }} 
        />
      } />
      <Route path="/quiz" element={<IdentityQuiz />} />
      
      {/* ส่วน Dashboard และหน้าย่อย (Nested Routes) */}
      <Route path="/dashboard" element={
        userRole ? <DashboardLayout /> : <div className="text-center mt-20 text-2xl font-['Orbitron']">ACCESS DENIED</div>
      }>
        <Route index element={userRole === 'junior' ? <J_Dashboard /> : <S_Dashboard />} />
        
        {/* หน้า Arcade รวมเกม */}
        <Route path="minigames" element={<MiniGames />} />
        
        {/* เพิ่มบรรทัดนี้ครับ! เพื่อให้เข้าเกม Block Blast ได้ */}
        <Route path="minigames/block-blast" element={<BlockBlastGame />} />
        
        <Route path="admin" element={isAdmin ? <AdminDashboard /> : <div className="p-10 text-center text-white">ACCESS DENIED</div>} />
      </Route>
      
    </Routes>
  );
}

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูล Profile และ Role
  const fetchUserData = async (user) => {
    if (!user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

    try {
      // 1. เช็ค Role น้อง (Junior/Senior)
      const { data: seniorData } = await supabase
        .from('junior_clues')
        .select('senior_email')
        .eq('senior_email', user.email)
        .maybeSingle();
      
      setUserRole(seniorData ? 'senior' : 'junior');

      // 2. เช็ค Admin (ดึงจากตาราง profiles)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    // 1. เช็คสถานะปัจจุบันตอนเปิดหน้าเว็บ
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchUserData(session.user);
      setIsAuthLoading(false);
    };
    checkInitialSession();

    // 2. ตั้ง Listener คอยฟังเหตุการณ์ LOGIN / LOGOUT
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setIsAdmin(false);
      }
    });

    // Cleanup subscription เมื่อ component ถูกทำลาย
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/verify'; // บังคับโหลดใหม่ชัวร์ที่สุด
  };

  if (isAuthLoading) return <Loader text="LOADING" />;

  return (
    <Router>
      <div className="relative min-h-screen text-white flex flex-col">
        <Background />
        <FloatingMenu userRole={userRole} isAdmin={isAdmin} onLogout={handleLogout} /> 
        <main className="flex-grow flex flex-col">
          <AppRoutes 
            setUserRole={setUserRole} 
            setIsAdmin={setIsAdmin} 
            userRole={userRole} 
            isAdmin={isAdmin} 
          />
        </main>
        <Footer />
      </div>
    </Router>
  );
}