import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

const ConditionalFooter = () => {
  const location = useLocation();
  const hideFooter = location.pathname.includes('minigames');

  if (hideFooter) return null;
  return <Footer />;
};

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
        {/* ตรงนี้สำคัญ! ถ้าเป็น junior จะเห็น J_Dashboard, แต่ถ้าเป็น senior หรือ admin จะเห็น S_Dashboard แทน */}
        <Route index element={userRole === 'junior' ? <J_Dashboard /> : <S_Dashboard />} />
        
        <Route path="minigames" element={<MiniGames />} />
        <Route path="minigames/block-blast" element={<BlockBlastGame />} />
        
        {/* หน้า Admin จะเข้าได้ต้องเป็น isAdmin เท่านั้น */}
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
      const studentId = user.email.split('@')[0];

      // 1. เช็คก่อนว่าคนนี้มี Role เป็น Admin ใน profiles หรือไม่
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profile?.role === 'admin') {
        setUserRole('admin');
        setIsAdmin(true);
      } else {
        // 2. ถ้าไม่ใช่ Admin ค่อยไปเช็คว่าเป็นพี่รหัสหรือน้องรหัส
        const { data: seniorData } = await supabase
          .from('pairing_data') // เปลี่ยนเป็นตารางใหม่
          .select('senior_student_id')
          .eq('senior_student_id', studentId)
          .maybeSingle();
        
        setUserRole(seniorData ? 'senior' : 'junior');
        setIsAdmin(false);
      }

    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchUserData(session.user);
      setIsAuthLoading(false);
    };
    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserData(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/verify'; 
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
        <ConditionalFooter/>
      </div>
    </Router>
  );
}