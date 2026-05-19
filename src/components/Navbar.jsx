import { useState } from 'react';
import { Bell, LogOut, MessageSquare, Search, Settings, User } from 'lucide-react';
import { alertasData, empresaData } from '../data/mockData';

const Navbar = ({ title = 'Dashboard', isSidebarCollapsed = false }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifications = alertasData.slice(0, 3);

  return (
    <nav
      className={`fixed right-0 top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      } left-0`}
    >
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 pl-12 lg:pl-0">
          <h1 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">{empresaData.nombre}</h1>
          <p className="hidden text-sm text-slate-500 sm:block">
            {empresaData.implementacion} · {title}
          </p>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
            <Search size={18} />
            <input
              aria-label="Buscar"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Buscar productos, órdenes..."
            />
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => setShowNotifications((value) => !value)}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="font-semibold text-slate-950">Alertas PPC SOLUCIONES</p>
                </div>
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                        notification.tipo === 'error'
                          ? 'bg-red-500'
                          : notification.tipo === 'warning'
                            ? 'bg-yellow-500'
                            : notification.tipo === 'success'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">{notification.titulo}</span>
                      <span className="block text-xs text-slate-500">{notification.timestamp}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Mensajes"
            className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            <MessageSquare size={20} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUser((value) => !value)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                PPC
              </div>
              <span className="hidden text-sm font-semibold text-slate-800 sm:block">Piloto</span>
            </button>

            {showUser && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{empresaData.nombre}</p>
                  <p className="text-xs text-slate-500">{empresaData.correo}</p>
                </div>
                <div className="p-2">
                  {[
                    { icon: User, label: 'Perfil empresarial' },
                    { icon: Settings, label: 'Configuración' },
                    { icon: LogOut, label: 'Cerrar sesión mock', danger: true },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          item.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
