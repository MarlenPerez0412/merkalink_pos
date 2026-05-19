import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Package,
  Radio,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventario', path: '/inventario' },
  { icon: TrendingUp, label: 'Ventas', path: '/ventas' },
  { icon: Radio, label: 'Canales', path: '/canales' },
  { icon: Sparkles, label: 'IA Insights', path: '/insights' },
  { icon: Bell, label: 'Alertas', path: '/alertas' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

const Sidebar = ({ isCollapsed = false, onCollapseChange, onToggleChatbot }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const sidebar = (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white/95 shadow-sm backdrop-blur transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsMobileOpen(false)}>
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            ML
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">MercaLink AI</p>
              <p className="truncate text-xs text-slate-500">PPC SOLUCIONES</p>
            </div>
          )}
        </Link>
        <button
          type="button"
          aria-label="Contraer sidebar"
          onClick={() => onCollapseChange?.(!isCollapsed)}
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              onClick={() => setIsMobileOpen(false)}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={19} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          title={isCollapsed ? 'Chatbot' : undefined}
          onClick={onToggleChatbot}
          className={`flex h-11 w-full items-center gap-3 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <MessageSquare size={19} className="flex-shrink-0" />
          {!isCollapsed && <span>Chatbot</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary-600 p-2 text-white shadow-lg lg:hidden"
      >
        <Menu size={22} />
      </button>
      {sidebar}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="absolute left-72 top-5 text-white" size={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
