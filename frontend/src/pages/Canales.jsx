/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Edit2, Globe, Plus, Save, Store, Trash2, TrendingUp, X, XCircle } from 'lucide-react';
import { BarChart, Card, defaultChartOptions } from '../components';
import { createCanal, deleteCanal, getCanales, updateCanal } from '../services/api/canalesApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getVentas } from '../services/api/ventasApi';
import {
  activePanelTab,
  inactivePanelTab,
  tabButtonBase,
  tabGroupBase,
} from '../utils/uiStyles';


const estadoInicial = {
  nombre: '',
  tipo: 'Digital',
  estado: 'Activo',
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const normalizarEstado = (estado = '') => {
  const estadoLower = estado.toLowerCase();
  if (estadoLower === 'activo' || estadoLower === 'activa') return 'activo';
  return estadoLower || 'inactivo';
};

const obtenerPlataforma = (canal) => {
  const nombre = canal.nombre?.toLowerCase() || '';
  if (nombre.includes('whatsapp')) return 'WhatsApp Business';
  if (nombre.includes('facebook')) return 'Facebook';
  if (nombre.includes('instagram')) return 'Instagram';
  if (nombre.includes('didi')) return 'Didi Food';
  if (nombre.includes('uber')) return 'Uber Eats';
  if (nombre.includes('telefono')) return 'Telefono';
  if (nombre.includes('mostrador') || nombre.includes('punto')) return 'Mostrador';
  return canal.tipo || 'Origen comercial';
};

const Canales = () => {
  const [canales, setCanales] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('disponibles');
  const [canalEditando, setCanalEditando] = useState(null);
  const [formData, setFormData] = useState(estadoInicial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [origenEliminar, setOrigenEliminar] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [canalesData, ventasData, empresaData] = await Promise.all([
        getCanales(),
        getVentas(),
        getEmpresa(),
      ]);

      setCanales(canalesData || []);
      setVentas(ventasData || []);
      setEmpresa(empresaData || null);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los origenes de venta desde MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const canalesConMetricas = useMemo(() => {
    return canales.map((canal) => {
      const ventasCanal = ventas.filter((venta) => Number(venta.canalId || venta.canal_id) === Number(canal.id));
      const totalVentasCanal = ventasCanal.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
      const totalVendido = Number(canal.totalVendido ?? canal.total_vendido ?? totalVentasCanal);
      const totalOrdenes = Number(canal.totalVentas ?? canal.total_ventas ?? ventasCanal.length);
      const ventasOrdenadas = [...ventasCanal].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      return {
        ...canal,
        estadoNormalizado: normalizarEstado(canal.estado),
        plataforma: obtenerPlataforma(canal),
        ventas: totalVendido,
        ordenes: totalOrdenes,
        participacion: ventas.length > 0 ? Number(((totalOrdenes / ventas.length) * 100).toFixed(1)) : 0,
        ultimaSync: ventasOrdenadas[0]?.fecha
          ? `Ultima venta: ${new Date(ventasOrdenadas[0].fecha).toLocaleString('es-MX')}`
          : 'Sin ventas recientes',
      };
    });
  }, [canales, ventas]);

  const totalVentas = canalesConMetricas.reduce((sum, canal) => sum + canal.ventas, 0);
  const origenesActivos = canalesConMetricas.filter((canal) => canal.estadoNormalizado === 'activo').length;
  const ordenesRegistradas = canalesConMetricas.reduce((sum, canal) => sum + canal.ordenes, 0);
  const canalMasVendedor = [...canalesConMetricas].sort((a, b) => b.ventas - a.ventas)[0];

  const ventasPorOrigenData = {
    labels: canalesConMetricas.map((canal) => canal.nombre),
    datasets: [
      {
        label: 'Total vendido',
        data: canalesConMetricas.map((canal) => canal.ventas),
        backgroundColor: ['#facc15', '#22c55e', '#0ea5e9', '#ec4899', '#64748b', '#f97316', '#14b8a6'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: { ...defaultChartOptions.plugins.legend, display: false },
    },
  };

  const formTabLabel = canalEditando ? 'Editar origen' : 'Nuevo origen';
  const FormTabIcon = canalEditando ? Edit2 : Plus;

  const abrirNuevoOrigen = () => {
    setCanalEditando(null);
    setFormData(estadoInicial);
    setSeccionActiva('nuevo');
    setError('');
    setSuccess('');
  };

  const abrirEdicion = (canal) => {
    setCanalEditando(canal);
    setFormData({
      nombre: canal.nombre || '',
      tipo: canal.tipo || 'Digital',
      estado: canal.estado || 'Activo',
    });
    setSeccionActiva('nuevo');
    setError('');
    setSuccess('');
  };

  const cerrarFormulario = () => {
    setCanalEditando(null);
    setFormData(estadoInicial);
    setSeccionActiva('disponibles');
    setError('');
  };

  const handleChange = (campo, valor) => {
    setFormData((actual) => ({ ...actual, [campo]: valor }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.nombre.trim() || !formData.tipo.trim()) {
      setError('El nombre y el tipo del origen de venta son obligatorios.');
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (canalEditando) {
        const response = await updateCanal(canalEditando.id, formData);
        setSuccess(response?.message || 'Origen actualizado correctamente.');
      } else {
        const response = await createCanal(formData);
        setSuccess(response?.message || 'Origen agregado correctamente.');
      }

      await cargarDatos();
      cerrarFormulario();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el origen de venta.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!origenEliminar) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await deleteCanal(origenEliminar.id);
      await cargarDatos();
      setSuccess(
        origenEliminar.ordenes > 0
          ? 'Origen de venta desactivado correctamente. El historial de ventas se conservo.'
          : 'Origen de venta eliminado correctamente.',
      );
      setOrigenEliminar(null);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el origen de venta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Origen de venta</h2>
        <p className="mt-1 text-sm text-slate-500">
          Origenes de {empresa?.nombre || 'MercaLink POS'} para identificar de donde provienen las ventas.
        </p>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-red-700">Aviso del sistema</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="border border-green-200 bg-green-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-green-700">Operacion exitosa</p>
          <p className="mt-1 text-sm text-green-600">{success}</p>
        </Card>
      )}

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">Cargando origenes de venta desde MySQL...</p>
        </Card>
      )}

      <Card className="overflow-hidden" hover={false}>
        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <div className={`${tabGroupBase} m-2`}>
            {[
              { id: 'disponibles', label: 'Origenes disponibles', Icon: Store, action: () => setSeccionActiva('disponibles') },
              { id: 'nuevo', label: formTabLabel, Icon: FormTabIcon, action: abrirNuevoOrigen },
            ].map((tab) => {
              const Icon = tab.Icon;
              const activo = seccionActiva === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.action}
                  className={`${tabButtonBase} ${activo ? activePanelTab : inactivePanelTab}`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {seccionActiva === 'nuevo' && (
            <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-slate-950">
                {canalEditando ? 'Editar origen' : 'Nuevo origen'}
              </h3>
              <p className="mb-4 text-sm text-slate-500">
                {canalEditando
                  ? 'Modifica los datos del origen seleccionado.'
                  : 'Registra un origen como Mostrador, Sucursal Centro, Didi Food, Uber Eats, WhatsApp o Telefono.'}
              </p>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Nombre</span>
                  <input
                    value={formData.nombre}
                    onChange={(event) => handleChange('nombre', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Didi Food"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tipo</span>
                  <select
                    value={formData.tipo}
                    onChange={(event) => handleChange('tipo', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option>Digital</option>
                    <option>Presencial</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Estado</span>
                  <select
                    value={formData.estado}
                    onChange={(event) => handleChange('estado', event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </label>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? 'Guardando...' : canalEditando ? 'Actualizar origen' : 'Guardar origen'}
                  </button>

                  <button
                    type="button"
                    onClick={cerrarFormulario}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                  >
                    <XCircle size={16} />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {seccionActiva === 'disponibles' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">Origenes disponibles</h3>
                  <p className="text-sm text-slate-500">Lista de origenes conectados a ventas reales.</p>
                </div>
                <span className="text-sm font-semibold text-slate-500">{canalesConMetricas.length} origenes registrados</span>
              </div>

              {canalesConMetricas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No hay origenes registrados.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {canalesConMetricas.map((canal) => (
                    <Card key={canal.id} className="p-5" hover={false}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-slate-950">{canal.nombre}</h4>
                          <p className="text-sm text-slate-500">
                            {canal.plataforma} - {canal.ultimaSync}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                            canal.estadoNormalizado === 'activo'
                              ? 'bg-green-50 text-green-700 ring-green-200'
                              : 'bg-slate-100 text-slate-600 ring-slate-200'
                          }`}
                        >
                          {canal.estadoNormalizado}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Ordenes</p>
                          <p className="mt-1 text-xl font-bold text-slate-950">{canal.ordenes}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Ventas</p>
                          <p className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(canal.ventas)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Participacion</p>
                          <p className="mt-1 text-xl font-bold text-slate-950">{canal.participacion}%</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(canal)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <Edit2 size={16} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrigenEliminar(canal)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          {canal.ordenes > 0 ? 'Desactivar' : 'Eliminar'}
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Origenes activos', value: origenesActivos, icon: Globe, className: 'bg-primary-50 text-primary-700' },
          { label: 'Ventas registradas', value: ordenesRegistradas, icon: Store, className: 'bg-violet-50 text-violet-700' },
          { label: 'Ventas totales', value: formatCurrency(totalVentas), icon: TrendingUp, className: 'bg-green-50 text-green-700' },
          { label: 'Origen mas vendido', value: canalMasVendedor?.ventas > 0 ? canalMasVendedor.nombre : 'Sin ventas', icon: AlertCircle, className: 'bg-yellow-50 text-yellow-700' },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="p-5" hover={false}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 truncate text-2xl font-bold text-slate-950">{item.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${item.className}`}>
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5" hover={false}>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Ventas por origen</h3>
            <p className="text-sm text-slate-500">Metricas reales desde ventas y origenes registrados.</p>
          </div>
          {canalMasVendedor?.ventas > 0 && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-slate-900">
              Mas vendido: {canalMasVendedor.nombre}
            </span>
          )}
        </div>
        {totalVentas <= 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Aun no hay ventas registradas por origen.
          </div>
        ) : (
          <div className="h-80">
            <BarChart data={ventasPorOrigenData} options={chartOptions} />
          </div>
        )}
      </Card>

      <Card className="border-primary-200 bg-primary-50 p-5" hover={false}>
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-primary-700" size={22} />
          <div>
            <h3 className="font-bold text-slate-950">Origenes de venta del restaurante</h3>
            <p className="mt-1 text-sm text-slate-700">
              MercaLink POS centraliza Mostrador, sucursales, Didi Food, Uber Eats, WhatsApp, Facebook,
              Instagram y Telefono. En esta version las metricas se calculan con ventas reales.
            </p>
          </div>
        </div>
      </Card>

      {origenEliminar && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-50 p-3 text-red-600">
                <Trash2 size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-950">
                  {origenEliminar.ordenes > 0 ? 'Desactivar este origen de venta?' : 'Eliminar este origen de venta?'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {origenEliminar.ordenes > 0
                    ? 'Este origen tiene ventas relacionadas. Se conservara el historial y ya no podra seleccionarse para nuevas ventas si el backend lo desactiva.'
                    : 'Esta opcion desaparecera de la lista activa. El historial de ventas existente no se modifica.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrigenEliminar(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar confirmacion"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOrigenEliminar(null)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <XCircle size={16} />
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {saving ? 'Procesando...' : origenEliminar.ordenes > 0 ? 'Si, desactivar' : 'Si, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canales;
