import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatbotWidget from '../components/ChatbotWidget';

const MainLayout = ({ title = 'Dashboard' }) => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onToggleChatbot={() => setChatbotOpen((open) => !open)} />
      <Navbar title={title} />
      <main className="pt-20 lg:ml-64 min-h-screen">
        <Outlet />
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
