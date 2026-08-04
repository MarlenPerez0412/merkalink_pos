/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Edit,
  Eye,
  Filter,
  Grid3X3,
  ImageOff,
  ImageIcon,
  List,
  Package,
  PackagePlus,
  Plus,
  Save,
  Search,
  Tags,
  Trash2,
  TriangleAlert,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  uploadProductoImagen,
} from '../services/api/productosApi';
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../services/api/categoriasApi';
import { getConfiguracion } from '../services/api/configuracionApi';
import { getProveedores } from '../services/api/proveedoresApi';
import { getExternalImageUrlCandidate, getImageSrc } from '../utils/images';
import { getEstadoStock } from '../utils/stock';
import {
  activePanelTab,
  inactivePanelTab,
  tabButtonBase,
  tabGroupBase,
} from '../utils/uiStyles';



const MAX_PRODUCT_IMAGE_SIZE = 10 * 1024 * 1024;
const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const productoInicial = {
  sku: '',
  codigoBarras: '',
  imagenUrl: '',
  nombre: '',
  categoria: 'Comidas',
  proveedorId: '',
  precio: '',
  stock: '',
  demanda: 'Media',
};

const formatearMoneda = (valor) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(valor || 0));

const calcularEstado = () => 'Activo';

const calcularPrecioSugerido = (precio, demanda) => {
  const precioNumero = Number(precio || 0);
  if (demanda === 'Alta') return Math.round(precioNumero * 1.12);
  if (demanda === 'Media') return Math.round(precioNumero * 1.05);
  return precioNumero;
};

const normalizarProducto = (producto) => ({
  id: producto.id,
  sku: producto.sku || '',
  codigoBarras: producto.codigoBarras || producto.codigo_barras || '',
  imagenUrl: producto.imagenUrl || producto.imagen_url || '',
  nombre: producto.nombre || '',
  categoria: producto.categoria || producto.categoria_nombre || 'Sin categoria',
  proveedorId: producto.proveedorId || producto.proveedor_id || null,
  proveedor: producto.proveedor || '',
  proveedorTelefono: producto.proveedorTelefono || producto.proveedor_telefono || '',
  precio: Number(producto.precio || 0),
  stock: Number(producto.stock || 0),
  demanda: producto.demanda || 'Media',
  estado: producto.estado || 'Activo',
  precioSugerido: producto.precioSugerido || producto.precio_sugerido || null,
  promedioVentasDiarias: producto.promedioVentasDiarias || producto.promedio_ventas_diarias || 0,
});

const PlaceholderImagen = ({ className = 'h-12 w-12' }) => (
  <div className={`grid place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[10px] font-semibold leading-tight text-slate-400 ${className}`}>
    <span>Sin imagen</span>
  </div>
);

const Inventario = () => {
  const [searchParams] = useSearchParams();
  const [tabActiva, setTabActiva] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [categoriasDb, setCategoriasDb] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [stockMinimoAlerta, setStockMinimoAlerta] = useState(5);
  const [formProducto, setFormProducto] = useState(productoInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [vistaProductos, setVistaProductos] = useState('tarjetas');
  const [formCategoria, setFormCategoria] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState(searchParams.get('buscar') || '');
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imagenModificada, setImagenModificada] = useState(false);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [eliminandoCategoriaId, setEliminandoCategoriaId] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [categoriaVista, setCategoriaVista] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      const lista = Array.isArray(data) ? data : data?.productos || [];
      setProductos(lista.map(normalizarProducto));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoadingCategorias(true);
      const data = await getCategorias();
      const categorias = Array.isArray(data) ? data : [];
      const categoriasActivas = categorias.filter((categoria) => {
        const estado = String(categoria.estado || 'Activo').toLowerCase();
        return categoria?.nombre && Number(categoria.activo ?? 1) !== 0 && estado !== 'inactivo';
      });
      const categoriasUnicas = Array.from(
        new Map(categoriasActivas.map((categoria) => [categoria.nombre.trim().toLowerCase(), categoria])).values(),
      );
      setCategoriasDb(categoriasUnicas);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las categorias.');
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  const recargarInventario = useCallback(async () => {
    await Promise.all([
      cargarProductos(),
      cargarCategorias(),
      getProveedores().then(setProveedores).catch(() => setProveedores([])),
      getConfiguracion().then((config) => setStockMinimoAlerta(Number(config?.stockMinimoAlerta || 5))).catch(() => setStockMinimoAlerta(5)),
    ]);
  }, [cargarProductos, cargarCategorias]);

  useEffect(() => {
    recargarInventario();
  }, [recargarInventario]);

  useEffect(() => {
    const recargarProveedores = () => {
      getProveedores().then(setProveedores).catch(() => setProveedores([]));
    };

    window.addEventListener('proveedoresActualizados', recargarProveedores);

    return () => {
      window.removeEventListener('proveedoresActualizados', recargarProveedores);
    };
  }, []);

  useEffect(() => {
    const busquedaUrl = searchParams.get('buscar') || '';
    if (busquedaUrl) setBusqueda(busquedaUrl);
  }, [searchParams]);

  const productosActivos = useMemo(
    () => productos.filter((producto) => producto.estado !== 'Inactivo'),
    [productos],
  );

  const categoriasOpciones = useMemo(() => {
    const categoriasMysql = categoriasDb.map((categoria) => categoria.nombre).filter(Boolean);
    return [...new Set(categoriasMysql)];
  }, [categoriasDb]);

  const totalCategoriasActivas = categoriasDb.length;

  const categoriasFiltradas = useMemo(() => {
    const texto = busquedaCategoria.trim().toLowerCase();
    if (!texto) return categoriasDb;

    return categoriasDb.filter((categoria) =>
      String(categoria.nombre || '').toLowerCase().includes(texto),
    );
  }, [categoriasDb, busquedaCategoria]);

  useEffect(() => {
    if (categoriaActiva !== 'Todos' && !categoriasOpciones.includes(categoriaActiva)) {
      setCategoriaActiva('Todos');
    }
  }, [categoriaActiva, categoriasOpciones]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productosActivos.filter((producto) => {
      const coincideCategoria = categoriaActiva === 'Todos' || producto.categoria === categoriaActiva;
      const coincideBusqueda =
        texto === '' ||
        String(producto.nombre || '').toLowerCase().includes(texto) ||
        String(producto.codigoBarras || '').toLowerCase().includes(texto) ||
        String(producto.sku || '').toLowerCase().includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  }, [productosActivos, categoriaActiva, busqueda]);

  const productosBajoStock = useMemo(
    () => productosActivos.filter((producto) => producto.stock > 0 && producto.stock <= stockMinimoAlerta),
    [productosActivos, stockMinimoAlerta],
  );

  const productosAgotados = useMemo(
    () => productosActivos.filter((producto) => producto.stock <= 0),
    [productosActivos],
  );

  const stockTotal = useMemo(
    () => productosActivos.reduce((total, producto) => total + Number(producto.stock || 0), 0),
    [productosActivos],
  );

  const alertaStock = useMemo(() => {
    const productosCriticos = [...productosBajoStock, ...productosAgotados];
    if (productosCriticos.length === 0) return '';
    return productosCriticos.slice(0, 5).map((producto) => producto.nombre).join(', ');
  }, [productosBajoStock, productosAgotados]);

  const limpiarFormularioProducto = () => {
    setFormProducto(productoInicial);
    setProductoEditando(null);
    setImagePreviewError(false);
    setImagenModificada(false);
    setMostrarFormularioProducto(false);
  };

  const limpiarFormularioCategoria = () => {
    setFormCategoria('');
    setCategoriaEditando(null);
  };

  const handleNuevoProducto = () => {
    setProductoEditando(null);
    setImagePreviewError(false);
    setImagenModificada(false);
    setFormProducto({
      ...productoInicial,
      categoria: categoriasOpciones[0] || '',
      sku: `POS-NEW-${String(productos.length + 1).padStart(3, '0')}`,
    });
    setMostrarFormularioProducto(true);
  };

  const handleSubirImagenProducto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!PRODUCT_IMAGE_TYPES.includes(file.type)) {
      setError('Solo se permiten imagenes JPG, JPEG, PNG o WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      setError('La imagen no debe superar los 10 MB.');
      event.target.value = '';
      return;
    }

    try {
      setSubiendoImagen(true);
      setError('');
      const data = await uploadProductoImagen(file);
      setFormProducto((prev) => ({
        ...prev,
        imagenUrl: data.url || data.imagenUrl || data.imagen_url || '',
      }));
      setImagenModificada(true);
      setImagePreviewError(false);
      setMensaje('Imagen subida correctamente. Guarda el producto para conservarla.');
    } catch (err) {
      setError(err.message || 'No se pudo subir la imagen del producto.');
    } finally {
      setSubiendoImagen(false);
      event.target.value = '';
    }
  };

  const handleCambiarImagenUrl = (event) => {
    setFormProducto((prev) => ({ ...prev, imagenUrl: event.target.value }));
    setImagenModificada(true);
    setImagePreviewError(false);
  };

  const limpiarImagenProducto = () => {
    setFormProducto((prev) => ({ ...prev, imagenUrl: '' }));
    setImagenModificada(true);
    setImagePreviewError(false);
  };

  const solicitarAccion = (tipo, entidad, payload) => {
    setAccionPendiente({ tipo, entidad, payload });
  };

  const cerrarModalAccion = () => {
    setAccionPendiente(null);
  };

  const verCategoria = (categoria) => {
    setCategoriaVista(categoria);
  };

  const ejecutarEditarCategoria = (categoria) => {
    setCategoriaEditando(categoria);
    setFormCategoria(categoria.nombre);
    setMensaje('');
    setError('');
  };

  const handleGuardarCategoria = async (event) => {
    event.preventDefault();
    const nombre = formCategoria.trim();

    if (!nombre) {
      setError('El nombre de la categoria es obligatorio.');
      return;
    }

    try {
      setGuardandoCategoria(true);
      setError('');
      setMensaje('');

      if (categoriaEditando) {
        await updateCategoria(categoriaEditando.id, { nombre });
        setMensaje('Categoria actualizada correctamente.');
      } else {
        await createCategoria({ nombre });
        setMensaje('Categoria agregada correctamente.');
      }

      limpiarFormularioCategoria();
      await recargarInventario();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la categoria.');
    } finally {
      setGuardandoCategoria(false);
    }
  };

  const ejecutarEliminarCategoria = async (categoria) => {
    try {
      setEliminandoCategoriaId(categoria.id);
      setError('');
      setMensaje('');
      cerrarModalAccion();

      await deleteCategoria(categoria.id);
      if (categoriaActiva === categoria.nombre) setCategoriaActiva('Todos');
      if (categoriaEditando?.id === categoria.id) limpiarFormularioCategoria();
      await recargarInventario();
      setMensaje(`Categoria "${categoria.nombre}" eliminada. Sus productos se movieron a "Sin categoria".`);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la categoria.');
    } finally {
      setEliminandoCategoriaId(null);
    }
  };

  const ejecutarEditarProducto = (producto) => {
    setProductoEditando(producto);
    setFormProducto({
      sku: producto.sku,
      codigoBarras: producto.codigoBarras,
      imagenUrl: producto.imagenUrl,
      nombre: producto.nombre,
      categoria: producto.categoria,
      proveedorId: producto.proveedorId ? String(producto.proveedorId) : '',
      precio: String(producto.precio),
      stock: String(producto.stock),
      demanda: producto.demanda,
    });
    setImagePreviewError(false);
    setImagenModificada(false);
    setMostrarFormularioProducto(true);
    cerrarModalAccion();
  };

  const handleGuardarProducto = async (event) => {
    event.preventDefault();

    const sku = formProducto.sku.trim();
    const codigoBarras = formProducto.codigoBarras.trim();
    const imagenUrl = formProducto.imagenUrl.trim();
    const imagenUrlFinal = getExternalImageUrlCandidate(imagenUrl) || imagenUrl;
    const nombre = formProducto.nombre.trim();
    const precio = Number(formProducto.precio);
    const stock = Number(formProducto.stock);

    if (!nombre) return setError('El nombre del producto es obligatorio.');
    if (!formProducto.categoria) return setError('La categoria es obligatoria.');
    if (Number.isNaN(precio) || precio < 0) return setError('El precio debe ser un numero valido.');
    if (Number.isNaN(stock) || stock < 0) return setError('El stock debe ser un numero valido.');
    if (imagenUrl && !/^https?:\/\//i.test(imagenUrl) && !/^(\/?public\/)?images\//i.test(imagenUrl) && !imagenUrl.startsWith('/images/')) {
      return setError('La URL de imagen debe iniciar con http://, https:// o /images/.');
    }

    const productoEnviar = {
      sku: sku || `POS-${Date.now()}`,
      codigoBarras,
      nombre,
      categoria: formProducto.categoria,
      proveedorId: formProducto.proveedorId ? Number(formProducto.proveedorId) : null,
      proveedor_id: formProducto.proveedorId ? Number(formProducto.proveedorId) : null,
      precio,
      stock,
      demanda: formProducto.demanda,
      precioSugerido: calcularPrecioSugerido(precio, formProducto.demanda),
      promedioVentasDiarias: productoEditando?.promedioVentasDiarias || 0,
      estado: calcularEstado(stock),
    };

    if (!productoEditando || imagenModificada) {
      productoEnviar.imagenUrl = imagenUrlFinal;
      productoEnviar.imagen_url = imagenUrlFinal;
      productoEnviar.limpiarImagen = imagenModificada && !imagenUrl;
    }

    try {
      setGuardando(true);
      setError('');
      setMensaje('');

      if (productoEditando) {
        await updateProducto(productoEditando.id, productoEnviar);
        setMensaje('Producto actualizado correctamente.');
      } else {
        await createProducto(productoEnviar);
        setMensaje('Producto agregado correctamente.');
      }

      limpiarFormularioProducto();
      await recargarInventario();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminarProducto = async (producto) => {
    try {
      setError('');
      setMensaje('');
      cerrarModalAccion();
      await deleteProducto(producto.id);
      await cargarProductos();
      setMensaje('Producto eliminado del inventario activo.');
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el producto.');
    }
  };

  const confirmarAccionPendiente = () => {
    if (!accionPendiente) return;

    const { tipo, entidad, payload } = accionPendiente;

    if (tipo === 'editar' && entidad === 'categoria') {
      ejecutarEditarCategoria(payload);
      cerrarModalAccion();
      return;
    }

    if (tipo === 'eliminar' && entidad === 'categoria') {
      ejecutarEliminarCategoria(payload);
      return;
    }

    if (tipo === 'editar' && entidad === 'producto') {
      ejecutarEditarProducto(payload);
      return;
    }

    if (tipo === 'eliminar' && entidad === 'producto') {
      ejecutarEliminarProducto(payload);
    }
  };

  const modalConfig = useMemo(() => {
    if (!accionPendiente) return null;

    const { tipo, entidad, payload } = accionPendiente;
    const nombre = payload?.nombre || 'registro seleccionado';
    const esEliminar = tipo === 'eliminar';
    const esCategoria = entidad === 'categoria';

    return {
      titulo: esEliminar
        ? `Eliminar ${esCategoria ? 'categoria' : 'producto'}`
        : `Editar ${esCategoria ? 'categoria' : 'producto'}`,
      descripcion: esEliminar
        ? esCategoria
          ? 'La categoria se eliminara de la lista. Sus productos se conservaran y se moveran a "Sin categoria".'
          : '¿Seguro que deseas eliminar este producto? Este producto ya no aparecera en Inventario ni en Punto de Venta, pero sus ventas historicas se conservaran.'
        : `Vas a abrir "${nombre}" para modificar su informacion.`,
      confirmText: esEliminar ? 'Si, eliminar' : 'Si, editar',
      confirmClass: esEliminar
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-slate-950 text-white hover:bg-slate-800',
      iconClass: esEliminar ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600',
      Icon: esEliminar ? Trash2 : Edit,
    };
  }, [accionPendiente]);

  const productosCategoriaVista = useMemo(() => {
    if (!categoriaVista) return [];
    return productos.filter((producto) => producto.estado !== 'Inactivo' && producto.categoria === categoriaVista.nombre);
  }, [productos, categoriaVista]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package size={30} className="text-slate-950" />
            <h1 className="text-3xl font-bold text-slate-950">Inventario</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Control de productos, categorias e imagenes de referencia para el POS.
          </p>
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>
            <X size={18} />
          </button>
        </div>
      )}

      {mensaje && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <span>{mensaje}</span>
          <button type="button" onClick={() => setMensaje('')}>
            <X size={18} />
          </button>
        </div>
      )}

      {alertaStock && (
        <div className="flex items-start gap-4 rounded-lg border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm text-yellow-800">
          <TriangleAlert className="mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-bold">Alerta de stock</h3>
            <p className="mt-1">{alertaStock} estan en nivel critico para el POS.</p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-3">
          <div className={`${tabGroupBase} m-2`}>
            {[
              { id: 'productos', label: 'Productos', icon: PackagePlus },
              { id: 'categorias', label: 'Categorias', icon: Tags },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTabActiva(tab.id)}
                  className= {`${tabButtonBase} min-w-[134px] ${
                    tabActiva === tab.id
                      ? activePanelTab
                      : inactivePanelTab
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {tabActiva === 'productos' && (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_240px_auto_auto]">
              <label className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Buscar por nombre, SKU o codigo"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-900"
                />
              </label>

              <label className="relative">
                <Filter
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={categoriaActiva}
                  onChange={(event) => setCategoriaActiva(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-900"
                >
                  <option value="Todos">Todas las categorias</option>
                  {categoriasOpciones.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleNuevoProducto}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Agregar producto
              </button>

              <div className="inline-flex justify-self-start rounded-lg border border-slate-200 bg-slate-50 p-1 xl:justify-self-end">
                {[
                  { id: 'tarjetas', label: 'Tarjetas', icon: Grid3X3 },
                  { id: 'tabla', label: 'Tabla', icon: List },
                ].map((vista) => {
                  const Icon = vista.icon;
                  return (
                    <button
                      key={vista.id}
                      type="button"
                      onClick={() => setVistaProductos(vista.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
                        vistaProductos === vista.id
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      <Icon size={16} />
                      {vista.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {[
                ['Productos', productosActivos.length, 'text-slate-950'],
                ['Stock total', stockTotal, 'text-slate-950'],
                ['Stock critico', productosBajoStock.length, 'text-yellow-600'],
                ['Agotados', productosAgotados.length, 'text-red-600'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {vistaProductos === 'tarjetas' ? (
              <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                {loading ? (
                  <p className="p-5 text-center text-sm text-slate-500">Cargando productos...</p>
                ) : productosFiltrados.length === 0 ? (
                  <p className="p-5 text-center text-sm text-slate-500">No se encontraron productos.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {productosFiltrados.map((producto) => {
                  const imagenProducto = getImageSrc(producto.imagenUrl);
                      const estadoStock = getEstadoStock(producto, stockMinimoAlerta);

                      return (
                        <article
                          key={producto.id}
                          className="grid grid-cols-[84px_1fr] gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300"
                        >
                          <div className="h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
                            {imagenProducto ? (
                              <img
                                src={imagenProducto}
                                alt={producto.nombre}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.classList.add('hidden');
                                  event.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={imagenProducto ? 'hidden' : ''}>
                              <PlaceholderImagen className="h-20 w-20" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="truncate font-bold text-slate-950">{producto.nombre}</h3>
                                <p className="mt-0.5 text-xs text-slate-500">SKU {producto.sku || 'N/A'}</p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${estadoStock.className}`}>
                                {estadoStock.label}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                              <span className="truncate">Codigo: {producto.codigoBarras || 'N/A'}</span>
                              <span className="truncate">Categoria: {producto.categoria}</span>
                              <span className="font-bold text-slate-950">{formatearMoneda(producto.precio)}</span>
                              <span className="font-bold text-slate-950">Stock {producto.stock}</span>
                            </div>

                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => solicitarAccion('editar', 'producto', producto)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                <Edit size={14} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => solicitarAccion('eliminar', 'producto', producto)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
            <div className="max-h-[560px] overflow-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[1060px] text-left">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Imagen</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Codigo</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-10 text-center text-sm text-slate-500">
                        Cargando productos...
                      </td>
                    </tr>
                  ) : productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-10 text-center text-sm text-slate-500">
                        No se encontraron productos.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((producto) => {
                      const estadoStock = getEstadoStock(producto, stockMinimoAlerta);

                      return (
                      <tr key={producto.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {producto.imagenUrl ? (
                            <div className="relative h-12 w-12">
                              <img
                                src={getImageSrc(producto.imagenUrl)}
                                alt={producto.nombre}
                                className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                                onError={(event) => {
                                  event.currentTarget.classList.add('hidden');
                                  event.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden">
                                <PlaceholderImagen />
                              </div>
                            </div>
                          ) : (
                            <PlaceholderImagen />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-600">{producto.sku}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{producto.codigoBarras || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-950">{producto.nombre}</p>
                          <p className="text-xs text-slate-500">{producto.demanda} demanda</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {producto.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">{formatearMoneda(producto.precio)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${estadoStock.className}`}
                          >
                            {producto.stock} u
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{estadoStock.label}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => solicitarAccion('editar', 'producto', producto)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              <Edit size={16} />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => solicitarAccion('eliminar', 'producto', producto)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {tabActiva === 'categorias' && (
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 p-4 xl:grid-cols-[380px_minmax(0,1fr)]">
            <form onSubmit={handleGuardarCategoria} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-bold text-slate-950">
                {categoriaEditando ? 'Editar categoria' : 'Nueva categoria'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Registra categorias para organizar productos del menu.
              </p>

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Nombre</span>
                <input
                  type="text"
                  value={formCategoria}
                  onChange={(event) => setFormCategoria(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                  placeholder="Ej. Tacos"
                />
              </label>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={guardandoCategoria}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    categoriaEditando
                      ? 'bg-slate-950 text-white ring-1 ring-slate-900 hover:bg-slate-800'
                      : 'bg-slate-950 text-white hover:bg-slate-800'
                  }`}
                >
                  {categoriaEditando ? <Save size={17} /> : <Plus size={16} />}
                  {guardandoCategoria ? 'Guardando...' : categoriaEditando ? 'Actualizar' : 'Crear nueva categoria'}
                </button>

                {categoriaEditando && (
                  <button
                    type="button"
                    onClick={limpiarFormularioCategoria}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="min-w-0 rounded-lg border border-slate-200 bg-white">
              <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-bold text-slate-950">Categorias existentes</h2>
                <span className="text-sm font-semibold text-slate-500">
                  {categoriasFiltradas.length} de {totalCategoriasActivas} categorias
                </span>
              </div>

              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Buscar categoria</span>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-slate-950">
                    <Search size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={busquedaCategoria}
                      onChange={(event) => setBusquedaCategoria(event.target.value)}
                      className="w-full bg-transparent py-1 text-sm outline-none"
                      placeholder="Buscar por nombre de categoria"
                    />
                    {busquedaCategoria && (
                      <button
                        type="button"
                        onClick={() => setBusquedaCategoria('')}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Limpiar busqueda de categoria"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </label>
              </div>

              <div className="max-h-[520px] overflow-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Productos</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingCategorias ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500">
                          Cargando categorias...
                        </td>
                      </tr>
                    ) : categoriasDb.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500">
                          No hay categorias registradas.
                        </td>
                      </tr>
                    ) : categoriasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500">
                          No se encontraron categorias con ese nombre.
                        </td>
                      </tr>
                    ) : (
                      categoriasFiltradas.map((categoria) => (
                        <tr key={categoria.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-950">{categoria.nombre}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{categoria.totalProductos} productos</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => solicitarAccion('editar', 'categoria', categoria)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                <Edit size={16} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => solicitarAccion('eliminar', 'categoria', categoria)}
                                disabled={eliminandoCategoriaId === categoria.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                              >
                                <Trash2 size={16} />
                                {eliminandoCategoriaId === categoria.id ? 'Eliminando...' : 'Eliminar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => verCategoria(categoria)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                <Eye size={16} />
                                Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {mostrarFormularioProducto && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
          <section className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {productoEditando ? 'Editar producto' : 'Agregar producto'}
                </h2>
                <p className="text-sm text-slate-500">
                  Captura datos del producto. Puedes subir una imagen local o pegar una URL.
                </p>
              </div>
              <button
                type="button"
                onClick={limpiarFormularioProducto}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarProducto} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ['SKU', 'sku', 'text', 'POS-NEW-001'],
                ['Codigo de barras', 'codigoBarras', 'text', '750100000001'],
                ['Nombre', 'nombre', 'text', 'Taco al pastor'],
                ['Precio', 'precio', 'number', '0.00'],
                ['Stock', 'stock', 'number', '0'],
              ].map(([label, name, type, placeholder]) => (
                <label key={name} className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <input
                    type={type}
                    name={name}
                    value={formProducto[name]}
                    onChange={(event) => setFormProducto((prev) => ({ ...prev, [name]: event.target.value }))}
                    min={type === 'number' ? '0' : undefined}
                    step={name === 'precio' ? '0.01' : undefined}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                    placeholder={placeholder}
                  />
                </label>
              ))}

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">URL de imagen del producto</span>
                <input
                  type="text"
                  name="imagenUrl"
                  value={formProducto.imagenUrl}
                  onChange={handleCambiarImagenUrl}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="Opcional: URL de imagen del producto"
                />
              </label>

              <div className="space-y-1 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Subir imagen desde el equipo</span>
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3">
                  <label
                    htmlFor="producto-imagen"
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 ${
                      subiendoImagen ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    <Upload size={16} />
                    Seleccionar archivo
                  </label>
                  <span className="text-sm text-slate-500">
                    {subiendoImagen ? 'Subiendo imagen...' : 'Ningún archivo seleccionado'}
                  </span>
                  <input
                    id="producto-imagen"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSubirImagenProducto}
                    disabled={subiendoImagen}
                    className="sr-only"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {subiendoImagen
                    ? 'Subiendo imagen...'
                    : 'Formatos permitidos: jpg, jpeg, png o webp. Maximo 10 MB.'}
                </span>
              </div>

              <label className="space-y-1">
                <span className="text-sm font-semibold text-slate-700">Categoria</span>
                <select
                  name="categoria"
                  value={formProducto.categoria}
                  onChange={(event) => setFormProducto((prev) => ({ ...prev, categoria: event.target.value }))}
                  disabled={categoriasOpciones.length === 0}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                >
                  {categoriasOpciones.length === 0 && (
                    <option value="">Registra una categoria primero</option>
                  )}
                  {categoriasOpciones.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm font-semibold text-slate-700">Proveedor</span>
                <select
                  name="proveedorId"
                  value={formProducto.proveedorId}
                  onChange={(event) => setFormProducto((prev) => ({ ...prev, proveedorId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                >
                  <option value="">Sin proveedor asignado</option>
                  {proveedores
                    .filter((proveedor) => proveedor.estado !== 'inactivo')
                    .map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </option>
                    ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm font-semibold text-slate-700">Demanda</span>
                <select
                  name="demanda"
                  value={formProducto.demanda}
                  onChange={(event) => setFormProducto((prev) => ({ ...prev, demanda: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">Vista previa</p>
                  {formProducto.imagenUrl && (
                    <button
                      type="button"
                      onClick={limpiarImagenProducto}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <ImageOff size={14} />
                      Limpiar imagen
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
                  <div className="grid h-36 w-full place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-32 sm:w-40">
                    {formProducto.imagenUrl && !imagePreviewError ? (
                      <img
                        key={formProducto.imagenUrl}
                        src={getImageSrc(formProducto.imagenUrl)}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                        onLoad={() => setImagePreviewError(false)}
                        onError={() => setImagePreviewError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center text-xs font-semibold text-slate-400">
                        <ImageIcon size={24} />
                        {imagePreviewError ? 'No se pudo cargar la imagen' : 'Sin imagen'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-slate-500">
                    <p>
                      La vista previa se actualiza al escribir una URL o al subir un archivo local.
                    </p>
                    <p>
                      En la base de datos solo se guarda la ruta en <span className="font-semibold">imagen_url</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {productoEditando ? <Save size={17} /> : <PackagePlus size={17} />}
                  {guardando ? 'Guardando...' : productoEditando ? 'Actualizar producto' : 'Agregar producto'}
                </button>
                <button
                  type="button"
                  onClick={limpiarFormularioProducto}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                >
                  <XCircle size={17} />
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modalConfig && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-3 ${modalConfig.iconClass}`}>
                <modalConfig.Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-950">{modalConfig.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{modalConfig.descripcion}</p>
              </div>
              <button
                type="button"
                onClick={cerrarModalAccion}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar ventana de confirmacion"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrarModalAccion}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAccionPendiente}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${modalConfig.confirmClass}`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {categoriaVista && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{categoriaVista.nombre}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {productosCategoriaVista.length} productos activos registrados en esta categoria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCategoriaVista(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar productos de categoria"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-5">
              {productosCategoriaVista.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No hay productos activos registrados en esta categoria.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        {['Imagen', 'Producto', 'SKU', 'Codigo', 'Stock', 'Precio', 'Estado'].map((heading) => (
                          <th key={heading} className="px-4 py-3">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productosCategoriaVista.map((producto) => {
                        const imagenProducto = getImageSrc(producto.imagenUrl);
                        const estadoStock = getEstadoStock(producto, stockMinimoAlerta);

                        return (
                          <tr key={producto.id}>
                            <td className="px-4 py-3">
                              {imagenProducto ? (
                                <div className="relative h-12 w-12">
                                  <img
                                    src={imagenProducto}
                                    alt={producto.nombre}
                                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                                    onError={(event) => {
                                      event.currentTarget.classList.add('hidden');
                                      event.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden">
                                    <PlaceholderImagen />
                                  </div>
                                </div>
                              ) : (
                                <PlaceholderImagen />
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-950">{producto.nombre}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{producto.sku || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{producto.codigoBarras || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">{producto.stock}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-950">
                              {formatearMoneda(producto.precio)}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoStock.className}`}>
                                {estadoStock.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Inventario;
