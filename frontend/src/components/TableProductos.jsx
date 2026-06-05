import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';

const TableProductos = ({ products = [], onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const safePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const getStockColor = (stock) => {
    const stockValue = Number(stock || 0);

    if (stockValue === 0) return 'bg-red-50 text-red-700 ring-red-200';
    if (stockValue < 6) return 'bg-yellow-50 text-yellow-700 ring-yellow-200';

    return 'bg-green-50 text-green-700 ring-green-200';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Accesorios: 'bg-blue-50 text-blue-700 ring-blue-200',
      Cómputo: 'bg-violet-50 text-violet-700 ring-violet-200',
      Impresoras: 'bg-orange-50 text-orange-700 ring-orange-200',
      Refacciones: 'bg-slate-50 text-slate-700 ring-slate-200',
      Componentes: 'bg-slate-50 text-slate-700 ring-slate-200',
      Cargadores: 'bg-blue-50 text-blue-700 ring-blue-200',
      Fundas: 'bg-violet-50 text-violet-700 ring-violet-200',
      Micas: 'bg-green-50 text-green-700 ring-green-200',
      Audífonos: 'bg-orange-50 text-orange-700 ring-orange-200',
      Cables: 'bg-blue-50 text-blue-700 ring-blue-200',
      Otros: 'bg-slate-50 text-slate-700 ring-slate-200',
    };

    return colors[category] || colors.Otros;
  };

  const formatPrice = (price) => {
    return `$${Number(price || 0).toFixed(2)}`;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                SKU
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Producto
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoría
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Canal más vendido
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Precio
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stock
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-slate-100 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 text-sm font-medium text-slate-500">
                    {product.sku}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {product.nombre}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getCategoryColor(
                        product.categoria,
                      )}`}
                    >
                      {product.categoria || 'Sin categoría'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {product.canalMasVendido || product.canal || 'Sin ventas'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-semibold text-slate-950">
                    {formatPrice(product.precio)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStockColor(
                        product.stock,
                      )}`}
                    >
                      {product.stock} u
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        aria-label="Editar producto"
                        onClick={() => onEdit?.(product)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Edit2 size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        aria-label="Eliminar producto"
                        onClick={() => onDelete?.(product)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No hay productos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Mostrando {startIndex + 1} a {Math.min(endIndex, products.length)} de{' '}
            {products.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                    safePage === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableProductos;
