/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Edit2,
  Globe,
  Plus,
  Radio,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button, Card } from '../components';
import {
  createCanal,
  deleteCanal,
  getCanales,
  updateCanal,
} from '../services/api/canalesApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getProductos } from '../services/api/productosApi';
import { getVentas } from '../services/api/ventasApi';

const estadoInicial = {
  nombre: '',
  tipo: 'Red social',
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

  if (estadoLower === 'activo') return 'activo';
  if (estadoLower === 'activa') return 'activo';

  return estadoLower || 'inactivo';
};

const obtenerPlataforma = (canal) => {
  const nombre = canal.nombre?.toLowerCase() || '';
  const tipo = canal.tipo || '';

  if (nombre.includes('whatsapp')) return 'WhatsApp Business';
  if (nombre.includes('facebook')) return 'Facebook Marketplace';
  if (nombre.includes('instagram')) return 'Instagram';
  if (nombre.includes('tienda')) return 'Punto de venta local';
  if (nombre.includes('web')) return 'Tienda web';
  if (nombre.includes('tiktok')) return 'TikTok Shop';

  return tipo || 'Canal comercial';
};

const Canales = () => {
  const [canales, setCanales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [empresa, setEmpresa] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [canalEditando, setCanalEditando] = useState(null);
  const [formData, setFormData] = useState(estadoInicial);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const [canalesData, productosData, ventasData, empresaData] =
        await Promise.all([
          getCanales(),
          getProductos(),
          getVentas(),
          getEmpresa(),
        ]);

      setCanales(canalesData || []);
      setProductos(productosData || []);
      setVentas(ventasData || []);
      setEmpresa(empresaData || null);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los canales desde MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const canalesConMetricas = useMemo(() => {
    return canales.map((canal) => {
      const ventasCanal = ventas.filter((venta) => venta.canalId === canal.id);

      const totalVentasCanal = ventasCanal.reduce(
        (sum, venta) => sum + Number(venta.total || 0),
        0,
      );

      const productosRelacionados = productos.filter(
        (producto) => producto.canalMasVendido === canal.nombre,
      );

      const productosSincronizados = productosRelacionados.length;

      const conversion =
        ventas.length > 0
          ? Number(((ventasCanal.length / ventas.length) * 100).toFixed(1))
          : 0;

      const ventasOrdenadas = [...ventasCanal].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha),
      );

      return {
        ...canal,
        estadoNormalizado: normalizarEstado(canal.estado),
        plataforma: obtenerPlataforma(canal),
        productos: productosSincronizados,
        ventas: totalVentasCanal,
        conversion,
        ultimaSync: ventasOrdenadas[0]?.fecha
          ? `Última venta: ${new Date(ventasOrdenadas[0].fecha).toLocaleString(
              'es-MX',
            )}`
          : 'Sin ventas recientes',
      };
    });
  }, [canales, productos, ventas]);

  const totalVentas = canalesConMetricas.reduce(
    (sum, canal) => sum + canal.ventas,
    0,
  );

  const canalesActivos = canalesConMetricas.filter(
    (canal) => canal.estadoNormalizado === 'activo',
  ).length;

  const productosSincronizados = canalesConMetricas.reduce(
    (sum, canal) => sum + canal.productos,
    0,
  );

  const abrirNuevoCanal = () => {
    setCanalEditando(null);
    setFormData(estadoInicial);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const abrirEdicion = (canal) => {
    setCanalEditando(canal);
    setFormData({
      nombre: canal.nombre || '',
      tipo: canal.tipo || 'Red social',
      estado: canal.estado || 'Activo',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setCanalEditando(null);
    setFormData(estadoInicial);
    setError('');
  };

  const handleChange = (campo, valor) => {
    setFormData((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.nombre.trim() || !formData.tipo.trim()) {
      setError('El nombre y el tipo del canal son obligatorios.');
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (canalEditando) {
        await updateCanal(canalEditando.id, formData);
        setSuccess('Canal actualizado correctamente.');
      } else {
        await createCanal(formData);
        setSuccess('Canal creado correctamente.');
      }

      await cargarDatos();
      cerrarFormulario();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el canal.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (canal) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar o desactivar el canal "${canal.nombre}"?`,
    );

    if (!confirmar) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await deleteCanal(canal.id);
      await cargarDatos();

      setSuccess('Canal desactivado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el canal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Canales de venta
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Canales disponibles para el piloto de{' '}
            {empresa?.nombre || 'PPC SOLUCIONES'}.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevoCanal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Nuevo canal
        </button>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-red-700">Aviso del sistema</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="border border-green-200 bg-green-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-green-700">
            Operación exitosa
          </p>
          <p className="mt-1 text-sm text-green-600">{success}</p>
        </Card>
      )}

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">
            Cargando canales desde MySQL...
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: 'Canales activos',
            value: canalesActivos,
            icon: Globe,
            className: 'bg-primary-50 text-primary-700',
          },
          {
            label: 'Productos sincronizados',
            value: productosSincronizados,
            icon: Radio,
            className: 'bg-violet-50 text-violet-700',
          },
          {
            label: 'Ventas totales',
            value: formatCurrency(totalVentas),
            icon: TrendingUp,
            className: 'bg-green-50 text-green-700',
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="p-5" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {item.value}
                  </p>
                </div>

                <div className={`rounded-lg p-3 ${item.className}`}>
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">
            {canalEditando ? 'Editar canal' : 'Nuevo canal'}
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            {canalEditando
              ? 'Actualiza la información del canal seleccionado.'
              : 'Registra un nuevo canal de venta para PPC SOLUCIONES.'}
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input
                value={formData.nombre}
                onChange={(event) => handleChange('nombre', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="WhatsApp"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tipo</span>
              <select
                value={formData.tipo}
                onChange={(event) => handleChange('tipo', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option>Red social</option>
                <option>Marketplace</option>
                <option>Tienda física</option>
                <option>Web</option>
                <option>Canal comercial</option>
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

            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Guardando...'
                  : canalEditando
                    ? 'Actualizar canal'
                    : 'Guardar canal'}
              </button>

              <Button type="button" variant="outline" onClick={cerrarFormulario}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {canalesConMetricas.map((canal) => (
          <Card key={canal.id} className="p-5" hover={false}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {canal.nombre}
                </h3>
                <p className="text-sm text-slate-500">
                  {canal.plataforma} · {canal.ultimaSync}
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

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Productos</p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {canal.productos}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Ventas</p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {formatCurrency(canal.ventas)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Conversión</p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {canal.conversion}%
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => abrirEdicion(canal)}
              >
                <Edit2 size={16} />
                Editar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleEliminar(canal)}
              >
                <Trash2 size={16} />
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-primary-200 bg-primary-50 p-5" hover={false}>
        <div className="flex gap-3">
          <AlertCircle
            className="mt-0.5 flex-shrink-0 text-primary-700"
            size={22}
          />

          <div>
            <h3 className="font-bold text-slate-950">
              Sincronización del piloto
            </h3>

            <p className="mt-1 text-sm text-slate-700">
              MercaLink AI centraliza WhatsApp, Facebook, Instagram y tienda
              física. En esta versión, los canales se consultan desde MySQL y
              las métricas se calculan con ventas reales registradas en el
              sistema.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Canales;