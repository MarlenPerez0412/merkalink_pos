import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatbotWidget from '../components/ChatbotWidget';

const MainLayout = ({ title = 'Dashboard' }) => {
  const [chatbotOpen, setChatbotOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
        onToggleChatbot={() => setChatbotOpen((open) => !open)}
      />
      <Navbar title={title} isSidebarCollapsed={sidebarCollapsed} />
      <main
        className={`min-h-screen px-4 pb-8 pt-24 transition-all duration-300 sm:px-6 lg:px-8 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
      <ChatbotWidget
        isOpen={chatbotOpen}
        onToggle={() => setChatbotOpen((open) => !open)}
        onClose={() => setChatbotOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
