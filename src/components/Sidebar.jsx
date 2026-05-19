import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  TrendingUp,
  Radio,
  Zap,
  Bell,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

const Sidebar = ({ onToggleChatbot }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Inventario', path: '/inventario' },
    { icon: TrendingUp, label: 'Ventas', path: '/ventas' },
    { icon: Radio, label: 'Canales', path: '/canales' },
    { icon: Zap, label: 'IA Insights', path: '/insights' },
    { icon: Bell, label: 'Alertas', path: '/alertas' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-600 text-white"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        } ${isMobileOpen ? 'block' : 'hidden lg:block'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">ML</span>
              </div>
              <span className="text-black font-bold text-lg">MercaLink</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex p-1 hover:bg-slate-100 rounded-lg transition-colors text-black"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-100 text-black shadow-lg shadow-primary-500/10'
                    : 'text-black hover:bg-slate-100'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onToggleChatbot}
            className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-black transition-all duration-200 hover:bg-slate-100"
          >
            <MessageSquare size={20} className="flex-shrink-0" />
            {isOpen && <span className="font-medium">Chatbot</span>}
          </button>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
