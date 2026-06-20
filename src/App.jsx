import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { supabase } from './supabaseClient';

// --- Critical Initial Load Components ---
import Welcome from './components/Welcome';
import Footer from './components/Footer';
import Verify from './components/Verify';
import Background from './components/Background';
import FloatingMenu from './components/FloatingMenu';
import Loader from './components/Loader';

// --- Lazy Loaded Components ---
const Curriculum = lazy(() => import('./components/Curriculum'));
const IdentityQuiz = lazy(() => import('./components/IdentityQuiz'));
const Homework = lazy(() => import('./components/Homework'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const J_Dashboard = lazy(() => import('./components/J_Dashboard'));
const S_Dashboard = lazy(() => import('./components/S_Dashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// --- Minigames (Heavy logic, lazy loaded) ---
const MiniGames = lazy(() => import('./components/MiniGames/MiniGames'));
const BlockBlastGame = lazy(() => import('./components/MiniGames/BlockBlast/BlockBlastGame'));
const ConnectFourGame = lazy(() => import('./components/MiniGames/ConnectFour/ConnectFourGame'));
const TicTacToe = lazy(() => import('./components/MiniGames/TicTacToe/TicTacToe'));
const Referee = lazy(() => import('./components/MiniGames/ChessGame/Referee/Referee'));
const ThaiCheckers = lazy(() => import('./components/MiniGames/ThaiCheckers/ThaiCheckersGame'));
const BattleShip = lazy(() => import('./components/MiniGames/BattleShip/BattleshipGame'));
const ShootEmUp = lazy(() => import('./components/MiniGames/ShootEmUp/ShootEmUp'));

const ConditionalFooter = () => {
  const location = useLocation();
  const hideFooter = location.pathname.includes('minigames');

  if (hideFooter) return null;
  return <Footer />;
};

function AppRoutes({ setUserRole, setIsAdmin, userRole, isAdmin }) {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<Loader text="LOADING" />}>
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
        
        {/* Dashboard Nested Routes */}
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
    </Suspense>
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