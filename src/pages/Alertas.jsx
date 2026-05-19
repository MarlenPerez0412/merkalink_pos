import { useState } from 'react';
import { Card, Button } from '../components';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { alertasData } from '../data/mockData';

const Alertas = () => {
  const [alertas, setAlertas] = useState(alertasData);
  const [filtro, setFiltro] = useState('todas');

  const getAlertColor = (tipo) => {
    const colors = {
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      success: 'text-green-600 bg-green-50 border-green-200',
      error: 'text-red-600 bg-red-50 border-red-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[tipo] || colors.info;
  };

  const getAlertIcon = (tipo) => {
    const icons = {
      warning: <AlertTriangle size={20} />,
      success: <CheckCircle size={20} />,
      error: <AlertTriangle size={20} />,
      info: <Info size={20} />,
    };
    return icons[tipo] || icons.info;
  };

  const filteredAlertas = filtro === 'todas' ? alertas : alertas.filter(a => a.tipo === filtro);

  const handleDelete = (id) => {
    setAlertas(alertas.filter(a => a.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark-900 flex items-center gap-2">
            <Bell className="text-yellow-600" size={32} />
            Alertas
          </h2>
          <p className="text-gray-600 text-sm">Notificaciones importantes sobre tu negocio</p>
        </div>
        <div className="flex gap-2">
          {['todas', 'warning', 'success', 'error', 'info'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                filtro === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Total Alertas</p>
          <p className="text-2xl font-bold text-dark-900">{alertas.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Advertencias</p>
          <p className="text-2xl font-bold text-yellow-600">
            {alertas.filter(a => a.tipo === 'warning').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Errores</p>
          <p className="text-2xl font-bold text-red-600">
            {alertas.filter(a => a.tipo === 'error').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Información</p>
          <p className="text-2xl font-bold text-blue-600">
            {alertas.filter(a => a.tipo === 'info').length}
          </p>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlertas.length > 0 ? (
          filteredAlertas.map(alerta => (
            <Card key={alerta.id} className={`p-4 border ${getAlertColor(alerta.tipo)}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{alerta.titulo}</h3>
                  <p className="text-sm opacity-90 mb-2">{alerta.mensaje}</p>
                  <p className="text-xs opacity-70">{alerta.timestamp}</p>
                </div>
                <button
                  onClick={() => handleDelete(alerta.id)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hay alertas en esta categoría</p>
          </Card>
        )}
      </div>

      {/* Alert Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-dark-900 mb-4">Configuración de Alertas</h3>
        <div className="space-y-3">
          {[
            { label: 'Stock bajo en productos', enabled: true },
            { label: 'Nuevas órdenes', enabled: true },
            { label: 'Cambios de precio', enabled: false },
            { label: 'Actualizaciones del sistema', enabled: true },
          ].map((setting, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-dark-900">{setting.label}</label>
              <input
                type="checkbox"
                defaultChecked={setting.enabled}
                className="w-4 h-4 rounded"
              />
            </div>
          ))}
        </div>
        <Button className="w-full mt-4">Guardar Preferencias</Button>
      </Card>
    </div>
  );
};

export default Alertas;
