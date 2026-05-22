/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Brain,
  CheckCircle,
  Package,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { apiRequest } from '../services/api/apiClient';

const filtros = ['Todas', 'Crítica', 'Alta', 'Advertencia', 'Recomendación', 'Media', 'Saludable'];

const normalizarTexto = (texto = '') =>
  String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const obtenerNivel = (alerta) =>
  alerta.nivel || alerta.prioridad || alerta.severidad || alerta.tipo || 'Media';

const obtenerTitulo = (alerta) =>
  alerta.titulo || alerta.nombre || alerta.asunto || 'Alerta inteligente';

const obtenerMensaje = (alerta) =>
  alerta.mensaje || alerta.descripcion || alerta.detalle || 'Revisión recomendada del sistema.';

const obtenerFecha = (alerta) =>
  alerta.fecha || alerta.fecha_creacion || alerta.createdAt || alerta.created_at || new Date();

const obtenerTipo = (alerta) =>
  alerta.tipo || alerta.categoria || alerta.clasificacion || obtenerNivel(alerta);

const formatearFecha = (fecha) => {
  try {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Fecha no disponible';
  }
};

const obtenerConfigAlerta = (alerta) => {
  const texto = normalizarTexto(`${obtenerNivel(alerta)} ${obtenerTipo(alerta)} ${obtenerTitulo(alerta)}`);

  if (texto.includes('critica') || texto.includes('stock critico') || texto.includes('agotado')) {
    return {
      icon: Package,
      card: 'border-red-200 bg-red-50',
      iconBox: 'bg-red-100 text-red-600',
      badge: 'border-red-200 bg-red-100 text-red-700',
      title: 'text-red-950',
      button: 'border-red-200 bg-white text-red-700 hover:bg-red-100',
    };
  }

  if (texto.includes('alta') || texto.includes('prediccion')) {
    return {
      icon: Package,
      card: 'border-orange-200 bg-orange-50',
      iconBox: 'bg-orange-100 text-orange-600',
      badge: 'border-orange-200 bg-orange-100 text-orange-700',
      title: 'text-orange-950',
      button: 'border-orange-200 bg-white text-orange-700 hover:bg-orange-100',
    };
  }

  if (texto.includes('recomendacion') || texto.includes('reabastecimiento')) {
    return {
      icon: TrendingUp,
      card: 'border-violet-200 bg-violet-50',
      iconBox: 'bg-violet-100 text-violet-600',
      badge: 'border-violet-200 bg-violet-100 text-violet-700',
      title: 'text-violet-950',
      button: 'border-violet-200 bg-white text-violet-700 hover:bg-violet-100',
    };
  }

  if (texto.includes('advertencia') || texto.includes('servicio')) {
    return {
      icon: Wrench,
      card: 'border-yellow-200 bg-yellow-50',
      iconBox: 'bg-yellow-100 text-yellow-700',
      badge: 'border-yellow-200 bg-yellow-100 text-yellow-700',
      title: 'text-yellow-950',
      button: 'border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-100',
    };
  }

  if (texto.includes('saludable')) {
    return {
      icon: CheckCircle,
      card: 'border-green-200 bg-green-50',
      iconBox: 'bg-green-100 text-green-700',
      badge: 'border-green-200 bg-green-100 text-green-700',
      title: 'text-green-950',
      button: 'border-green-200 bg-white text-green-700 hover:bg-green-100',
    };
  }

  return {
    icon: Bell,
    card: 'border-slate-200 bg-white',
    iconBox: 'bg-slate-100 text-slate-700',
    badge: 'border-slate-200 bg-slate-100 text-slate-700',
    title: 'text-slate-950',
    button: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
  };
};

const generarAlertasDemo = () => [
  {
    id: 'demo-1',
    tipo: 'Predicción de stock',
    nivel: 'Alta',
    titulo: 'Predicción de stock: Mica templada',
    mensaje: 'Mica templada podría agotarse en 2 días según el ritmo de ventas.',
    fecha: new Date(),
  },
  {
    id: 'demo-2',
    tipo: 'Reabastecimiento recomendado',
    nivel: 'Recomendación',
    titulo: 'Reabastecimiento recomendado: Cable Lightning',
    mensaje: 'Cable Lightning presenta aumento de ventas en Instagram y WhatsApp.',
    fecha: new Date(),
  },
  {
    id: 'demo-3',
    tipo: 'Stock crítico',
    nivel: 'Crítica',
    titulo: 'Stock crítico: Funda Samsung',
    mensaje: 'Funda Samsung tiene stock bajo. Se recomienda revisar inventario.',
    fecha: new Date(),
  },
];

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarAlertas = useCallback(async () => {
    try {
      setCargando(true);
      setMensaje('');

      const data = await apiRequest('/alertas');

      const alertasNormalizadas = Array.isArray(data)
        ? data
        : data?.alertas || data?.data || [];

      setAlertas(alertasNormalizadas.length > 0 ? alertasNormalizadas : generarAlertasDemo());
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      setAlertas(generarAlertasDemo());
      setMensaje('No se pudieron cargar las alertas desde MySQL. Se muestran alertas demo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  const actualizarAlertas = async () => {
    try {
      setActualizando(true);
      await cargarAlertas();
      setMensaje('Alertas actualizadas correctamente.');
    } finally {
      setActualizando(false);
    }
  };

  const alertasFiltradas = useMemo(() => {
    if (filtroActivo === 'Todas') return alertas;

    return alertas.filter((alerta) => {
      const nivel = normalizarTexto(obtenerNivel(alerta));
      const tipo = normalizarTexto(obtenerTipo(alerta));
      const titulo = normalizarTexto(obtenerTitulo(alerta));
      const filtro = normalizarTexto(filtroActivo);

      return nivel.includes(filtro) || tipo.includes(filtro) || titulo.includes(filtro);
    });
  }, [alertas, filtroActivo]);

  const metricas = useMemo(() => {
    const total = alertas.length;

    const criticas = alertas.filter((alerta) => {
      const texto = normalizarTexto(`${obtenerNivel(alerta)} ${obtenerTipo(alerta)} ${obtenerTitulo(alerta)}`);
      return texto.includes('critica') || texto.includes('stock critico') || texto.includes('agotado');
    }).length;

    const recomendaciones = alertas.filter((alerta) => {
      const texto = normalizarTexto(`${obtenerNivel(alerta)} ${obtenerTipo(alerta)} ${obtenerTitulo(alerta)}`);
      return texto.includes('recomendacion') || texto.includes('reabastecimiento');
    }).length;

    const saludables = alertas.filter((alerta) => {
      const texto = normalizarTexto(`${obtenerNivel(alerta)} ${obtenerTipo(alerta)} ${obtenerTitulo(alerta)}`);
      return texto.includes('saludable');
    }).length;

    return {
      total,
      criticas,
      recomendaciones,
      saludables,
    };
  }, [alertas]);

  const marcarComoVisto = (id) => {
    setAlertas((actuales) => actuales.filter((alerta) => alerta.id !== id));
    setMensaje('Alerta marcada como vista.');
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell className="text-yellow-600" size={36} />
            <h1 className="text-3xl font-bold text-slate-950">
              Alertas inteligentes
            </h1>
          </div>

          <p className="mt-1 text-slate-500">
            Notificaciones predictivas del negocio piloto PPC SOLUCIONES.
          </p>
        </div>

        <button
          type="button"
          onClick={actualizarAlertas}
          disabled={actualizando}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} className={actualizando ? 'animate-spin' : ''} />
          {actualizando ? 'Actualizando...' : 'Actualizar alertas'}
        </button>
      </div>

      {mensaje && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Bell size={16} />
            Total alertas
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">{metricas.total}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Trash2 size={16} />
            Críticas
          </div>
          <p className="mt-4 text-3xl font-bold text-red-600">{metricas.criticas}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Brain size={16} />
            Recomendaciones IA
          </div>
          <p className="mt-4 text-3xl font-bold text-violet-600">
            {metricas.recomendaciones}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <CheckCircle size={16} />
            Saludables
          </div>
          <p className="mt-4 text-3xl font-bold text-green-600">{metricas.saludables}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              type="button"
              onClick={() => setFiltroActivo(filtro)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroActivo === filtro
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando alertas...
        </div>
      ) : alertasFiltradas.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center text-green-700 shadow-sm">
          No hay alertas para el filtro seleccionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {alertasFiltradas.map((alerta) => {
            const config = obtenerConfigAlerta(alerta);
            const Icon = config.icon;
            const id = alerta.id || alerta.alerta_id || `${obtenerTitulo(alerta)}-${obtenerFecha(alerta)}`;

            return (
              <article
                key={id}
                className={`rounded-xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${config.card}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${config.iconBox}`}>
                    <Icon size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        {obtenerTipo(alerta)}
                      </span>

                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}>
                        {obtenerNivel(alerta)}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold ${config.title}`}>
                      {obtenerTitulo(alerta)}
                    </h3>

                    <p className="mt-3 leading-relaxed text-slate-700">
                      {obtenerMensaje(alerta)}
                    </p>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold text-slate-500">
                        {formatearFecha(obtenerFecha(alerta))}
                      </p>

                      <button
                        type="button"
                        onClick={() => marcarComoVisto(id)}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${config.button}`}
                      >
                        Marcar como visto
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Alertas;