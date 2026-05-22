/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Building2,
  Package,
  ShoppingCart,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, DoughnutChart, LineChart, StatCard, defaultChartOptions } from '../components';
import { getAlertas } from '../services/api/alertasApi';
import { getCanales } from '../services/api/canalesApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getProductos } from '../services/api/productosApi';
import { getVentas } from '../services/api/ventasApi';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const coloresCategorias = [
  '#0ea5e9',
  '#8b5cf6',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#64748b',
  '#f59e0b',
  '#14b8a6',
  '#ef4444',
  '#6366f1',
];

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const empresaFallback = {
  nombre: 'PPC SOLUCIONES',
  giro: 'Comercio al por menor de computadoras y sus accesorios',
  objetivoPiloto:
    'Centralizar inventario, ventas, canales digitales y alertas inteligentes para apoyar la toma de decisiones.',
};

const obtenerCanalesDisponibles = (canales) => {
  if (!canales.length) return ['WhatsApp', 'Facebook', 'Instagram', 'Tienda física'];
  return canales.map((canal) => canal.nombre);
};

const generarVentasSemana = (ventas) => {
  const hoy = new Date();

  const ultimosDias = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(hoy);
    date.setDate(hoy.getDate() - (6 - index));

    return {
      key: date.toISOString().split('T')[0],
      label: diasSemana[date.getDay()],
      total: 0,
    };
  });

  ventas.forEach((venta) => {
    const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
    const dia = ultimosDias.find((item) => item.key === fechaVenta);

    if (dia) {
      dia.total += Number(venta.total || 0);
    }
  });

  return {
    labels: ultimosDias.map((item) => item.label),
    datasets: [
      {
        label: 'Ventas',
        data: ultimosDias.map((item) => item.total),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
};

const generarCategoriasChart = (productos) => {
  const categorias = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoría';
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(categorias);
  const data = Object.values(categorias);
  const total = data.reduce((sum, value) => sum + value, 0);


  return {
    labels,
    datasets: [
      {
        label: 'Productos',
        data,
        total,
        backgroundColor: labels.map(
          (_, index) => coloresCategorias[index % coloresCategorias.length],
        ),
        borderWidth: 0,
      },
    ],
  };
};

const obtenerCanalLider = (ventas) => {
  if (!ventas.length) return 'Sin ventas';

  const canales = ventas.reduce((acc, venta) => {
    const canal = venta.canal || 'Sin canal';
    acc[canal] = (acc[canal] || 0) + Number(venta.total || 0);
    return acc;
  }, {});

  return Object.entries(canales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin ventas';
};

const Dashboard = () => {
  const [empresa, setEmpresa] = useState(empresaFallback);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [canales, setCanales] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    try {
      const [empresaData, productosData, ventasData, canalesData, alertasData] =
        await Promise.all([
          getEmpresa(),
          getProductos(),
          getVentas(),
          getCanales(),
          getAlertas(),
        ]);

      setEmpresa({
        ...empresaFallback,
        ...(empresaData || {}),
      });

      setProductos(productosData || []);
      setVentas(ventasData || []);
      setCanales(canalesData || []);
      setAlertas(alertasData || []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos del Dashboard desde MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosActivos = useMemo(() => {
    return productos.filter((producto) => producto.estado !== 'Inactivo');
  }, [productos]);

  const totalVentas = useMemo(() => {
    return ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  }, [ventas]);

  const bajoStock = useMemo(() => {
    return productosActivos.filter((producto) => Number(producto.stock || 0) < 6).length;
  }, [productosActivos]);

  const stockTotal = useMemo(() => {
    return productosActivos.reduce((sum, producto) => sum + Number(producto.stock || 0), 0);
  }, [productosActivos]);

  const ventasCompletadas = ventas.length;

  const canalesActivos = useMemo(() => {
    return canales.filter((canal) => canal.estado?.toLowerCase() === 'activo').length;
  }, [canales]);

  const alertasPendientes = useMemo(() => {
    return alertas.filter((alerta) => alerta.estado !== 'Vista');
  }, [alertas]);

  const alertasCriticas = useMemo(() => {
    return alertasPendientes.filter((alerta) =>
      ['Crítica', 'Critica'].includes(alerta.nivel),
    );
  }, [alertasPendientes]);

  const ventasChartData = useMemo(() => generarVentasSemana(ventas), [ventas]);

  const categoriasChartData = useMemo(
    () => generarCategoriasChart(productosActivos),
    [productosActivos],
  );

  const categoriasResumen = useMemo(() => {
    const total = categoriasChartData.datasets[0]?.data.reduce(
      (sum, cantidad) => sum + Number(cantidad || 0),
      0,
    );

    return categoriasChartData.labels.map((label, index) => {
      const cantidad = categoriasChartData.datasets[0].data[index];
      const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(1) : 0;
      const color = categoriasChartData.datasets[0].backgroundColor[index];

      return {
        label,
        cantidad,
        porcentaje,
        color,
      };
    });
  }, [categoriasChartData]);

  const canalLider = useMemo(() => obtenerCanalLider(ventas), [ventas]);

  const ticketPromedio = ventas.length > 0 ? totalVentas / ventas.length : 0;
  const tasaConversion =
    canales.length > 0 ? Math.min(100, Math.round((ventas.length / canales.length) * 10)) : 0;
  const canalesDisponibles = obtenerCanalesDisponibles(canales);

  const chartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = Number(context.raw || 0);
          const data = context.dataset.data || [];
          const total = data.reduce((sum, item) => sum + Number(item), 0);
          const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

          return `${label}: ${value} productos (${porcentaje}%)`;
        },
      },
    },
  },
};

  return (
    <div className="space-y-6">
      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">Cargando dashboard desde MySQL...</p>
        </Card>
      )}

      {error && (
        <Card className="border border-yellow-200 bg-yellow-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-yellow-800">Aviso del sistema</p>
          <p className="mt-1 text-sm text-yellow-700">{error}</p>
        </Card>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
        <div className="grid gap-4 p-4 text-white lg:grid-cols-[1.5fr_1fr] lg:p-5">
          <div>
            <p className="text-sm font-semibold text-primary-200">
              Implementación PPC SOLUCIONES
            </p>

            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{empresa.nombre}</h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              {empresa.giro}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {canalesDisponibles.map((canal) => (
                <span
                  key={canal}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10"
                >
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
                <p className="mt-1 text-sm text-slate-300">
                  {empresa.objetivoPiloto || empresaFallback.objetivoPiloto}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-5" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">
              Implementación PPC SOLUCIONES
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-950">
              Centralización operativa
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Inventario, ventas, canales y alertas conectados con MySQL mediante API REST.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Empresa piloto', value: empresa.nombre },
              { label: 'Giro', value: 'Computadoras y accesorios' },
              { label: 'Canales', value: canalesDisponibles.length },
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

      <Card className="p-5" hover={false}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              Centro de notificaciones inteligentes
            </h3>

            <p className="text-sm text-slate-500">
              Alertas pendientes generadas desde la base de datos.
            </p>
          </div>

          <Bell className="text-yellow-600" size={24} />
        </div>

        {alertasPendientes.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {alertasPendientes.slice(0, 3).map((alerta) => (
              <div
                key={alerta.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {alerta.nivel || 'Media'}
                </p>

                <p className="mt-1 font-bold text-slate-950">
                  {alerta.tipo || 'Alerta'}
                </p>

                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {alerta.mensaje}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No hay alertas pendientes en este momento.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ventas totales"
          value={formatCurrency(totalVentas)}
          change={12.5}
          icon={TrendingUp}
          color="primary"
        />

        <StatCard
          title="Productos activos"
          value={productosActivos.length}
          change={8.2}
          icon={Package}
          color="accent"
        />

        <StatCard
          title="Órdenes completadas"
          value={ventasCompletadas}
          change={5.1}
          icon={ShoppingCart}
          color="green"
        />

        <StatCard
          title="Canales activos"
          value={canalesActivos}
          change={2.5}
          icon={Building2}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
  <Card className="p-5" hover={false}>
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-950">
          Ventas de la semana
        </h3>
        <p className="text-sm text-slate-500">
          Tendencia de ingresos registrados.
        </p>
      </div>

      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
        Canal líder: {canalLider}
      </span>
    </div>

    <div className="h-72">
      <LineChart data={ventasChartData} options={chartOptions} />
    </div>
  </Card>

  <Card className="p-5" hover={false}>
    <div className="mb-5">
      <h3 className="text-lg font-bold text-slate-950">
        Mix de productos
      </h3>
      <p className="text-sm text-slate-500">
        Distribución por categorías registradas.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="h-64">
        <DoughnutChart data={categoriasChartData} options={chartOptions} />
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {categoriasResumen.map((categoria) => (
          <div
            key={categoria.label}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded"
                style={{ backgroundColor: categoria.color }}
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {categoria.label}
                </p>

                <p className="text-xs text-slate-500">
                  {categoria.cantidad} productos
                </p>
              </div>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
              {categoria.porcentaje}%
            </span>
          </div>
        ))}
      </div>
    </div>
  </Card>
</div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          {
            label: 'Tasa de conversión',
            value: `${tasaConversion}%`,
            detail: canalLider,
            width: `${tasaConversion}%`,
            color: 'bg-primary-600',
          },
          {
            label: 'Ticket promedio',
            value: formatCurrency(ticketPromedio),
            detail: 'ventas reales',
            width: '58%',
            color: 'bg-violet-600',
          },
          {
            label: 'Alertas de stock',
            value: bajoStock,
            detail: `${alertasCriticas.length} críticas`,
            width: '72%',
            color: 'bg-orange-500',
          },
        ].map((item) => (
          <Card key={item.label} className="p-5" hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
              </div>

              {item.label === 'Alertas de stock' && (
                <AlertTriangle className="text-orange-500" size={22} />
              )}

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {item.detail}
              </span>
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