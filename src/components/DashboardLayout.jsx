import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="w-full">
      {/* Outlet คือจุดที่ J_Dashboard หรือ MiniGames จะมาเสียบแทนที่ */}
      <Outlet />
    </div>
  );
};

export default DashboardLayout;