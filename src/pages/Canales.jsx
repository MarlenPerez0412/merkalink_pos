import { useState } from 'react';
import { Card, Button } from '../components';
import { Globe, TrendingUp, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { canalesData } from '../data/mockData';

const Canales = () => {
  const [canales] = useState(canalesData);
  const [showForm, setShowForm] = useState(false);

  const getStatusColor = (status) => {
    return status === 'activo'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark-900">Canales de Venta</h2>
          <p className="text-gray-600 text-sm">Gestiona tus canales omnicanal</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="md">
          <Plus size={18} />
          Nuevo Canal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Canales Activos</p>
              <p className="text-3xl font-bold text-dark-900 mt-2">
                {canales.filter(c => c.estado === 'activo').length}
              </p>
            </div>
            <Globe className="text-primary-600" size={24} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Productos Sincronizados</p>
              <p className="text-3xl font-bold text-dark-900 mt-2">
                {canales.reduce((sum, c) => sum + c.productos, 0)}
              </p>
            </div>
            <TrendingUp className="text-accent-600" size={24} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ventas Totales</p>
              <p className="text-3xl font-bold text-dark-900 mt-2">
                ${canales.reduce((sum, c) => sum + c.ventas, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Canales Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {canales.map(canal => (
          <Card key={canal.id} className="p-6 hover:shadow-md-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-dark-900">{canal.nombre}</h3>
                <p className="text-sm text-gray-600">{canal.plataforma}</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(canal.estado)}`}>
                {canal.estado.charAt(0).toUpperCase() + canal.estado.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Productos</p>
                <p className="text-2xl font-bold text-dark-900">{canal.productos}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Ventas</p>
                <p className="text-2xl font-bold text-dark-900">${canal.ventas.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                <Edit2 size={16} />
                Editar
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
        <div className="flex gap-4">
          <AlertCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-dark-900">Sincronización Automática</h3>
            <p className="text-sm text-gray-700 mt-1">
              Tus productos se sincronizan automáticamente en todos los canales. Los cambios de precio e inventario se actualizan en tiempo real.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Canales;
