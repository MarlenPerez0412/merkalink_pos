import { useState } from 'react';
import { Bell, User, Settings, LogOut, MessageSquare } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const notifications = [
    { id: 1, message: 'Bajo stock de Termo Rosa', type: 'warning' },
    { id: 2, message: 'Nueva orden recibida', type: 'success' },
    { id: 3, message: 'Sistema actualizado', type: 'info' },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b border-gray-100 shadow-soft z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-dark-900">{title}</h1>
          <p className="text-sm text-gray-500">Bienvenido a MercaLink AI</p>
        </div>

        {/* Right Items */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg-soft border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-dark-900">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 ${
                            notif.type === 'warning'
                              ? 'bg-yellow-500'
                              : notif.type === 'success'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <p className="text-sm text-gray-700">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageSquare size={20} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUser(!showUser)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500" />
              <span className="text-sm font-medium text-dark-900 hidden sm:block">
                Admin
              </span>
            </button>

            {/* User Dropdown */}
            {showUser && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg-soft border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-dark-900">Administrador</p>
                  <p className="text-xs text-gray-500">admin@merkalink.ai</p>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <User size={16} />
                    Mi Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings size={16} />
                    Configuración
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={16} />
                    Cerrar Sesión
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
