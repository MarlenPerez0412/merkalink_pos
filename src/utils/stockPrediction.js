// Actualmente se usan datos mock para MVP frontend.
// Esta lógica podrá conectarse a MySQL cuando exista backend y una API REST entregue métricas reales.

export const calcularDiasParaAgotarse = (producto) => {
  const promedioVentasDiarias = Number(producto.promedioVentasDiarias || 0);
  const stockActual = Number(producto.stock || 0);

  if (promedioVentasDiarias <= 0) return Infinity;

  return Number((stockActual / promedioVentasDiarias).toFixed(1));
};

export const obtenerNivelPrioridad = (producto) => {
  const diasParaAgotarse = calcularDiasParaAgotarse(producto);

  if (producto.stock < 5 || diasParaAgotarse <= 2) return 'Crítica';
  if (diasParaAgotarse <= 5) return 'Alta';
  if (producto.promedioVentasDiarias >= 2) return 'Recomendación';

  return 'Saludable';
};

export const generarAlertaStock = (producto) => {
  const diasParaAgotarse = calcularDiasParaAgotarse(producto);
  const prioridad = obtenerNivelPrioridad(producto);

  if (prioridad === 'Saludable') {
    return {
      id: `stock-${producto.id}`,
      tipo: 'Inventario saludable',
      titulo: `${producto.nombre} con stock estable`,
      mensaje: `Stock actual de ${producto.stock} unidades. No requiere acción inmediata.`,
      prioridad,
      icono: 'CheckCircle',
      tiempo: 'Sin urgencia',
      productoId: producto.id,
    };
  }

  if (producto.stock < 5) {
    return {
      id: `stock-${producto.id}`,
      tipo: 'Stock crítico',
      titulo: `${producto.nombre} por agotarse`,
      mensaje: `Quedan ${producto.stock} unidades. Según el ritmo de ventas, se recomienda reabastecer en las próximas ${diasParaAgotarse <= 2 ? '48 horas' : '72 horas'}.`,
      prioridad: 'Crítica',
      icono: 'PackageX',
      tiempo: `${diasParaAgotarse} días`,
      productoId: producto.id,
    };
  }

  if (diasParaAgotarse <= 5) {
    return {
      id: `stock-${producto.id}`,
      tipo: 'Predicción de stock',
      titulo: `${producto.nombre} con alta demanda`,
      mensaje: `El historial de ventas indica que este producto podría agotarse en ${diasParaAgotarse} días.`,
      prioridad,
      icono: 'Brain',
      tiempo: `${diasParaAgotarse} días`,
      productoId: producto.id,
    };
  }

  return {
    id: `stock-${producto.id}`,
    tipo: 'Reabastecimiento recomendado',
    titulo: `Adquirir ${producto.nombre} próximamente`,
    mensaje: `Se detectó aumento de ventas en ${producto.canalMasVendido}. Se sugiere comprar más unidades.`,
    prioridad,
    icono: 'TrendingUp',
    tiempo: 'Esta semana',
    productoId: producto.id,
  };
};

export const generarAlertasPredictivas = (productos) =>
  productos
    .filter((producto) => obtenerNivelPrioridad(producto) !== 'Saludable')
    .map(generarAlertaStock);
