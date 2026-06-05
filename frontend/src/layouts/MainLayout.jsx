import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ title = 'Dashboard' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />
      <Navbar title={title} isSidebarCollapsed={sidebarCollapsed} />
      <main
        className={`min-h-screen px-4 pb-8 pt-28 transition-all duration-300 sm:px-6 lg:px-8 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
