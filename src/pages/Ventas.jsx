import { useState } from 'react';
import { BarChart, Card, LineChart, defaultChartOptions } from '../components';
import { canalesChartData, empresaData, ventasChartData, ventasData } from '../data/mockData';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';

const Ventas = () => {
  const [periodo, setPeriodo] = useState('Semana');
  const totalVentas = ventasData.reduce((sum, venta) => sum + venta.monto, 0);
  const ventasCompletadas = ventasData.filter((venta) => venta.estado === 'completada').length;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Ventas</h2>
          <p className="mt-1 text-sm text-slate-500">Ingresos, órdenes y canales de {empresaData.nombre}.</p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {['Día', 'Semana', 'Mes'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriodo(item)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                periodo === item ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Total ventas', value: `$${totalVentas.toLocaleString()}`, detail: 'WhatsApp y tienda física lideran', icon: TrendingUp, iconClass: 'bg-green-50 text-green-700' },
          { label: 'Órdenes completadas', value: ventasCompletadas, detail: `${((ventasCompletadas / ventasData.length) * 100).toFixed(1)}% del total`, icon: CreditCard, iconClass: 'bg-blue-50 text-blue-700' },
          { label: 'Promedio por orden', value: `$${(totalVentas / ventasData.length).toFixed(0)}`, detail: 'Datos mock del piloto', icon: TrendingDown, iconClass: 'bg-violet-50 text-violet-700' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${item.iconClass}`}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{item.detail}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Ventas por día</h3>
          <p className="mb-5 text-sm text-slate-500">Últimos 7 días.</p>
          <div className="h-80">
            <LineChart data={ventasChartData} options={chartOptions} />
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Ventas por canal</h3>
          <p className="mb-5 text-sm text-slate-500">WhatsApp, tienda física, Instagram y Facebook.</p>
          <div className="h-80">
            <BarChart data={canalesChartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden" hover={false}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-950">Órdenes recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Orden', 'Cliente', 'Producto', 'Canal', 'Monto', 'Estado'].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventasData.map((venta) => (
                <tr key={venta.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">#{venta.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{venta.cliente}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{venta.producto}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{venta.canal}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">${venta.monto}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      venta.estado === 'completada'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
                    }`}>
                      {venta.estado}
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
