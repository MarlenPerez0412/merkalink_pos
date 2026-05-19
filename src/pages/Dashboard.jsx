import { Card, StatCard, LineChart, DoughnutChart, defaultChartOptions } from '../components';
import { TrendingUp, Package, ShoppingCart, Users } from 'lucide-react';
import { ventasChartData, categoriasChartData } from '../data/mockData';

const Dashboard = () => {
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-dark-900 mb-1">Dashboard</h2>
        <p className="text-gray-600">Bienvenido a tu panel de control</p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          value="$45,280"
          change={12.5}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Total Productos"
          value="42"
          change={8.2}
          icon={Package}
          color="accent"
        />
        <StatCard
          title="Órdenes Hoy"
          value="23"
          change={5.1}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Clientes Nuevos"
          value="8"
          change={2.5}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventas por Día */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-900">Ventas de la Semana</h3>
            <p className="text-sm text-gray-600">Tendencia de ventas últimos 7 días</p>
          </div>
          <div className="h-80">
            <LineChart data={ventasChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Categorías */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-dark-900">Productos</h3>
            <p className="text-sm text-gray-600">Por categoría</p>
          </div>
          <div className="h-80">
            <DoughnutChart data={categoriasChartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Tasa de Conversión</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-dark-900">3.8%</span>
            <span className="text-green-600 text-sm font-medium mb-1">↑ 0.2%</span>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full" style={{ width: '38%' }} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Ticket Promedio</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-dark-900">$1,968</span>
            <span className="text-green-600 text-sm font-medium mb-1">↑ 5.2%</span>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full" style={{ width: '65%' }} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Inventario Total</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-dark-900">187 u</span>
            <span className="text-red-600 text-sm font-medium mb-1">↓ 3.1%</span>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{ width: '72%' }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
