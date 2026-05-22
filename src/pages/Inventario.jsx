/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';

import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
} from '../services/api/productosApi';

const categoriasBase = [
  'Accesorios',
  'Cómputo',
  'Servicios',
  'Impresoras',
  'Refacciones',
  'Componentes',
  'Cargadores',
  'Fundas',
  'Micas',
  'Audífonos',
  'Cables',
];

const productoInicial = {
  sku: '',
  nombre: '',
  categoria: 'Accesorios',
  precio: '',
  stock: '',
  demanda: 'Media',
};

const formatearMoneda = (valor) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(valor || 0));

const calcularEstado = (stock) => {
  const stockNumero = Number(stock);

  if (stockNumero < 5) return 'Stock crítico';
  if (stockNumero < 10) return 'Riesgo de agotamiento';

  return 'Activo';
};

const calcularPrecioSugerido = (precio, demanda) => {
  const precioNumero = Number(precio || 0);

  if (demanda === 'Alta') return Math.round(precioNumero * 1.12);
  if (demanda === 'Media') return Math.round(precioNumero * 1.05);

  return precioNumero;
};

const normalizarProducto = (producto) => ({
  id: producto.id,
  sku: producto.sku || '',
  nombre: producto.nombre || '',
  categoria: producto.categoria || producto.categoria_nombre || 'Sin categoría',
  precio: Number(producto.precio || 0),
  stock: Number(producto.stock || 0),
  demanda: producto.demanda || 'Media',
  estado: producto.estado || 'Activo',
  precioSugerido: producto.precioSugerido || producto.precio_sugerido || null,
  promedioVentasDiarias:
    producto.promedioVentasDiarias || producto.promedio_ventas_diarias || 0,
});

const Inventario = () => {
  const [searchParams] = useSearchParams();

  const [productos, setProductos] = useState([]);
  const [formProducto, setFormProducto] = useState(productoInicial);
  const [productoEditando, setProductoEditando] = useState(null);

  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState(searchParams.get('buscar') || '');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getProductos();
      const lista = Array.isArray(data) ? data : data?.productos || [];

      setProductos(lista.map(normalizarProducto));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    const busquedaUrl = searchParams.get('buscar') || '';

    if (busquedaUrl) {
      setBusqueda(busquedaUrl);
    }
  }, [searchParams]);

  const productosActivos = useMemo(() => {
    return productos.filter((producto) => producto.estado !== 'Inactivo');
  }, [productos]);

  const categorias = useMemo(() => {
    const categoriasDinamicas = productosActivos
      .map((producto) => producto.categoria)
      .filter(Boolean);

    return ['Todos', ...new Set([...categoriasBase, ...categoriasDinamicas])];
  }, [productosActivos]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productosActivos.filter((producto) => {
      const coincideCategoria =
        categoriaActiva === 'Todos' || producto.categoria === categoriaActiva;

      const coincideBusqueda =
        texto === '' ||
        String(producto.nombre || '').toLowerCase().includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  }, [productosActivos, categoriaActiva, busqueda]);

  const productosBajoStock = useMemo(() => {
    return productosActivos.filter(
      (producto) => producto.stock > 0 && producto.stock <= 5,
    );
  }, [productosActivos]);

  const productosAgotados = useMemo(() => {
    return productosActivos.filter((producto) => producto.stock <= 0);
  }, [productosActivos]);

  const stockTotal = useMemo(() => {
    return productosActivos.reduce(
      (total, producto) => total + Number(producto.stock || 0),
      0,
    );
  }, [productosActivos]);

  const alertaStock = useMemo(() => {
    const productosCriticos = [...productosBajoStock, ...productosAgotados];

    if (productosCriticos.length === 0) return '';

    return productosCriticos
      .slice(0, 5)
      .map((producto) => producto.nombre)
      .join(', ');
  }, [productosBajoStock, productosAgotados]);

  const limpiarFormulario = () => {
    setFormProducto(productoInicial);
    setProductoEditando(null);
    setMostrarFormulario(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNuevoProducto = () => {
    setProductoEditando(null);
    setFormProducto({
      ...productoInicial,
      sku: `PPC-NEW-${String(productos.length + 1).padStart(3, '0')}`,
    });
    setMostrarFormulario(true);
  };

  const handleEditar = (producto) => {
    setProductoEditando(producto);

    setFormProducto({
      sku: producto.sku,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
      stock: String(producto.stock),
      demanda: producto.demanda,
    });

    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuardar = async (event) => {
    event.preventDefault();

    const sku = formProducto.sku.trim();
    const nombre = formProducto.nombre.trim();
    const precio = Number(formProducto.precio);
    const stock = Number(formProducto.stock);

    if (!sku) {
      setError('El SKU es obligatorio.');
      return;
    }

    if (!nombre) {
      setError('El nombre del producto es obligatorio.');
      return;
    }

    if (Number.isNaN(precio) || precio < 0) {
      setError('El precio debe ser un número válido.');
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      setError('El stock debe ser un número válido.');
      return;
    }

    const productoEnviar = {
      sku,
      nombre,
      categoria: formProducto.categoria,
      precio,
      stock,
      demanda: formProducto.demanda,
      precioSugerido: calcularPrecioSugerido(precio, formProducto.demanda),
      promedioVentasDiarias: productoEditando?.promedioVentasDiarias || 0,
      estado: calcularEstado(stock),
    };

    try {
      setGuardando(true);
      setError('');

      if (productoEditando) {
        await updateProducto(productoEditando.id, productoEnviar);
      } else {
        await createProducto(productoEnviar);
      }

      limpiarFormulario();
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (producto) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el producto "${producto.nombre}"?`,
    );

    if (!confirmar) return;

    try {
      setError('');
      await deleteProducto(producto.id);
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el producto.');
    }
  };

  const handleExportar = () => {
    const encabezados = [
      'SKU',
      'Producto',
      'Categoría',
      'Precio',
      'Stock',
      'Demanda',
      'Estado',
    ];

    const filas = productosFiltrados.map((producto) => [
      producto.sku,
      producto.nombre,
      producto.categoria,
      producto.precio,
      producto.stock,
      producto.demanda,
      producto.estado,
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map((valor) => `"${valor ?? ''}"`).join(','))
      .join('\n');

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventario-mercalink-ai.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Inventario</h1>
          <p className="mt-1 text-slate-500">
            Control de stock y productos de PPC SOLUCIONES.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportar}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download size={18} />
            Exportar
          </button>

          <button
            type="button"
            onClick={handleNuevoProducto}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>
            <X size={18} />
          </button>
        </div>
      )}

      {alertaStock && (
        <div className="flex items-start gap-4 rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4 text-yellow-800">
          <TriangleAlert className="mt-1 flex-shrink-0" size={22} />

          <div>
            <h3 className="font-bold">Alerta de stock</h3>
            <p className="mt-1">
              {alertaStock} están en nivel crítico para PPC SOLUCIONES.
            </p>
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {productoEditando ? 'Editar producto' : 'Agregar producto'}
              </h2>
              <p className="text-sm text-slate-500">
                Registra o actualiza productos del inventario.
              </p>
            </div>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleGuardar}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">SKU</span>
              <input
                type="text"
                name="sku"
                value={formProducto.sku}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="PPC-NEW-001"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Nombre
              </span>
              <input
                type="text"
                name="nombre"
                value={formProducto.nombre}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Producto"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Categoría
              </span>
              <select
                name="categoria"
                value={formProducto.categoria}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >
                {categoriasBase.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Precio
              </span>
              <input
                type="number"
                name="precio"
                value={formProducto.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="0.00"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Stock
              </span>
              <input
                type="number"
                name="stock"
                value={formProducto.stock}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="0"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Demanda
              </span>
              <select
                name="demanda"
                value={formProducto.demanda}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </label>

            <div className="flex gap-3 md:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-slate-950 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando
                  ? 'Guardando...'
                  : productoEditando
                    ? 'Actualizar'
                    : 'Agregar'}
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoriaActiva(categoria)}
                className={`rounded-lg px-4 py-2 font-medium transition ${
                  categoriaActiva === categoria
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>

          <div className="relative w-full xl:w-80">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar producto por nombre"
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-20 outline-none focus:border-slate-900"
            />

            {busqueda && (
              <button
                type="button"
                onClick={limpiarBusqueda}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-950"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Filter size={17} />
            Total productos
          </div>
          <p className="mt-3 text-3xl font-bold">{productosActivos.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Filter size={17} />
            Stock total
          </div>
          <p className="mt-3 text-3xl font-bold">{stockTotal}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Filter size={17} />
            Bajo stock
          </div>
          <p className="mt-3 text-3xl font-bold text-yellow-600">
            {productosBajoStock.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Filter size={17} />
            Agotados
          </div>
          <p className="mt-3 text-3xl font-bold text-red-600">
            {productosAgotados.length}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Cargando productos...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5 font-semibold text-slate-500">
                      {producto.sku}
                    </td>

                    <td className="px-6 py-5 font-semibold text-slate-950">
                      {producto.nombre}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        {producto.categoria}
                      </span>
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      {formatearMoneda(producto.precio)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          producto.stock <= 0
                            ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                            : producto.stock <= 5
                              ? 'bg-yellow-50 text-yellow-600 ring-1 ring-yellow-200'
                              : 'bg-green-50 text-green-600 ring-1 ring-green-200'
                        }`}
                      >
                        {producto.stock} u
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditar(producto)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          <Edit size={17} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEliminar(producto)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Mostrando {productosFiltrados.length} de {productosActivos.length}{' '}
          productos
        </div>
      </section>
    </div>
  );
};

export default Inventario;