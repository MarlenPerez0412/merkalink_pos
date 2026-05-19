import { productosData } from '../data/mockData';

export const mockPreciosDinamicos = productosData
  .filter((producto) => producto.precioSugerido)
  .map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria,
    precioBase: producto.precio,
    demanda: producto.demanda,
    precioCompetencia: producto.precioSugerido,
    costoLogistica: producto.stock < 5 ? 'Alto' : 'Medio',
  }));
