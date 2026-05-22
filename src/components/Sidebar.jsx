import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Menu,
  MessageSquare,
  Package,
  Radio,
  Settings,
  Sparkles,
  TrendingUp,
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

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const toggleSidebar = () => {
    onCollapseChange?.(!isCollapsed);
  };

  const sidebar = (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white/95 shadow-sm backdrop-blur transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4">
        {!isCollapsed && (
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
            onClick={closeMobileMenu}
          >
            

            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">
                MercaLink AI
              </p>
              <p className="truncate text-xs text-slate-500">
                PPC SOLUCIONES
              </p>
            </div>
          </Link>
        )}

        <button
          type="button"
          aria-label="Abrir o cerrar menú"
          onClick={toggleSidebar}
          className={`hidden rounded-lg bg-white p-2 text-slate-950 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 lg:inline-flex ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          <Menu size={22} />
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
              onClick={closeMobileMenu}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-950 text-white ring-1 ring-slate-900'
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
        aria-label="Abrir o cerrar menú"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 text-slate-950 shadow-lg ring-1 ring-slate-200 lg:hidden"
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
        />
      )}
    </>
  );
};

export default Sidebar;