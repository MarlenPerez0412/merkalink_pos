/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CircleDollarSign,
  ClipboardCheck,
  ReceiptText,
} from 'lucide-react';
import { Card, DoughnutChart, LineChart, StatCard, defaultChartOptions } from '../components';
import { getAlertas } from '../services/api/alertasApi';
import { getCanales } from '../services/api/canalesApi';
import { getConfiguracion } from '../services/api/configuracionApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getProductos } from '../services/api/productosApi';
import { getVentas } from '../services/api/ventasApi';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const coloresCategorias = ['#0ea5e9', '#22c55e', '#f97316', '#ec4899', '#64748b', '#f59e0b'];

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const empresaFallback = {
  nombre: 'MercaLink POS',
  giro: 'Punto de venta para restaurantes y PyMEs mexicanas',
  objetivoPiloto:
    'Digitalizar ventas, caja, inventario y reportes para convertir datos transaccionales en decisiones estrategicas.',
};

const getFechaKey = (fecha) => new Date(fecha).toISOString().split('T')[0];

const generarVentasSemana = (ventas) => {
  const hoy = new Date();
  const ultimosDias = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(hoy);
    date.setDate(hoy.getDate() - (6 - index));

    return {
      key: getFechaKey(date),
      label: diasSemana[date.getDay()],
      total: 0,
    };
  });

  ventas.forEach((venta) => {
    const dia = ultimosDias.find((item) => item.key === getFechaKey(venta.fecha));
    if (dia) dia.total += Number(venta.total || 0);
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

const generarResumenCategorias = (productos) => {
  const categorias = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoria';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  const total = productos.length;
  return Object.entries(categorias)
    .map(([nombre, lista], index) => ({
      nombre,
      cantidad: lista.length,
      porcentaje: total > 0 ? Number(((lista.length / total) * 100).toFixed(1)) : 0,
      productos: lista.map((producto) => producto.nombre).filter(Boolean).slice(0, 6),
      color: coloresCategorias[index % coloresCategorias.length],
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
};

const generarCategoriasChart = (resumen) => {
  const labels = resumen.map((categoria) => categoria.nombre);

  return {
    labels,
    datasets: [
      {
        label: 'Productos',
        data: resumen.map((categoria) => categoria.cantidad),
        backgroundColor: resumen.map((categoria) => categoria.color),
        borderWidth: 0,
      },
    ],
  };
};

const obtenerProductosMasVendidos = (ventas) => {
  const acumulado = {};

  ventas.forEach((venta) => {
    String(venta.producto || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const [nombre, cantidadTexto] = item.split(' x');
        const cantidad = Number(cantidadTexto || 1);
        acumulado[nombre] = (acumulado[nombre] || 0) + cantidad;
      });
  });

  return Object.entries(acumulado)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
};

const Dashboard = () => {
  const [empresa, setEmpresa] = useState(empresaFallback);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [canales, setCanales] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [stockMinimoAlerta, setStockMinimoAlerta] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    try {
      const [empresaData, productosData, ventasData, canalesData, alertasData, configData] =
        await Promise.all([
          getEmpresa(),
          getProductos(),
          getVentas(),
          getCanales(),
          getAlertas(),
          getConfiguracion(),
        ]);

      setEmpresa({ ...empresaFallback, ...(empresaData || {}) });
      setProductos(productosData || []);
      setVentas(ventasData || []);
      setCanales(canalesData || []);
      setAlertas(alertasData || []);
      setStockMinimoAlerta(Number(configData?.stockMinimoAlerta ?? 5));
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos del dashboard desde MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosActivos = useMemo(
    () => productos.filter((producto) => producto.estado !== 'Inactivo'),
    [productos],
  );

  const hoyKey = getFechaKey(new Date());
  const ventasHoy = useMemo(
    () => ventas.filter((venta) => getFechaKey(venta.fecha) === hoyKey),
    [ventas, hoyKey],
  );

  const totalVentas = useMemo(
    () => ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0),
    [ventas],
  );

  const totalVentasHoy = useMemo(
    () => ventasHoy.reduce((sum, venta) => sum + Number(venta.total || 0), 0),
    [ventasHoy],
  );

  const bajoStock = useMemo(
    () => productosActivos.filter((producto) => Number(producto.stock || 0) <= stockMinimoAlerta).length,
    [productosActivos, stockMinimoAlerta],
  );

  const productosMasVendidos = useMemo(() => obtenerProductosMasVendidos(ventas), [ventas]);
  const ticketPromedio = ventas.length > 0 ? totalVentas / ventas.length : 0;
  const ventasChartData = useMemo(() => generarVentasSemana(ventas), [ventas]);
  const categoriasResumen = useMemo(() => generarResumenCategorias(productosActivos), [productosActivos]);
  const categoriasChartData = useMemo(() => generarCategoriasChart(categoriasResumen), [categoriasResumen]);
  const alertasPendientes = alertas.filter((alerta) => !['Vista', 'Resuelta'].includes(alerta.estado));
  const canalesDisponibles = canales.length ? canales.map((canal) => canal.nombre) : ['Punto de venta'];

  const chartOptions = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: { ...defaultChartOptions.plugins.legend, display: false },
    },
  };

  const categoriasChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = categoriasResumen[context.dataIndex];
            if (!item) return '';
            return `${item.nombre}: ${item.cantidad} productos (${item.porcentaje}%)`;
          },
          afterLabel: (context) => {
            const item = categoriasResumen[context.dataIndex];
            if (!item?.productos?.length) return '';
            return `Productos: ${item.productos.join(', ')}`;
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
        <div className="grid gap-4 p-5 text-white lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-primary-200">MercaLink POS</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{empresa.nombre}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{empresa.giro}</p>
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
            <p className="text-sm font-semibold text-white">Objetivo del piloto</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {empresa.objetivoPiloto || empresaFallback.objetivoPiloto}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Ventas totales" value={formatCurrency(totalVentas)} icon={CircleDollarSign} color="primary" />
        <StatCard title="Ventas de hoy" value={formatCurrency(totalVentasHoy)} icon={ReceiptText} color="green" />
        <StatCard title="Ordenes completadas" value={ventas.length} icon={ClipboardCheck} color="accent" />
        <StatCard title="Stock bajo" value={bajoStock} icon={AlertTriangle} color="orange" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5" hover={false}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Ventas de la semana</h3>
              <p className="text-sm text-slate-500">Tendencia de ingresos registrados.</p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              Ticket promedio: {formatCurrency(ticketPromedio)}
            </span>
          </div>
          <div className="h-72">
            <LineChart data={ventasChartData} options={chartOptions} />
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-950">Categorias de inventario</h3>
            <p className="text-sm text-slate-500">Distribucion de productos activos.</p>
          </div>
          {categoriasResumen.length === 0 ? (
            <div className="grid h-72 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No hay productos registrados para generar la grafica.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="h-72">
                <DoughnutChart data={categoriasChartData} options={categoriasChartOptions} />
              </div>
              <div className="max-h-72 space-y-3 overflow-auto pr-1">
                {categoriasResumen.map((categoria) => (
                  <div key={categoria.nombre} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                      />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">
                        {categoria.nombre}
                      </p>
                      <span className="text-xs font-bold text-slate-600">{categoria.porcentaje}%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{categoria.cantidad} productos activos</p>
                    {categoria.productos.length > 0 && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                        {categoria.productos.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Productos mas vendidos</h3>
          <div className="mt-4 space-y-3">
            {productosMasVendidos.length === 0 && (
              <p className="text-sm text-slate-500">Aun no hay ventas con detalle para calcular ranking.</p>
            )}
            {productosMasVendidos.map((producto, index) => (
              <div key={producto.nombre} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm font-semibold text-slate-800">
                  {index + 1}. {producto.nombre}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  {producto.cantidad} u
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Alertas operativas</h3>
              <p className="text-sm text-slate-500">Stock, inventario y avisos pendientes.</p>
            </div>
            <Bell className="text-yellow-600" size={24} />
          </div>
          <div className="space-y-3">
            {alertasPendientes.length === 0 && (
              <p className="text-sm text-slate-500">No hay alertas pendientes en este momento.</p>
            )}
            {alertasPendientes.slice(0, 4).map((alerta) => (
              <div key={alerta.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{alerta.nivel || 'Media'}</p>
                <p className="mt-1 font-bold text-slate-950">{alerta.tipo || 'Alerta'}</p>
                <p className="mt-2 text-sm text-slate-600">{alerta.mensaje}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
