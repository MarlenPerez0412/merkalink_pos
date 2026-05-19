import { useState } from 'react';
import { Card, TableProductos, Button, AlertasVisuales } from '../components';
import { Plus, Download } from 'lucide-react';
import { productosData } from '../data/mockData';

const Inventario = () => {
  const [showAlert, setShowAlert] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  const filteredProducts = filtro === 'todos' ? productosData : productosData.filter(p => p.categoria === filtro);

  const categories = ['todos', 'Hogar', 'Electrónica', 'Moda', 'Alimentos'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark-900">Inventario</h2>
          <p className="text-gray-600 text-sm">Gestiona tu stock de productos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md">
            <Download size={18} />
            Exportar
          </Button>
          <Button size="md">
            <Plus size={18} />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Alert */}
      {showAlert && (
        <AlertasVisuales
          type="warning"
          title="Alerta de Stock"
          message="El producto 'Termo Negro' está agotado. Considera realizar un reorden."
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filtro === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Total Productos</p>
          <p className="text-2xl font-bold text-dark-900">{filteredProducts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Stock Total</p>
          <p className="text-2xl font-bold text-dark-900">
            {filteredProducts.reduce((sum, p) => sum + p.stock, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Bajo Stock</p>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredProducts.filter(p => p.stock < 5).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-600 mb-2">Agotados</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredProducts.filter(p => p.stock === 0).length}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <TableProductos products={filteredProducts} />
      </Card>
    </div>
  );
};

export default Inventario;
