import { useMemo, useState } from 'react';
import { AlertasVisuales, Button, Card, TableProductos } from '../components';
import { Download, Filter, Plus, Search } from 'lucide-react';
import { productosData } from '../data/mockData';

const emptyProductForm = {
  sku: '',
  nombre: '',
  categoria: 'Accesorios',
  canal: 'WhatsApp',
  precio: '',
  stock: '',
  demanda: 'Media',
};

const baseCategories = ['Accesorios', 'Cómputo', 'Servicios', 'Impresoras'];
const canales = ['WhatsApp', 'Facebook', 'Instagram', 'Tienda física'];
const demandas = ['Alta', 'Media', 'Baja'];

const Inventario = () => {
  const [productos, setProductos] = useState(productosData);
  const [showAlert, setShowAlert] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProductForm);

  const categories = useMemo(
    () => ['Todos', ...new Set([...baseCategories, ...productos.map((producto) => producto.categoria)])],
    [productos],
  );

  const filteredProducts = useMemo(() => {
    return productos.filter((producto) => {
      const matchesCategory = filtro === 'Todos' || producto.categoria === filtro;
      const matchesQuery = `${producto.nombre} ${producto.sku} ${producto.canal}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [productos, filtro, query]);

  const resetForm = () => {
    setFormData(emptyProductForm);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleNewProduct = () => {
    setFormData(emptyProductForm);
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      nombre: product.nombre,
      categoria: product.categoria,
      canal: product.canal,
      precio: String(product.precio),
      stock: String(product.stock),
      demanda: product.demanda || 'Media',
    });
    setShowForm(true);
  };

  const handleDeleteProduct = (product) => {
    const shouldDelete = window.confirm(`¿Eliminar ${product.nombre} del inventario local?`);
    if (!shouldDelete) return;

    // Futuro backend: reemplazar este setState por una llamada DELETE /productos/:id.
    setProductos((current) => current.filter((item) => item.id !== product.id));
    if (editingProduct?.id === product.id) resetForm();
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nombre = formData.nombre.trim();
    const sku = formData.sku.trim();
    const precio = Number(formData.precio);
    const stock = Number(formData.stock);

    if (!nombre || !sku || Number.isNaN(precio) || Number.isNaN(stock)) return;

    const payload = {
      sku,
      nombre,
      categoria: formData.categoria,
      canal: formData.canal,
      precio,
      stock,
      demanda: formData.demanda,
      precioSugerido: Math.round(precio * (formData.demanda === 'Alta' ? 1.12 : 1.05)),
    };

    if (editingProduct) {
      // Futuro backend: reemplazar este setState por PUT/PATCH /productos/:id.
      setProductos((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...payload }
            : product,
        ),
      );
    } else {
      const nextId = Math.max(0, ...productos.map((product) => product.id)) + 1;
      // Futuro backend: reemplazar este setState por POST /productos.
      setProductos((current) => [
        {
          id: nextId,
          ...payload,
        },
        ...current,
      ]);
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Inventario</h2>
          <p className="mt-1 text-sm text-slate-500">Control de stock y productos de PPC SOLUCIONES.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="md">
            <Download size={18} />
            Exportar
          </Button>
          <Button
            size="md"
            onClick={handleNewProduct}
            className="bg-white text-slate-950 ring-1 ring-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm"
          >
            <Plus size={18} />
            Nuevo producto
          </Button>
        </div>
      </div>

      {showAlert && (
        <AlertasVisuales
          type="warning"
          title="Alerta de stock"
          message="Cargador USB-C, Mica templada y Cable Lightning están en nivel crítico para PPC SOLUCIONES."
          onClose={() => setShowAlert(false)}
        />
      )}

      {showForm && (
        <Card className="p-5" hover={false}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-950">
              {editingProduct ? 'Editar producto' : 'Agregar producto'}
            </h3>
            <p className="text-sm text-slate-500">
              Los cambios se guardan localmente. La estructura queda lista para conectar una API en el futuro.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">SKU</span>
              <input
                value={formData.sku}
                onChange={(event) => handleFieldChange('sku', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="PPC-NEW-001"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input
                value={formData.nombre}
                onChange={(event) => handleFieldChange('nombre', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="Producto"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Categoría</span>
              <select
                value={formData.categoria}
                onChange={(event) => handleFieldChange('categoria', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {categories.slice(1).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Canal</span>
              <select
                value={formData.canal}
                onChange={(event) => handleFieldChange('canal', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {canales.map((canal) => (
                  <option key={canal}>{canal}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Precio</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={(event) => handleFieldChange('precio', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="0.00"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) => handleFieldChange('stock', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="0"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Demanda</span>
              <select
                value={formData.demanda}
                onChange={(event) => handleFieldChange('demanda', event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {demandas.map((demanda) => (
                  <option key={demanda}>{demanda}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
              <Button type="submit" className="bg-slate-950 text-white hover:bg-slate-800">
                {editingProduct ? 'Guardar cambios' : 'Agregar producto'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="text-slate-950">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4" hover={false}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFiltro(category)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  filtro === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 lg:w-80">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Buscar en inventario"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total productos', value: filteredProducts.length, color: 'text-slate-950' },
          { label: 'Stock total', value: filteredProducts.reduce((sum, product) => sum + product.stock, 0), color: 'text-slate-950' },
          { label: 'Bajo stock', value: filteredProducts.filter((product) => product.stock > 0 && product.stock < 6).length, color: 'text-yellow-600' },
          { label: 'Agotados', value: filteredProducts.filter((product) => product.stock === 0).length, color: 'text-red-600' },
        ].map((item) => (
          <Card key={item.label} className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Filter size={14} />
              {item.label}
            </div>
            <p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden" hover={false}>
        <TableProductos
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </Card>
    </div>
  );
};

export default Inventario;
