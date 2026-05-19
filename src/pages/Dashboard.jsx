import { Card, DoughnutChart, LineChart, StatCard, defaultChartOptions } from '../components';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import {
  canalesData,
  categoriasChartData,
  empresaData,
  productosData,
  ventasChartData,
  ventasData,
} from '../data/mockData';
import { AlertTriangle, Building2, Package, ShoppingCart, Target, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const totalVentas = ventasData.reduce((sum, venta) => sum + venta.monto, 0);
  const bajoStock = productosData.filter((producto) => producto.stock < 6).length;
  const stockTotal = productosData.reduce((sum, producto) => sum + producto.stock, 0);
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
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
        <div className="grid gap-6 p-5 text-white lg:grid-cols-[1.5fr_1fr] lg:p-6">
          <div>
            <p className="text-sm font-semibold text-primary-200">{empresaData.implementacion}</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{empresaData.nombre}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{empresaData.giro}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {empresaData.canalesDisponibles.map((canal) => (
                <span key={canal} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">
                  {canal}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-500/20 p-3 text-primary-100">
                <Target size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Objetivo del piloto</p>
                <p className="mt-1 text-sm text-slate-300">{empresaData.objetivoPiloto}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotificationCenter />

      <Card className="p-5" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">Implementación PPC SOLUCIONES</p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">Centralización operativa</h3>
            <p className="mt-1 text-sm text-slate-500">Inventario, ventas y canales digitales conectados visualmente en el MVP.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Empresa piloto', value: empresaData.nombre },
              { label: 'Giro', value: 'Computadoras y accesorios' },
              { label: 'Canales', value: empresaData.canalesDisponibles.length },
              { label: 'Stock total', value: `${stockTotal} u` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Ventas totales" value={`$${totalVentas.toLocaleString()}`} change={12.5} icon={TrendingUp} color="primary" />
        <StatCard title="Productos activos" value={productosData.length} change={8.2} icon={Package} color="accent" />
        <StatCard title="Órdenes completadas" value={ventasCompletadas} change={5.1} icon={ShoppingCart} color="green" />
        <StatCard title="Canales activos" value={canalesData.length} change={2.5} icon={Building2} color="orange" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2" hover={false}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Ventas de la semana</h3>
              <p className="text-sm text-slate-500">Tendencia de ingresos de PPC SOLUCIONES.</p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">Canal líder: WhatsApp</span>
          </div>
          <div className="h-80">
            <LineChart data={ventasChartData} options={chartOptions} />
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-950">Mix de productos</h3>
            <p className="text-sm text-slate-500">Accesorios, cómputo, servicios e impresoras.</p>
          </div>
          <div className="h-72">
            <DoughnutChart data={categoriasChartData} options={chartOptions} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {categoriasChartData.labels.map((label, index) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-950">{categoriasChartData.datasets[0].data[index]}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          { label: 'Tasa de conversión', value: '6.4%', detail: 'WhatsApp', width: '64%', color: 'bg-primary-600' },
          { label: 'Ticket promedio', value: `$${(totalVentas / ventasData.length).toFixed(0)}`, detail: 'ventas mock', width: '58%', color: 'bg-violet-600' },
          { label: 'Alertas de stock', value: bajoStock, detail: 'productos críticos', width: '72%', color: 'bg-orange-500' },
        ].map((item) => (
          <Card key={item.label} className="p-5" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
              </div>
              {item.label === 'Alertas de stock' && <AlertTriangle className="text-orange-500" size={22} />}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.detail}</span>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className={`h-2 rounded-full ${item.color}`} style={{ width: item.width }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
