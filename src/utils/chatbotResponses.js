import {
  canalesData,
  empresaData,
  productosAltaDemanda,
  productosData,
  serviciosData,
  ventasData,
} from '../data/mockData';
import { calcularDiasParaAgotarse, obtenerNivelPrioridad } from './stockPrediction';

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const includesAny = (text, keywords) =>
  keywords.some((keyword) => text.includes(normalizeText(keyword)));

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);

const getCriticalProducts = () =>
  productosData
    .filter((producto) => obtenerNivelPrioridad(producto) === 'Crítica')
    .slice(0, 4);

const getTopChannel = () =>
  canalesData.reduce((top, canal) => (canal.ventas > top.ventas ? canal : top), canalesData[0]);

const getTotalSales = () => ventasData.reduce((sum, venta) => sum + venta.monto, 0);

const intents = [
  {
    name: 'saludo',
    keywords: ['hola', 'buen dia', 'buenos dias', 'buenas', 'hey', 'que tal'],
    response: () =>
      `Hola. Soy MercaBot AI y puedo ayudarte con inventario, ventas, canales, servicios, precios y alertas de ${empresaData.nombre}.`,
  },
  {
    name: 'ayuda',
    keywords: ['ayuda', 'que puedes hacer', 'opciones', 'comandos', 'como funciona', 'orientame'],
    response: () =>
      'Puedo responder sobre stock crítico, productos más vendidos, ventas por canal, servicios pendientes, precios sugeridos, recomendaciones IA y datos de PPC SOLUCIONES.',
  },
  {
    name: 'stock',
    keywords: ['stock', 'inventario', 'existencias', 'agotado', 'agotarse', 'disponible', 'unidades'],
    response: () => {
      const products = getCriticalProducts();
      const names = products.map((producto) => producto.nombre).join(', ');
      return `Detecté productos con stock crítico en PPC SOLUCIONES: ${names}. Te recomiendo reabastecerlos pronto.`;
    },
  },
  {
    name: 'reabastecimiento',
    keywords: ['reabastecer', 'comprar mas', 'comprar más', 'resurtir', 'pedido proveedor', 'orden de compra'],
    response: () => {
      const products = getCriticalProducts()
        .map((producto) => `${producto.nombre} (${producto.stock} unidades)`)
        .join(', ');
      return `Recomendación IA: reabastecer ${products} antes de que lleguen a stock cero.`;
    },
  },
  {
    name: 'ventas',
    keywords: ['ventas', 'ingresos', 'ordenes', 'órdenes', 'pedidos', 'facturacion', 'facturación', 'monto'],
    response: () => {
      const total = getTotalSales();
      const topChannel = getTopChannel();
      return `Las ventas mock actuales suman ${formatCurrency(total)}. El canal con mayor ingreso es ${topChannel.nombre}, por lo que conviene reforzar la atención rápida ahí.`;
    },
  },
  {
    name: 'canales',
    keywords: ['canal', 'canales', 'whatsapp', 'facebook', 'instagram', 'tienda fisica', 'tienda física'],
    response: () => {
      const sorted = [...canalesData].sort((a, b) => b.ventas - a.ventas);
      return `El canal más activo actualmente es ${sorted[0].nombre}, seguido de ${sorted[1].nombre} e ${sorted[2].nombre}.`;
    },
  },
  {
    name: 'precios',
    keywords: ['precio', 'precios', 'precio sugerido', 'subir precio', 'bajar precio', 'margen'],
    response: () => {
      const suggested = productosData
        .filter((producto) => producto.precioSugerido > producto.precio)
        .slice(0, 3)
        .map((producto) => `${producto.nombre}: ${formatCurrency(producto.precioSugerido)}`)
        .join(', ');
      return `Según ventas y stock, podrías revisar precios sugeridos en productos de alta demanda: ${suggested}.`;
    },
  },
  {
    name: 'producto_mas_vendido',
    keywords: ['producto mas vendido', 'producto más vendido', 'mas vendido', 'más vendido', 'top producto', 'mayor demanda'],
    response: () => {
      const [first, second] = productosAltaDemanda;
      return `El producto más vendido actualmente es ${first.producto}, seguido de ${second.producto}.`;
    },
  },
  {
    name: 'servicios',
    keywords: ['servicio', 'servicios', 'reparacion', 'reparación', 'entrega', 'pendiente', 'mantenimiento', 'diagnostico', 'diagnóstico'],
    response: () => {
      const pending = serviciosData
        .slice(0, 3)
        .map((servicio) => `${servicio.equipo}: ${servicio.estado}, entrega ${servicio.fechaEntrega} ${servicio.horaEntrega}`)
        .join('; ');
      return `Servicios pendientes: ${pending}.`;
    },
  },
  {
    name: 'alertas',
    keywords: ['alerta', 'alertas', 'critico', 'crítico', 'riesgo', 'notificacion', 'notificación'],
    response: () => {
      const alerts = productosData
        .filter((producto) => obtenerNivelPrioridad(producto) !== 'Saludable')
        .slice(0, 4)
        .map((producto) => `${producto.nombre} (${obtenerNivelPrioridad(producto)}, ${calcularDiasParaAgotarse(producto)} días)`)
        .join(', ');
      return `Alertas principales: ${alerts}.`;
    },
  },
  {
    name: 'empresa',
    keywords: ['empresa', 'ppc', 'ppc soluciones', 'giro', 'direccion', 'dirección', 'telefono', 'teléfono', 'correo'],
    response: () =>
      `${empresaData.nombre} se dedica a ${empresaData.giro}. Dirección: ${empresaData.direccion}. Teléfono: ${empresaData.telefono}. Correo: ${empresaData.correo}.`,
  },
  {
    name: 'gracias',
    keywords: ['gracias', 'ok gracias', 'perfecto', 'entendido', 'muy bien'],
    response: () =>
      'Con gusto. Puedo seguir ayudándote a revisar inventario, ventas, servicios, canales o recomendaciones IA.',
  },
];

export const getUniversalBotResponse = (message) => {
  const text = normalizeText(message);
  const intent = intents.find((item) => includesAny(text, item.keywords));

  if (intent) return intent.response();

  return 'Puedo ayudarte a analizar inventario, ventas, canales, alertas, servicios, precios dinámicos y recomendaciones para PPC SOLUCIONES. Prueba preguntando por stock, ventas, servicios pendientes o producto más vendido.';
};
