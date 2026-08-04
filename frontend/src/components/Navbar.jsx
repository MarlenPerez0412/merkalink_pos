import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { clearAuthSession } from '../services/api/apiClient';
import { getAlertas } from '../services/api/alertasApi';

const obtenerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
};

const esAdministrador = (usuario) =>
  ['Administrador', 'Administrador General'].includes(String(usuario?.rol || '').trim());

const Navbar = ({ isSidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [usuario, setUsuario] = useState(() => obtenerUsuario());
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const iniciales = (usuario?.nombre || 'POS')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const cargarNotificaciones = () => {
    getAlertas()
      .then((data) =>
        setNotifications((data || []).filter((alerta) => !['Vista', 'Resuelta', 'Revisada', 'Atendida'].includes(alerta.estado))),
      )
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  useEffect(() => {
    window.addEventListener('alertasActualizadas', cargarNotificaciones);
    window.addEventListener('configuracionActualizada', cargarNotificaciones);

    return () => {
      window.removeEventListener('alertasActualizadas', cargarNotificaciones);
      window.removeEventListener('configuracionActualizada', cargarNotificaciones);
    };
  }, []);

  useEffect(() => {
    const sincronizarUsuario = () => {
      setUsuario(obtenerUsuario());
    };

    window.addEventListener('usuarioActualizado', sincronizarUsuario);
    window.addEventListener('storage', sincronizarUsuario);

    return () => {
      window.removeEventListener('usuarioActualizado', sincronizarUsuario);
      window.removeEventListener('storage', sincronizarUsuario);
    };
  }, []);

  useEffect(() => {
    const cerrarDropdowns = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        window.clearTimeout(closeTimerRef.current);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', cerrarDropdowns);
    return () => {
      document.removeEventListener('mousedown', cerrarDropdowns);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const cancelCloseDropdown = () => {
    window.clearTimeout(closeTimerRef.current);
  };

  const openDropdown = (dropdown) => {
    cancelCloseDropdown();
    setActiveDropdown(dropdown);
  };

  const closeDropdown = () => {
    cancelCloseDropdown();
    setActiveDropdown(null);
  };

  const scheduleCloseDropdown = () => {
    cancelCloseDropdown();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleDropdown = (dropdown) => {
    cancelCloseDropdown();
    setActiveDropdown((value) => (value === dropdown ? null : dropdown));
  };

  const handleLogout = () => {
    closeDropdown();
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <nav
      className={`fixed right-0 top-0 z-40 border-b border-slate-800 bg-slate-900 shadow-sm transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      } left-0`}
    >
      <div className="flex h-20 items-center justify-end gap-4 px-4 pl-16 sm:px-6 sm:pl-20 lg:px-8 lg:pl-8">
        <div ref={dropdownRef} className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div
            className="relative"
            onMouseEnter={() => openDropdown('alerts')}
            onMouseLeave={scheduleCloseDropdown}
          >
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => toggleDropdown('alerts')}
              className="relative rounded-lg p-2 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-yellow-400 px-1 text-[11px] font-bold text-slate-950 ring-2 ring-slate-900">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {activeDropdown === 'alerts' && (
              <div
                className="absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
                onMouseEnter={() => openDropdown('alerts')}
                onMouseLeave={scheduleCloseDropdown}
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="font-semibold text-slate-950">Alertas POS</p>
                </div>
                {notifications.length === 0 && (
                  <p className="px-4 py-4 text-sm text-slate-500">No hay alertas pendientes.</p>
                )}
                {notifications.slice(0, 4).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                  >
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">
                        {notification.tipo || 'Alerta'}
                      </span>
                      <span className="block text-xs text-slate-500">{notification.mensaje}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => openDropdown('user')}
            onMouseLeave={scheduleCloseDropdown}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('user')}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-800"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-yellow-400 text-sm font-semibold text-slate-950">
                {iniciales}
              </div>
              <div className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-white">{usuario?.nombre || 'Usuario demo'}</span>
                <span className="block text-xs text-slate-300">{usuario?.rol || 'Demo'}</span>
              </div>
            </button>

            {activeDropdown === 'user' && (
              <div
                className="absolute right-0 z-50 mt-3 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
                onMouseEnter={() => openDropdown('user')}
                onMouseLeave={scheduleCloseDropdown}
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {usuario?.nombre || 'Usuario demo'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {usuario?.correo || 'demo@merkalinkpos.com'}
                  </p>
                </div>
                <div className="p-2">
                  {esAdministrador(usuario) && (
                    <button
                      type="button"
                      onClick={() => {
                        closeDropdown();
                        navigate('/configuracion?tab=perfil');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <User size={16} />
                      Perfil
                    </button>
                  )}
                  {esAdministrador(usuario) && (
                    <button
                      type="button"
                      onClick={() => {
                        closeDropdown();
                        navigate('/configuracion?tab=empresa');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Settings size={16} />
                      Configuración
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
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
