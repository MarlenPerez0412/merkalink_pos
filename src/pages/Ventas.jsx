/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import { BarChart, Card, LineChart, defaultChartOptions } from '../components';
import { getCanales } from '../services/api/canalesApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getProductos } from '../services/api/productosApi';
import { createVenta, getVentas } from '../services/api/ventasApi';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getFechaKey = (fecha) => {
  const date = new Date(fecha);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const esMismaFecha = (fechaA, fechaB) => {
  return getFechaKey(fechaA) === getFechaKey(fechaB);
};

const filtrarVentasPorPeriodo = (ventas, periodo) => {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (periodo === 'Día') {
    return ventas.filter((venta) => esMismaFecha(venta.fecha, hoy));
  }

  const inicio = new Date(hoy);

  if (periodo === 'Semana') {
    inicio.setDate(hoy.getDate() - 6);
  }

  if (periodo === 'Mes') {
    inicio.setDate(hoy.getDate() - 60);
  }

  inicio.setHours(0, 0, 0, 0);

  return ventas.filter((venta) => {
    const fechaVenta = new Date(venta.fecha);
    return fechaVenta >= inicio && fechaVenta <= hoy;
  });
};

const generarVentasPorDia = (ventas, periodo) => {
  const hoy = new Date();

  const cantidadDias = periodo === 'Día' ? 1 : periodo === 'Semana' ? 7 : 60;

  const dias = Array.from({ length: cantidadDias }, (_, index) => {
    const date = new Date(hoy);
    date.setDate(hoy.getDate() - (cantidadDias - 1 - index));

    return {
      key: getFechaKey(date),
      label:
        periodo === 'Mes'
          ? date.toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
            })
          : diasSemana[date.getDay()],
      total: 0,
    };
  });

  ventas.forEach((venta) => {
    const key = getFechaKey(venta.fecha);
    const dia = dias.find((item) => item.key === key);

    if (dia) {
      dia.total += Number(venta.total || 0);
    }
  });

  return {
    labels: dias.map((item) => item.label),
    datasets: [
      {
        label: 'Ventas',
        data: dias.map((item) => item.total),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
};

const generarVentasPorCanal = (ventas) => {
  const canalesMap = ventas.reduce((acc, venta) => {
    const canal = venta.canal || 'Sin canal';
    acc[canal] = (acc[canal] || 0) + Number(venta.total || 0);
    return acc;
  }, {});

  return {
    labels: Object.keys(canalesMap),
    datasets: [
      {
        label: 'Ventas por canal',
        data: Object.values(canalesMap),
        backgroundColor: ['#0ea5e9', '#8b5cf6', '#ec4899', '#64748b', '#22c55e'],
        borderRadius: 8,
      },
    ],
  };
};

const ordenarVentasRecientes = (ventas) => {
  return [...ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

const Ventas = () => {
  const [periodo, setPeriodo] = useState('Semana');
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [canales, setCanales] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    productoId: '',
    canalId: '',
    cantidad: 1,
  });

  const cargarDatos = async () => {
    try {
      const [ventasData, productosData, canalesData, empresaData] = await Promise.all([
        getVentas(),
        getProductos(),
        getCanales(),
        getEmpresa(),
      ]);

      setVentas(ventasData || []);
      setProductos((productosData || []).filter((producto) => producto.estado !== 'Inactivo'));
      setCanales(canalesData || []);
      setEmpresa(empresaData || null);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las ventas desde MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const ventasFiltradas = useMemo(() => {
    return filtrarVentasPorPeriodo(ventas, periodo);
  }, [ventas, periodo]);

  const ventasRecientes = useMemo(() => {
    return ordenarVentasRecientes(ventasFiltradas);
  }, [ventasFiltradas]);

  const totalVentas = useMemo(() => {
    return ventasFiltradas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  }, [ventasFiltradas]);

  const ventasCompletadas = ventasFiltradas.length;

  const promedioPorOrden =
    ventasFiltradas.length > 0 ? totalVentas / ventasFiltradas.length : 0;

  const ventasPorDiaData = useMemo(() => {
    return generarVentasPorDia(ventasFiltradas, periodo);
  }, [ventasFiltradas, periodo]);

  const ventasPorCanalData = useMemo(() => {
    return generarVentasPorCanal(ventasFiltradas);
  }, [ventasFiltradas]);

  const textoPeriodo = {
    Día: 'Ventas registradas hoy.',
    Semana: 'Ventas registradas en los últimos 7 días.',
    Mes: 'Ventas registradas en los últimos 60 días.',
  };

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

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const productoId = Number(formData.productoId);
    const canalId = Number(formData.canalId);
    const cantidad = Number(formData.cantidad);

    if (!productoId || !canalId || !cantidad || cantidad <= 0) {
      setError('Selecciona producto, canal y una cantidad válida.');
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createVenta({
        productoId,
        canalId,
        cantidad,
      });

      setFormData({
        productoId: '',
        canalId: '',
        cantidad: 1,
      });

      await cargarDatos();

      setPeriodo('Día');
      setSuccess('Venta registrada correctamente. La gráfica y el stock fueron actualizados.');
    } catch (err) {
      setError(err.message || 'No se pudo registrar la venta.');
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Ventas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ingresos, órdenes y canales de {empresa?.nombre || 'PPC SOLUCIONES'}.
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {['Día', 'Semana', 'Mes'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriodo(item)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                periodo === item
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-red-700">Aviso del sistema</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="border border-green-200 bg-green-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-green-700">Operación exitosa</p>
          <p className="mt-1 text-sm text-green-600">{success}</p>
        </Card>
      )}

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">Cargando ventas desde MySQL...</p>
        </Card>
      )}

      <Card className="p-5" hover={false}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-950">Registrar venta</h3>
          <p className="text-sm text-slate-500">
            Al registrar una venta, se guarda en MySQL y se descuenta el stock del producto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Producto</span>
            <select
              value={formData.productoId}
              onChange={(event) => handleFieldChange('productoId', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              required
            >
              <option value="">Seleccionar producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} · Stock: {producto.stock}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Canal</span>
            <select
              value={formData.canalId}
              onChange={(event) => handleFieldChange('canalId', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              required
            >
              <option value="">Seleccionar canal</option>
              {canales.map((canal) => (
                <option key={canal.id} value={canal.id}>
                  {canal.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Cantidad</span>
            <input
              type="number"
              min="1"
              value={formData.cantidad}
              onChange={(event) => handleFieldChange('cantidad', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              required
            />
          </label>

          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Registrando...' : 'Registrar venta'}
            </button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: 'Total ventas',
            value: formatCurrency(totalVentas),
            detail: textoPeriodo[periodo],
            icon: TrendingUp,
            iconClass: 'bg-green-50 text-green-700',
          },
          {
            label: 'Órdenes completadas',
            value: ventasCompletadas,
            detail: `${ventasCompletadas} ventas en ${periodo.toLowerCase()}`,
            icon: CreditCard,
            iconClass: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Promedio por orden',
            value: formatCurrency(promedioPorOrden),
            detail: 'Calculado según el filtro seleccionado',
            icon: TrendingDown,
            iconClass: 'bg-violet-50 text-violet-700',
          },
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
          <h3 className="text-lg font-bold text-slate-950">
            Ventas por {periodo.toLowerCase()}
          </h3>
          <p className="mb-5 text-sm text-slate-500">{textoPeriodo[periodo]}</p>

          <div className="h-80">
            <LineChart data={ventasPorDiaData} options={chartOptions} />
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Ventas por canal</h3>
          <p className="mb-5 text-sm text-slate-500">
            Distribución de ventas según el filtro seleccionado.
          </p>

          <div className="h-80">
            <BarChart data={ventasPorCanalData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden" hover={false}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-950">
            Órdenes recientes · {periodo}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Orden', 'Producto', 'Canal', 'Cantidad', 'Total', 'Fecha'].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ventasRecientes.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-center text-sm text-slate-500">
                    No hay ventas registradas en este periodo.
                  </td>
                </tr>
              )}

              {ventasRecientes.map((venta) => (
                <tr key={venta.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    #{venta.id}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {venta.producto}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {venta.canal}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {venta.cantidad}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {formatCurrency(venta.total)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(venta.fecha).toLocaleString('es-MX')}
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