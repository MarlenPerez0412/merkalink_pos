import { useState } from 'react';
import Card from './Card';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const TableProductos = ({ products = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const getStockColor = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Hogar: 'bg-blue-100 text-blue-800',
      Electrónica: 'bg-purple-100 text-purple-800',
      Moda: 'bg-pink-100 text-pink-800',
      Alimentos: 'bg-orange-100 text-orange-800',
      Otros: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Otros;
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Precio</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Stock</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {product.nombre}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.categoria)}`}>
                      {product.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    ${product.precio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStockColor(product.stock)}`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-primary-600">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No hay productos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, products.length)} de {products.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg transition-colors font-medium text-sm ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TableProductos;
