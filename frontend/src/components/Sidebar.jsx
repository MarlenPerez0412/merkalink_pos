import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react';
import { clearAuthSession } from '../services/api/apiClient';

const adminRoles = ['Administrador', 'Administrador General'];

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/', roles: adminRoles },
  { icon: ShoppingCart, label: 'Punto de Venta', path: '/pos', roles: [...adminRoles, 'Cajero'] },
  { icon: Package, label: 'Inventario', path: '/inventario', roles: adminRoles },
  { icon: TrendingUp, label: 'Ventas', path: '/ventas', roles: [...adminRoles, 'Cajero'] },
  { icon: Store, label: 'Origen de venta', path: '/canales', roles: adminRoles },
  { icon: Bell, label: 'Alertas', path: '/alertas', roles: adminRoles },
  { icon: Settings, label: 'Configuracion', path: '/configuracion', roles: adminRoles },
];

const Sidebar = ({ isCollapsed = false, onCollapseChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const rol = localStorage.getItem('rol') || 'Administrador';
  const visibleItems = menuItems.filter((item) => item.roles.includes(rol));

  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-700 bg-slate-900 shadow-sm backdrop-blur transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-700 px-4">
        {!isCollapsed && (
          <Link
            to={rol === 'Cajero' ? '/pos' : '/'}
            className="flex min-w-0 items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">MercaLink POS</p>
              <p className="truncate text-xs text-slate-300">POS para restaurantes</p>
            </div>
          </Link>
        )}

        <button
          type="button"
          aria-label="Abrir o cerrar menu"
          onClick={() => onCollapseChange?.(!isCollapsed)}
          className={`hidden rounded-lg bg-[#EAB308] p-2 text-slate-950 shadow-sm ring-1 ring-[#FBBF24] transition-colors hover:bg-[#f59e0b] lg:inline-flex ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          <Menu size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              onClick={closeMobileMenu}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#EAB308] text-slate-950 ring-1 ring-[#FBBF24] shadow-sm'
                  : 'text-white hover:bg-slate-800 hover:text-slate-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={19} className="flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-3">
        <button
          type="button"
          title={isCollapsed ? 'Cerrar sesión' : undefined}
          onClick={handleLogout}
          className={`flex h-11 w-full items-center gap-3 rounded-lg bg-[#EAB308] px-3 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-[#FBBF24] transition-colors hover:bg-[#f59e0b] ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={19} className="flex-shrink-0" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Abrir o cerrar menu"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#EAB308] p-2 text-slate-950 shadow-lg ring-1 ring-[#FBBF24] lg:hidden hover:bg-[#f59e0b]"
      >
        <Menu size={22} />
      </button>

      {sidebar}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
