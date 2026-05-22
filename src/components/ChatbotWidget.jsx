import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react';

import { chatbotConversacionesIniciales, empresaData } from '../data/mockData';
import { getUniversalBotResponse } from '../utils/chatbotResponses';
import { getProductos } from '../services/api/productosApi';
import { getVentas } from '../services/api/ventasApi';
import { getAlertas } from '../services/api/alertasApi';
import { getCanales } from '../services/api/canalesApi';
import { getServicios } from '../services/api/serviciosApi';
import { getEmpresa } from '../services/api/empresaApi';

const storageKey = 'merkalink-chatbot-messages';

const normalizarTexto = (texto = '') =>
  String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const formatearMoneda = (valor) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(valor || 0));

const obtenerLista = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getInitialMessages = () => {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  } catch {
    return chatbotConversacionesIniciales;
  }

  return chatbotConversacionesIniciales;
};

const generarRespuestaInteligente = async (mensaje) => {
  const texto = normalizarTexto(mensaje);

  try {
    if (
      texto.includes('stock alto') ||
      texto.includes('mucho stock') ||
      texto.includes('exceso') ||
      texto.includes('sobrante') ||
      texto.includes('productos con mas stock') ||
      texto.includes('productos con mayor stock') ||
      texto.includes('mayor stock') ||
      texto.includes('mas stock')
    ) {
      const data = await getProductos();
      const productos = obtenerLista(data, 'productos');

      if (productos.length === 0) {
        return 'No encontré productos registrados en inventario.';
      }

      const productosStockAlto = productos
        .filter((producto) => Number(producto.stock || 0) >= 10)
        .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));

      if (productosStockAlto.length === 0) {
        return 'No hay productos con stock alto actualmente. El inventario parece equilibrado.';
      }

      return `Estos productos tienen stock alto:\n\n${productosStockAlto
        .slice(0, 6)
        .map(
          (producto) =>
            `• ${producto.nombre}: ${producto.stock} unidades disponibles`,
        )
        .join(
          '\n',
        )}\n\nRecomendación: revisa si estos productos tienen baja rotación para crear promociones, paquetes o descuentos estratégicos.`;
    }

    if (
      texto.includes('stock bajo') ||
      texto.includes('stock critico') ||
      texto.includes('stock crítico') ||
      texto.includes('inventario bajo') ||
      texto.includes('reabastecer') ||
      texto.includes('agotarse') ||
      texto.includes('agotado')
    ) {
      const data = await getProductos();
      const productos = obtenerLista(data, 'productos');

      if (productos.length === 0) {
        return 'No encontré productos registrados en inventario.';
      }

      const productosCriticos = productos
        .filter((producto) => Number(producto.stock || 0) <= 5)
        .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));

      if (productosCriticos.length === 0) {
        return `El inventario se ve estable. Hay ${productos.length} productos registrados y ninguno tiene stock crítico.`;
      }

      return `Estos productos necesitan atención por stock bajo:\n\n${productosCriticos
        .slice(0, 6)
        .map(
          (producto) =>
            `• ${producto.nombre}: ${producto.stock} unidades disponibles`,
        )
        .join(
          '\n',
        )}\n\nRecomendación: prioriza el reabastecimiento de los productos con mayor demanda.`;
    }

    if (texto.includes('stock') || texto.includes('inventario')) {
      const data = await getProductos();
      const productos = obtenerLista(data, 'productos');

      if (productos.length === 0) {
        return 'No encontré productos registrados en inventario.';
      }

      const stockTotal = productos.reduce(
        (total, producto) => total + Number(producto.stock || 0),
        0,
      );

      const productosBajos = productos.filter(
        (producto) => Number(producto.stock || 0) <= 5,
      );

      const productosAltos = productos.filter(
        (producto) => Number(producto.stock || 0) >= 10,
      );

      return `Resumen de inventario:\n\n• Productos registrados: ${productos.length}\n• Stock total disponible: ${stockTotal} unidades\n• Productos con stock bajo: ${productosBajos.length}\n• Productos con stock alto: ${productosAltos.length}\n\nPuedes preguntarme: "stock bajo" o "stock alto" para ver el detalle.`;
    }

    if (
      texto.includes('venta') ||
      texto.includes('ventas') ||
      texto.includes('vendido') ||
      texto.includes('ingreso') ||
      texto.includes('dinero')
    ) {
      const data = await getVentas();
      const ventas = obtenerLista(data, 'ventas');

      if (ventas.length === 0) {
        return 'Todavía no hay ventas registradas en el sistema.';
      }

      const totalVentas = ventas.reduce(
        (total, venta) => total + Number(venta.total || 0),
        0,
      );

      const unidadesVendidas = ventas.reduce(
        (total, venta) => total + Number(venta.cantidad || 0),
        0,
      );

      const ventasPorProducto = ventas.reduce((acc, venta) => {
        const producto = venta.producto || 'Producto sin nombre';
        acc[producto] = (acc[producto] || 0) + Number(venta.cantidad || 0);
        return acc;
      }, {});

      const productoMasVendido = Object.entries(ventasPorProducto).sort(
        (a, b) => b[1] - a[1],
      )[0];

      return `Resumen de ventas:\n\n• Ventas registradas: ${ventas.length}\n• Unidades vendidas: ${unidadesVendidas}\n• Ingresos aproximados: ${formatearMoneda(totalVentas)}\n${
        productoMasVendido
          ? `• Producto más vendido: ${productoMasVendido[0]} (${productoMasVendido[1]} unidades)`
          : ''
      }`;
    }

    if (
      texto.includes('canal') ||
      texto.includes('facebook') ||
      texto.includes('instagram') ||
      texto.includes('whatsapp') ||
      texto.includes('tienda')
    ) {
      const [ventasData, canalesData] = await Promise.all([
        getVentas(),
        getCanales(),
      ]);

      const ventas = obtenerLista(ventasData, 'ventas');
      const canales = obtenerLista(canalesData, 'canales');

      const canalesActivos = canales.filter(
        (canal) => normalizarTexto(canal.estado || 'Activo') === 'activo',
      );

      if (ventas.length === 0) {
        return `Canales activos registrados:\n\n${
          canalesActivos.map((canal) => `• ${canal.nombre}`).join('\n') ||
          'No hay canales activos registrados.'
        }`;
      }

      const ventasPorCanal = ventas.reduce((acc, venta) => {
        const canal = venta.canal || 'Sin canal';
        acc[canal] = (acc[canal] || 0) + Number(venta.total || 0);
        return acc;
      }, {});

      const canalLider = Object.entries(ventasPorCanal).sort(
        (a, b) => b[1] - a[1],
      )[0];

      return `Análisis de canales:\n\n${
        canalLider
          ? `• Canal con mayor venta: ${canalLider[0]} con ${formatearMoneda(canalLider[1])}\n`
          : ''
      }• Canales activos: ${
        canalesActivos.map((canal) => canal.nombre).join(', ') ||
        'Sin canales activos'
      }`;
    }

    if (
      texto.includes('alerta') ||
      texto.includes('critica') ||
      texto.includes('crítica') ||
      texto.includes('riesgo')
    ) {
      const data = await getAlertas();
      const alertas = obtenerLista(data, 'alertas');

      if (alertas.length === 0) {
        return 'No hay alertas registradas actualmente.';
      }

      const alertasPendientes = alertas.filter(
        (alerta) => normalizarTexto(alerta.estado || '') !== 'vista',
      );

      const criticas = alertasPendientes.filter((alerta) => {
        const nivel = normalizarTexto(alerta.nivel || alerta.prioridad || '');
        return nivel.includes('critica') || nivel.includes('critico');
      });

      return `Estado de alertas:\n\n• Alertas totales: ${alertas.length}\n• Alertas pendientes: ${alertasPendientes.length}\n• Alertas críticas: ${criticas.length}\n\n${
        criticas.length > 0
          ? `Críticas detectadas:\n${criticas
              .slice(0, 5)
              .map((alerta) => `• ${alerta.mensaje || alerta.titulo}`)
              .join('\n')}`
          : 'No hay alertas críticas pendientes.'
      }`;
    }

    if (
      texto.includes('servicio') ||
      texto.includes('reparacion') ||
      texto.includes('reparación') ||
      texto.includes('entrega') ||
      texto.includes('pendiente')
    ) {
      const data = await getServicios();
      const servicios = obtenerLista(data, 'servicios');

      if (servicios.length === 0) {
        return 'No encontré servicios registrados actualmente.';
      }

      const pendientes = servicios.filter((servicio) => {
        const estado = normalizarTexto(servicio.estado || '');
        return (
          estado.includes('pendiente') ||
          estado.includes('proceso') ||
          estado.includes('revision') ||
          estado.includes('revisión')
        );
      });

      return `Resumen de servicios:\n\n• Servicios registrados: ${servicios.length}\n• Servicios pendientes o en proceso: ${pendientes.length}\n\n${
        pendientes.length > 0
          ? pendientes
              .slice(0, 5)
              .map(
                (servicio) =>
                  `• ${servicio.cliente || 'Cliente'} - ${
                    servicio.equipo || 'Equipo'
                  } (${servicio.estado || 'Pendiente'})`,
              )
              .join('\n')
          : 'No hay servicios pendientes detectados.'
      }`;
    }

    if (
      texto.includes('empresa') ||
      texto.includes('ppc') ||
      texto.includes('mision') ||
      texto.includes('misión') ||
      texto.includes('vision') ||
      texto.includes('visión')
    ) {
      const empresa = await getEmpresa();

      if (!empresa) {
        return 'PPC SOLUCIONES es la empresa piloto integrada en MercaLink AI. Su giro está relacionado con comercio, reparación y soporte de equipos electrónicos.';
      }

      return `Información de la empresa:\n\n• Nombre: ${
        empresa.nombre || 'PPC SOLUCIONES'
      }\n• Giro: ${
        empresa.giro || 'Comercio y soporte de equipos electrónicos'
      }\n• Teléfono: ${empresa.telefono || 'No registrado'}\n• Correo: ${
        empresa.correo || 'No registrado'
      }\n\nMercaLink AI ayuda a centralizar inventario, ventas, servicios y alertas para mejorar la toma de decisiones.`;
    }

    return getUniversalBotResponse(mensaje);
  } catch (error) {
    console.error('Error en MercaBot AI:', error);

    return 'Tuve un problema consultando la información en este momento. Aun así, puedo ayudarte con inventario, ventas, canales, alertas, servicios o datos de PPC SOLUCIONES.';
  }
};

const ChatbotWidget = ({ isOpen, onToggle }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(getInitialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSend = () => {
    const text = draft.trim();

    if (!text || isTyping) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        autor: 'usuario',
        texto: text,
      },
    ]);

    setDraft('');
    setIsTyping(true);

    timeoutRef.current = setTimeout(async () => {
      const respuesta = await generarRespuestaInteligente(text);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          autor: 'ia',
          texto: respuesta,
        },
      ]);

      setIsTyping(false);
    }, 550);
  };

  const clearConversation = () => {
    setMessages(chatbotConversacionesIniciales);
    setDraft('');
    window.localStorage.removeItem(storageKey);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-label="Abrir chatbot"
        onClick={onToggle}
        className="fixed bottom-6 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-2xl transition hover:bg-slate-800 sm:right-6"
      >
        <MessageSquare size={26} />
        <Sparkles size={16} className="absolute right-3 top-3" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 max-w-[calc(100vw-2rem)] sm:right-6">
      <div className="w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Bot size={21} />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">MercaBot AI</p>
              <p className="truncate text-xs text-slate-300">
                {empresaData.nombre} · datos del sistema
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar chatbot"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/15"
            onClick={onToggle}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[540px] max-h-[calc(100vh-9rem)] flex-col bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
            <p className="text-xs font-medium text-slate-500">
              Consulta inventario, ventas, alertas, canales y servicios
            </p>

            <button
              type="button"
              onClick={clearConversation}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Limpiar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4" ref={messageListRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.autor === 'ia' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.autor === 'ia'
                      ? 'border border-slate-200 bg-white text-slate-800'
                      : 'border border-primary-200 bg-primary-50 text-slate-950'
                  }`}
                >
                  {message.texto}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="mb-4 flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  MercaBot está consultando datos...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="Pregunta por stock, ventas, alertas..."
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || isTyping}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Send size={18} />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWidget;