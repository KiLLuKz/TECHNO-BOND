import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'animate.css';

import Welcome from './components/Welcome';
import Footer from './components/Footer';
import Verify from './components/Verify';
import Background from './components/Background';
import Curriculum from './components/Curriculum'
import IdentityQuiz from './components/IdentityQuiz';
import FloatingMenu from './components/FloatingMenu';
import Homework from'./components/Homework';
import J_Dashboard from './components/J_Dashboard';
import S_Dashboard from './components/S_Dashboard';
import { supabase } from './supabaseClient';

import DashboardLayout from './components/DashboardLayout';
import MiniGames from './components/MiniGames/MiniGames';
import BlockBlastGame from './components/MiniGames/BlockBlast/BlockBlastGame';
import ConnectFourGame from './components/MiniGames/ConnectFour/ConnectFourGame';
import TicTacToe from './components/MiniGames/TicTacToe/TicTacToe';
import Referee from './components/MiniGames/ChessGame/Referee/Referee';
import ThaiCheckers from './components/MiniGames/ThaiCheckers/ThaiCheckersGame';
import BattleShip from './components/MiniGames/BattleShip/BattleshipGame';
import ShootEmUp from './components/MiniGames/ShootEmUp/ShootEmUp';
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
      <Route path="/curriculum" element={<Curriculum />} />
      <Route path="homework" element={<Homework userRole={userRole} isAdmin={isAdmin} />} />
      
      {/* ส่วน Dashboard และหน้าย่อย (Nested Routes) */}
      <Route path="/dashboard" element={
        userRole ? <DashboardLayout /> : <div className="text-center mt-20 text-2xl font-['Orbitron']">ACCESS DENIED</div>
      }>
        <Route index element={userRole === 'junior' ? <J_Dashboard /> : <S_Dashboard />} />
        
        <Route path="minigames" element={<MiniGames />} />
        <Route path="minigames/block-blast" element={<BlockBlastGame />} />
        <Route path="minigames/connect-four" element={<ConnectFourGame />} /> 
        <Route path="minigames/chess" element={<Referee />} />
        <Route path="minigames/tic-tac-toe" element={<TicTacToe />} />
        <Route path="minigames/thai-checkers" element={<ThaiCheckers />} />
        <Route path="minigames/battleship" element={<BattleShip />} />
        <Route path="minigames/shoot-em-up" element={<ShootEmUp />} />
        
        
        <Route path="admin" element={isAdmin ? <AdminDashboard /> : <div className="p-10 text-center text-white">ACCESS DENIED</div>} />
      </Route>
      
    </Routes>
  );
}
export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const fetchUserData = async (user) => {
    if (!user) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }

    try {
      const studentId = user.email.split('@')[0];

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profile?.role === 'admin') {
        setUserRole('admin');
        setIsAdmin(true);
      } else {
        const { data: seniorData } = await supabase
          .from('pairing_data') 
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