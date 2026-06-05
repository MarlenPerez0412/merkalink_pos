export const getEstadoStock = (producto, stockMinimoAlerta = 5) => {
  const stock = Number(producto?.stock || 0);

  if (producto?.estado === 'Inactivo') {
    return {
      label: 'Inactivo',
      disponible: false,
      className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    };
  }

  if (stock <= 0) {
    return {
      label: 'Stock no disponible',
      disponible: false,
      className: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    };
  }

  if (stock <= Math.max(1, Number(stockMinimoAlerta || 5) / 2)) {
    return {
      label: 'Stock critico',
      disponible: true,
      className: 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200',
    };
  }

  if (stock <= Number(stockMinimoAlerta || 5)) {
    return {
      label: 'Bajo stock',
      disponible: true,
      className: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    };
  }

  return {
    label: 'Disponible',
    disponible: true,
    className: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  };
};
