import { useState } from 'react';
import { Card, BarChart, LineChart, defaultChartOptions } from '../components';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ventasChartData, canalesChartData, ventasData } from '../data/mockData';

const Ventas = () => {
  const [periodo, setPeriodo] = useState('semana');

  const chartOptions = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins.legend,
        display: false,
      },
    },
  };

  const totalVentas = ventasData.reduce((sum, v) => sum + v.monto, 0);
  const ventasCompletadas = ventasData.filter(v => v.estado === 'completada').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark-900">Ventas</h2>
          <p className="text-gray-600 text-sm">Análisis de tus ventas</p>
        </div>
        <div className="flex gap-2">
          {['día', 'semana', 'mes'].map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                periodo === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Ventas</p>
              <p className="text-3xl font-bold text-dark-900 mt-2">${totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm">
            <span className="text-green-600 font-medium">↑ 12.5%</span>
            <span className="text-gray-500">vs período anterior</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Órdenes Completadas</p>
              <p className="text-3xl font-bold text-dark-900 mt-2">{ventasCompletadas}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm">
            <span className="text-blue-600 font-medium">{((ventasCompletadas / ventasData.length) * 100).toFixed(1)}%</span>
            <span className="text-gray-500">del total</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Promedio por Orden</p>
              <p className="text-3xl font-bold text-dark-900 mt-2">
                ${(totalVentas / ventasData.length).toFixed(0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingDown className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm">
            <span className="text-purple-600 font-medium">↓ 3.2%</span>
            <span className="text-gray-500">vs período anterior</span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Semanales */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-900">Ventas por Día</h3>
            <p className="text-sm text-gray-600">Últimos 7 días</p>
          </div>
          <div className="h-80">
            <LineChart data={ventasChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Ventas por Canal */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-900">Ventas por Canal</h3>
            <p className="text-sm text-gray-600">Distribución de ventas</p>
          </div>
          <div className="h-80">
            <BarChart data={canalesChartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Órdenes Recientes */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-dark-900 mb-4">Órdenes Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Orden</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cantidad</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventasData.map(venta => (
                <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-dark-900 font-medium">#{venta.id}</td>
                  <td className="py-3 px-4 text-sm text-dark-900">{venta.producto}</td>
                  <td className="py-3 px-4 text-sm text-right text-dark-900">{venta.cantidad}</td>
                  <td className="py-3 px-4 text-sm text-right text-dark-900 font-medium">${venta.monto}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      venta.estado === 'completada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Ventas;
