import { useState } from 'react';
import { Card, Button } from '../components';
import { Settings, User, Lock, Bell, Palette, Download, Save } from 'lucide-react';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-dark-900 flex items-center gap-2">
          <Settings size={32} />
          Configuración
        </h2>
        <p className="text-gray-600 text-sm">Personaliza tu experiencia en MercaLink</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'perfil', label: 'Perfil', icon: User },
          { id: 'seguridad', label: 'Seguridad', icon: Lock },
          { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
          { id: 'apariencia', label: 'Apariencia', icon: Palette },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-dark-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {/* Perfil */}
        {activeTab === 'perfil' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-dark-900 mb-4">Información de Perfil</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      defaultValue="Administrador del Sistema"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@merkalink.ai"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      placeholder="+56 9 12345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="Mi Empresa SPA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600">
                    <option>América/Santiago (UTC-3)</option>
                    <option>América/Bogotá (UTC-5)</option>
                    <option>América/Buenos Aires (UTC-3)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button>
                    <Save size={18} />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Seguridad */}
        {activeTab === 'seguridad' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-dark-900 mb-4">Configuración de Seguridad</h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-dark-900 mb-2">Cambiar Contraseña</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Se recomienda cambiar tu contraseña cada 90 días
                  </p>
                  <Button variant="outline" size="sm">Cambiar Contraseña</Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-medium text-dark-900 mb-2">Autenticación de Dos Factores</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Agrega una capa adicional de seguridad a tu cuenta
                  </p>
                  <Button variant="outline" size="sm">Habilitar 2FA</Button>
                </div>

                <div>
                  <h4 className="font-medium text-dark-900 mb-3">Sesiones Activas</h4>
                  <div className="space-y-2">
                    {[
                      { dispositivo: 'Chrome en Windows', ubicacion: 'Santiago, CL', ultimo: 'Hace 5 min' },
                      { dispositivo: 'Safari en iPhone', ubicacion: 'Santiago, CL', ultimo: 'Hace 2 horas' },
                    ].map((sesion, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-dark-900 text-sm">{sesion.dispositivo}</p>
                          <p className="text-xs text-gray-600">{sesion.ubicacion} • {sesion.ultimo}</p>
                        </div>
                        <button className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm">
                          Salir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notificaciones */}
        {activeTab === 'notificaciones' && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-dark-900 mb-4">Preferencias de Notificaciones</h3>
            <div className="space-y-3">
              {[
                { label: 'Nuevas órdenes', email: true, app: true },
                { label: 'Alertas de stock bajo', email: true, app: true },
                { label: 'Cambios de precio', email: false, app: true },
                { label: 'Reportes semanales', email: true, app: false },
                { label: 'Actualizaciones del sistema', email: false, app: true },
              ].map((notif, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-dark-900">{notif.label}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={notif.email} className="w-4 h-4" />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={notif.app} className="w-4 h-4" />
                      Aplicación
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">Guardar Preferencias</Button>
          </Card>
        )}

        {/* Apariencia */}
        {activeTab === 'apariencia' && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-dark-900 mb-4">Preferencias de Apariencia</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: 'Claro', value: 'light' },
                    { name: 'Oscuro', value: 'dark' },
                    { name: 'Sistema', value: 'system' },
                  ].map(theme => (
                    <label
                      key={theme.value}
                      className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-600 transition-colors"
                    >
                      <input type="radio" name="theme" defaultChecked={theme.value === 'light'} className="mb-2" />
                      <p className="font-medium text-dark-900">{theme.name}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tamaño de Fuente</label>
                <div className="flex gap-2">
                  {['Pequeño', 'Normal', 'Grande'].map((size, idx) => (
                    <button
                      key={idx}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        idx === 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full">Guardar Preferencias</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-bold text-red-900 mb-4">Zona de Peligro</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-red-800 mb-3">
              Descargar todos tus datos en un archivo JSON
            </p>
            <Button variant="outline" size="sm">
              <Download size={16} />
              Descargar Datos
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Configuracion;
