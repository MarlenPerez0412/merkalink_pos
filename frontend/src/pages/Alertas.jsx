/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle,
  Mail,
  MailOpen,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Send,
  TrendingUp,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import { apiRequest } from '../services/api/apiClient';

const seccionesAlertas = [
  {
    id: 'todas',
    label: 'Todas',
    descripcion: 'Resumen general de alertas reales.',
    Icon: Bell,
    className: 'border-slate-200 bg-white text-slate-700',
  },
  {
    id: 'producto_agotado',
    label: 'Productos agotados',
    descripcion: 'Stock en cero.',
    Icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  {
    id: 'stock_bajo',
    label: 'Stock bajo',
    descripcion: 'Debajo del limite configurado.',
    Icon: TriangleAlert,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  },
  {
    id: 'reabastecimiento',
    label: 'Reabastecimiento',
    descripcion: 'Compra sugerida o alta demanda.',
    Icon: TrendingUp,
    className: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  {
    id: 'pendiente',
    label: 'Pendientes',
    descripcion: 'Por revisar o comprar.',
    Icon: Bell,
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    id: 'revisada',
    label: 'Revisadas',
    descripcion: 'Ya vistas por administrador.',
    Icon: CheckCircle,
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
];

const normalizarTexto = (texto = '') =>
  String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const obtenerNivel = (alerta) => alerta.nivel || alerta.prioridad || 'Advertencia';
const obtenerTipo = (alerta) => alerta.tipo || 'Alerta de inventario';
const obtenerProducto = (alerta) => alerta.producto || alerta.producto_nombre || 'Producto';
const obtenerFecha = (alerta) => alerta.fecha || alerta.fecha_creacion || alerta.created_at || new Date();
const obtenerEstado = (alerta) => alerta.estado || 'Pendiente';
const obtenerCategoria = (alerta) => alerta.categoria || 'Sin categoría';
const obtenerStock = (alerta) => Number(alerta.stockActual ?? alerta.stock_actual ?? 0);
const obtenerLimite = (alerta) => Number(alerta.limiteStock ?? alerta.limite_stock ?? 5);
const obtenerProveedor = (alerta) => alerta.proveedor || 'Sin proveedor asignado';
const obtenerProveedorTelefono = (alerta) => alerta.proveedorTelefono || alerta.proveedor_telefono || '';
const obtenerProveedorCorreo = (alerta) => alerta.proveedorCorreo || alerta.proveedor_correo || '';
const esRevisada = (alerta) => ['Revisada', 'Vista'].includes(obtenerEstado(alerta));
const esAtendida = (alerta) => ['Atendida', 'Resuelta'].includes(obtenerEstado(alerta));

const obtenerUsuarioActual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
};

const obtenerTitulo = (alerta) => {
  if (alerta.titulo) return alerta.titulo;
  return `${obtenerTipo(alerta)}: ${obtenerProducto(alerta)}`;
};

const obtenerMensaje = (alerta) =>
  alerta.mensaje || alerta.descripcion || `Revisa el producto ${obtenerProducto(alerta)} en inventario.`;

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

const alertaCoincideConSeccion = (alerta, seccionId) => {
  const tipo = normalizarTexto(obtenerTipo(alerta));
  const nivel = normalizarTexto(obtenerNivel(alerta));
  const titulo = normalizarTexto(obtenerTitulo(alerta));
  const estado = normalizarTexto(obtenerEstado(alerta));
  const mensaje = normalizarTexto(obtenerMensaje(alerta));
  const texto = `${tipo} ${nivel} ${titulo} ${estado} ${mensaje}`;

  if (seccionId === 'todas') return true;
  if (seccionId === 'producto_agotado') {
    return (
      texto.includes('producto agotado') ||
      texto.includes('agotado') ||
      texto.includes('sin stock') ||
      texto.includes('stock no disponible') ||
      obtenerStock(alerta) <= 0
    );
  }
  if (seccionId === 'stock_bajo') {
    return (
      !alertaCoincideConSeccion(alerta, 'producto_agotado') &&
      (texto.includes('stock bajo') || texto.includes('bajo stock') || obtenerStock(alerta) <= obtenerLimite(alerta))
    );
  }
  if (seccionId === 'reabastecimiento') {
    return texto.includes('reabastecimiento') || texto.includes('reabastecer') || texto.includes('alta demanda');
  }
  if (seccionId === 'pendiente') return estado.includes('pendiente');
  if (seccionId === 'revisada') return esRevisada(alerta);

  return false;
};

const obtenerConfigAlerta = (alerta) => {
  const estado = normalizarTexto(obtenerEstado(alerta));
  const texto = normalizarTexto(`${obtenerNivel(alerta)} ${obtenerTipo(alerta)} ${obtenerMensaje(alerta)} ${estado}`);

  if (estado.includes('atendida') || estado.includes('resuelta')) {
    return {
      icon: CheckCircle,
      stripe: 'bg-emerald-500',
      card: 'border-slate-200 bg-white',
      iconBox: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      button: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    };
  }

  if (estado.includes('revisada') || estado.includes('vista')) {
    return {
      icon: CheckCircle,
      stripe: 'bg-slate-400',
      card: 'border-slate-200 bg-white',
      iconBox: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
      badge: 'border-slate-200 bg-slate-100 text-slate-600',
      button: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    };
  }

  if (texto.includes('sin stock') || texto.includes('critica') || texto.includes('agotado')) {
    return {
      icon: XCircle,
      stripe: 'bg-red-500',
      card: 'border-slate-200 bg-white',
      iconBox: 'bg-red-50 text-red-600 ring-1 ring-red-200',
      badge: 'border-red-200 bg-red-50 text-red-700',
      button: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    };
  }

  if (texto.includes('alta demanda')) {
    return {
      icon: TrendingUp,
      stripe: 'bg-orange-500',
      card: 'border-slate-200 bg-white',
      iconBox: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
      badge: 'border-orange-200 bg-orange-50 text-orange-700',
      button: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    };
  }

  if (texto.includes('stock bajo') || texto.includes('advertencia')) {
    return {
      icon: TriangleAlert,
      stripe: 'bg-yellow-400',
      card: 'border-slate-200 bg-white',
      iconBox: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
      badge: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      button: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    };
  }

  return {
    icon: Package,
    stripe: 'bg-blue-500',
    card: 'border-slate-200 bg-white',
    iconBox: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    button: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  };
};

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajeCompra, setMensajeCompra] = useState('');
  const [correoCompra, setCorreoCompra] = useState(null);
  const [modalCompra, setModalCompra] = useState(null);
  const [linksCompra, setLinksCompra] = useState(null);
  const [error, setError] = useState('');

  const cargarAlertas = useCallback(async ({ mostrarCarga = true, recalcular = true } = {}) => {
    try {
      if (mostrarCarga) setCargando(true);
      setError('');

      /*
        Se agrega timestamp para evitar caché y forzar datos recientes.
        Esto ayuda a que Alertas tome cambios hechos en Configuración,
        especialmente proveedor, empresa y stock mínimo.
      */
      if (recalcular) {
        await apiRequest(`/alertas/actualizar?_=${Date.now()}`, { method: 'POST' });
      }

      const data = await apiRequest(`/alertas?_=${Date.now()}`);
      const lista = Array.isArray(data) ? data : data?.alertas || data?.data || [];

      setAlertas(lista);
      return lista;
    } catch (err) {
      setAlertas([]);
      setError(err.message || 'No se pudieron cargar las alertas desde MySQL.');
      return [];
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  useEffect(() => {
    const recargarAlertas = () => cargarAlertas({ mostrarCarga: false });

    window.addEventListener('empresaActualizada', recargarAlertas);
    window.addEventListener('proveedoresActualizados', recargarAlertas);
    window.addEventListener('configuracionActualizada', recargarAlertas);
    window.addEventListener('alertasActualizadas', recargarAlertas);

    return () => {
      window.removeEventListener('empresaActualizada', recargarAlertas);
      window.removeEventListener('proveedoresActualizados', recargarAlertas);
      window.removeEventListener('configuracionActualizada', recargarAlertas);
      window.removeEventListener('alertasActualizadas', recargarAlertas);
    };
  }, [cargarAlertas]);

  const actualizarAlertas = async () => {
    try {
      setActualizando(true);
      setMensaje('');
      setError('');
      await cargarAlertas();
      window.dispatchEvent(new Event('alertasActualizadas'));
      setMensaje('Alertas recalculadas con productos reales.');
    } catch (err) {
      setError(err.message || 'No se pudieron actualizar las alertas.');
    } finally {
      setActualizando(false);
    }
  };

  const marcarComoVisto = async (alerta) => {
    const id = alerta.id || alerta.alerta_id;
    if (!id) return;

    try {
      await apiRequest(`/alertas/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'Revisada' }),
      });

      setAlertas((actuales) =>
        actuales.map((item) => ((item.id || item.alerta_id) === id ? { ...item, estado: 'Revisada' } : item)),
      );

      setMensaje('Alerta marcada como revisada.');
    } catch (err) {
      setError(err.message || 'No se pudo marcar la alerta como revisada.');
    }
  };

  const actualizarEstado = async (alerta, estado, textoExito) => {
    const id = alerta.id || alerta.alerta_id;
    if (!id) return;

    try {
      await apiRequest(`/alertas/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
      });

      setAlertas((actuales) =>
        actuales.map((item) => ((item.id || item.alerta_id) === id ? { ...item, estado } : item)),
      );

      setMensaje(textoExito);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la alerta.');
    }
  };

  const solicitarCompra = async (alerta) => {
    try {
      setLinksCompra(null);
      setMensajeCompra('');
      setCorreoCompra(null);
      setError('');

      const id = alerta.id || alerta.alerta_id;

      /*
        Antes de abrir el modal, recargamos las alertas desde backend.
        Así el modal no usa datos viejos guardados en memoria.
      */
      const listaActualizada = await cargarAlertas({ mostrarCarga: false });

      const alertaActualizada =
        listaActualizada.find((item) => (item.id || item.alerta_id) === id) || alerta;

      setModalCompra(alertaActualizada);
    } catch (err) {
      setModalCompra(alerta);
      setError(err.message || 'No se pudieron actualizar los datos de la alerta.');
    }
  };

  const ejecutarSolicitudCompra = async (medio) => {
    const alerta = modalCompra;
    const id = alerta?.id || alerta?.alerta_id;
    if (!id) return;

    try {
      const usuarioActual = obtenerUsuarioActual();

      /*
        Antes de generar WhatsApp/Gmail/correo, se vuelve a recargar.
        Esto asegura que el backend use proveedor, empresa y configuración recientes.
      */
      const listaActualizada = await cargarAlertas({ mostrarCarga: false });

      const alertaActualizada =
        listaActualizada.find((item) => (item.id || item.alerta_id) === id) || alerta;

      setModalCompra(alertaActualizada);

      const data = await apiRequest(`/alertas/${id}/solicitar-compra`, {
        method: 'PUT',
        body: JSON.stringify({
          medio,
          usuarioId: usuarioActual?.id || null,
          productoId: alertaActualizada.producto_id || alertaActualizada.productoId || null,
          proveedorId: alertaActualizada.proveedor_id || alertaActualizada.proveedorId || null,
        }),
      });

      setAlertas((actuales) =>
        actuales.map((item) =>
          (item.id || item.alerta_id) === id ? { ...item, estado: 'Pendiente de compra' } : item,
        ),
      );

      setMensajeCompra(data.mensajeCompra || '');

      setCorreoCompra(
        data.mailtoUrl || data.gmailUrl
          ? {
              mailtoUrl: data.mailtoUrl,
              gmailUrl: data.gmailUrl,
              correo: data.proveedorCorreo,
              asunto: data.correoAsunto,
              cuerpo: data.correoCuerpo,
            }
          : null,
      );

      setLinksCompra({
        whatsappUrl: data.whatsappUrl || '',
        gmailUrl: data.gmailUrl || '',
        mailtoUrl: data.mailtoUrl || '',
        medio,
      });

      setMensaje(data.mensaje || 'Producto marcado como pendiente de compra.');

      if (medio === 'WhatsApp' && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      if (medio === 'Gmail' && data.gmailUrl) {
        window.open(data.gmailUrl, '_blank', 'noopener,noreferrer');
      }

      if (medio === 'Correo predeterminado' && data.mailtoUrl) {
        window.location.href = data.mailtoUrl;
      }

      if (data.mensajeCompra && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.mensajeCompra);
      }
    } catch (err) {
      setError(err.message || 'No se pudo preparar la solicitud de compra.');
    }
  };

  const alertasFiltradas = useMemo(() => {
    if (filtroActivo === 'todas') return alertas;
    if (filtroActivo === 'revisada') return alertas.filter(esRevisada);

    return alertas.filter((alerta) => alertaCoincideConSeccion(alerta, filtroActivo));
  }, [alertas, filtroActivo]);

  const metricas = useMemo(() => {
    const activas = alertas.filter((alerta) => !esRevisada(alerta) && !esAtendida(alerta));

    const criticas = activas.filter((alerta) => {
      const texto = normalizarTexto(`${obtenerNivel(alerta)} ${obtenerTipo(alerta)}`);
      return texto.includes('critica') || texto.includes('sin stock') || texto.includes('agotado');
    }).length;

    const bajoStock = activas.filter((alerta) => normalizarTexto(obtenerTipo(alerta)).includes('stock bajo')).length;
    const altaDemanda = activas.filter((alerta) => {
      const tipo = normalizarTexto(obtenerTipo(alerta));
      return tipo.includes('alta demanda') || tipo.includes('reabastecimiento');
    }).length;

    return {
      total: alertas.length,
      activas: activas.length,
      criticas,
      bajoStock,
      altaDemanda,
    };
  }, [alertas]);

  const fichasAlertas = useMemo(() => {
    const activas = alertas.filter((alerta) => !esRevisada(alerta) && !esAtendida(alerta));
    return seccionesAlertas.map((seccion) => {
      const registros = alertas.filter((alerta) => alertaCoincideConSeccion(alerta, seccion.id));
      const registrosActivos = activas.filter((alerta) => alertaCoincideConSeccion(alerta, seccion.id));

      return {
        ...seccion,
        total: registros.length,
        activas: registrosActivos.length,
        productos: registros.slice(0, 3),
      };
    });
  }, [alertas]);

  return (
    <section className="alertas-page space-y-6 rounded-2xl p-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell size={30} className="text-slate-950" />
            <h1 className="text-3xl font-bold text-slate-950">Alertas de inventario</h1>
          </div>
          <p className="mt-1 text-slate-500">
            Alertas reales del POS para stock, productos agotados y demanda del restaurante.
          </p>
        </div>

        <button
          type="button"
          onClick={actualizarAlertas}
          disabled={actualizando}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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

      {modalCompra && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Solicitar compra al proveedor</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Elige el medio para contactar al proveedor. El sistema no envía mensajes automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalCompra(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2">
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-500">Producto</span>
                <strong className="text-slate-950">{obtenerProducto(modalCompra)}</strong>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-500">Proveedor</span>
                <strong className="text-slate-950">{obtenerProveedor(modalCompra)}</strong>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-500">Stock actual</span>
                <strong className="text-slate-950">{obtenerStock(modalCompra)} unidades</strong>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-500">Límite configurado</span>
                <strong className="text-slate-950">{obtenerLimite(modalCompra)} unidades</strong>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-500">Teléfono WhatsApp</span>
                <strong className="text-slate-950">{obtenerProveedorTelefono(modalCompra) || 'Sin teléfono'}</strong>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-500">Correo electrónico</span>
                <strong className="text-slate-950">{obtenerProveedorCorreo(modalCompra) || 'Sin correo'}</strong>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => ejecutarSolicitudCompra('WhatsApp')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => ejecutarSolicitudCompra('Gmail')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Mail size={18} />
                Gmail
              </button>
              <button
                type="button"
                onClick={() => ejecutarSolicitudCompra('Correo predeterminado')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                <MailOpen size={18} />
                Correo predeterminado
              </button>
              <button
                type="button"
                onClick={() => ejecutarSolicitudCompra('Ambas opciones')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-yellow-300"
              >
                <Send size={18} />
                Ambas opciones
              </button>
              <button
                type="button"
                onClick={() => setModalCompra(null)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <XCircle size={18} />
                Cancelar
              </button>
            </div>

            {linksCompra && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <p className="font-semibold text-slate-950">Enlaces preparados</p>
                <p className="mt-1 text-slate-500">
                  Si el navegador bloqueó alguna ventana, abre manualmente el medio correspondiente.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {linksCompra.whatsappUrl && (
                    <a
                      href={linksCompra.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 font-semibold text-green-700 hover:bg-green-100"
                    >
                      <Phone size={16} />
                      Abrir WhatsApp
                    </a>
                  )}
                  {linksCompra.gmailUrl && (
                    <a
                      href={linksCompra.gmailUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      <Mail size={16} />
                      Abrir Gmail
                    </a>
                  )}
                  {linksCompra.mailtoUrl && (
                    <a
                      href={linksCompra.mailtoUrl}
                      className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-semibold text-sky-700 hover:bg-sky-100"
                    >
                      <MailOpen size={16} />
                      Abrir correo predeterminado
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mensajeCompra && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-950">Mensaje de compra preparado</p>
            <button
              type="button"
              onClick={() => {
                setMensajeCompra('');
                setCorreoCompra(null);
              }}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            >
              X
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-5">{mensajeCompra}</pre>
          {(correoCompra?.mailtoUrl || correoCompra?.gmailUrl) && (
            <button
              type="button"
              onClick={() => {
                if (correoCompra.gmailUrl) window.open(correoCompra.gmailUrl, '_blank', 'noopener,noreferrer');
                else window.location.href = correoCompra.mailtoUrl;
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Mail size={16} />
              Preparar correo
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total', metricas.total, Bell, 'text-slate-950'],
          ['Activas', metricas.activas, CheckCircle, 'text-blue-600'],
          ['Críticas', metricas.criticas, XCircle, 'text-red-600'],
          ['Stock bajo', metricas.bajoStock, TriangleAlert, 'text-yellow-600'],
          ['Alta demanda', metricas.altaDemanda, TrendingUp, 'text-orange-600'],
        ].map(([label, value, Icon, color]) => (
          <div key={label} className="alerta-metric rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                <Icon size={19} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 pt-3">
          <div className="flex min-w-max gap-2">
            {fichasAlertas.map((ficha) => {
              const Icon = ficha.Icon;
              const activa = filtroActivo === ficha.id;

              return (
                <button
                  key={ficha.id}
                  type="button"
                  onClick={() => setFiltroActivo(ficha.id)}
                  className={`inline-flex items-center gap-2 rounded-t-lg border px-4 py-3 text-sm font-bold transition ${
                    activa
                      ? 'border-slate-200 border-b-white bg-white text-slate-950'
                      : 'border-transparent bg-transparent text-slate-500 hover:bg-white/70 hover:text-slate-950'
                  }`}
                >
                  <Icon size={17} />
                  {ficha.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activa ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ficha.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </section>

      {cargando ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando alertas...
        </div>
      ) : alertasFiltradas.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center text-green-700 shadow-sm">
          No hay alertas activas en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {alertasFiltradas.map((alerta) => {
            const config = obtenerConfigAlerta(alerta);
            const Icon = config.icon;
            const id = alerta.id || alerta.alerta_id || `${obtenerTitulo(alerta)}-${obtenerFecha(alerta)}`;
            const vista = esRevisada(alerta);
            const atendida = esAtendida(alerta);

            return (
              <article
                key={id}
                className={`alerta-card relative overflow-hidden rounded-xl border p-5 pl-6 shadow-sm transition ${config.card} ${
                  vista ? 'opacity-70' : ''
                }`}
              >
                <span className={`absolute inset-y-0 left-0 w-1.5 ${config.stripe}`} aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 rounded-xl p-3 ${config.iconBox}`}>
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
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {obtenerEstado(alerta)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-950">{obtenerTitulo(alerta)}</h3>
                    <p className="mt-3 leading-relaxed text-slate-700">{obtenerMensaje(alerta)}</p>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
                      <div className="alerta-detail rounded-lg border border-slate-200 bg-white/70 p-2.5">
                        <span className="block font-semibold text-slate-500">Categoría</span>
                        {obtenerCategoria(alerta)}
                      </div>
                      <div className="alerta-detail rounded-lg border border-slate-200 bg-white/70 p-2.5">
                        <span className="block font-semibold text-slate-500">Stock actual</span>
                        {obtenerStock(alerta)} unidades
                      </div>
                      <div className="alerta-detail rounded-lg border border-slate-200 bg-white/70 p-2.5">
                        <span className="block font-semibold text-slate-500">Límite configurado</span>
                        {obtenerLimite(alerta)} unidades
                      </div>
                      <div className="alerta-detail rounded-lg border border-slate-200 bg-white/70 p-2.5">
                        <span className="block font-semibold text-slate-500">Fecha</span>
                        {formatearFecha(obtenerFecha(alerta))}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => solicitarCompra(alerta)}
                        disabled={vista}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${config.button}`}
                      >
                        Solicitar compra
                      </button>
                      <button
                        type="button"
                        onClick={() => marcarComoVisto(alerta)}
                        disabled={vista}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {vista ? 'Revisada' : 'Marcar como revisada'}
                      </button>
                      <button
                        type="button"
                        onClick={() => actualizarEstado(alerta, 'Atendida', 'Alerta marcada como atendida.')}
                        disabled={vista || atendida}
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Marcar atendida
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
