import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapProducto = (producto) => ({
  id: producto.id,
  sku: producto.sku,
  nombre: producto.nombre,
  categoriaId: producto.categoria_id,
  categoria: producto.categoria,
  precio: Number(producto.precio),
  precioSugerido: producto.precio_sugerido === null ? null : Number(producto.precio_sugerido),
  stock: producto.stock,
  demanda: producto.demanda,
  promedioVentasDiarias: Number(producto.promedio_ventas_diarias || 0),
  estado: producto.estado,
  fechaCreacion: producto.fecha_creacion,
  canalMasVendido: producto.canal_mas_vendido || null,
  ultimaVenta: producto.ultima_venta || null,
});

const obtenerCategoriaId = async (categoria) => {
  if (Number(categoria)) return Number(categoria);

  const [rows] = await pool.query('SELECT id FROM categorias WHERE nombre = ? LIMIT 1', [categoria]);
  if (rows[0]) return rows[0].id;

  const [result] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [categoria]);
  return result.insertId;
};

export const obtenerProductos = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      p.*,
      c.nombre AS categoria,
      (
        SELECT ca.nombre
        FROM ventas v
        INNER JOIN canales ca ON ca.id = v.canal_id
        WHERE v.producto_id = p.id
        GROUP BY ca.id, ca.nombre
        ORDER BY SUM(v.cantidad) DESC
        LIMIT 1
      ) AS canal_mas_vendido,
      (
        SELECT MAX(v.fecha)
        FROM ventas v
        WHERE v.producto_id = p.id
      ) AS ultima_venta
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    ORDER BY p.id DESC
  `);

  res.json(rows.map(mapProducto));
});

export const crearProducto = asyncHandler(async (req, res) => {
  const {
    sku,
    nombre,
    categoriaId,
    categoria,
    precio,
    precioSugerido,
    stock,
    demanda = 'Media',
    promedioVentasDiarias = 0,
    estado = 'Activo',
  } = req.body;

  if (!sku || !nombre || (!categoriaId && !categoria) || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios del producto' });
  }

  const categoria_id = categoriaId || await obtenerCategoriaId(categoria);

  const [result] = await pool.query(
    `
      INSERT INTO productos
        (sku, nombre, categoria_id, precio, precio_sugerido, stock, demanda, promedio_ventas_diarias, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      sku,
      nombre,
      categoria_id,
      precio,
      precioSugerido ?? null,
      stock,
      demanda,
      promedioVentasDiarias,
      estado,
    ],
  );

  res.status(201).json({ id: result.insertId, mensaje: 'Producto creado correctamente' });
});

export const actualizarProducto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    sku,
    nombre,
    categoriaId,
    categoria,
    precio,
    precioSugerido,
    stock,
    demanda = 'Media',
    promedioVentasDiarias = 0,
    estado = 'Activo',
  } = req.body;

  if (!sku || !nombre || (!categoriaId && !categoria) || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios del producto' });
  }

  const categoria_id = categoriaId || await obtenerCategoriaId(categoria);

  const [result] = await pool.query(
    `
      UPDATE productos
      SET sku = ?,
          nombre = ?,
          categoria_id = ?,
          precio = ?,
          precio_sugerido = ?,
          stock = ?,
          demanda = ?,
          promedio_ventas_diarias = ?,
          estado = ?
      WHERE id = ?
    `,
    [
      sku,
      nombre,
      categoria_id,
      precio,
      precioSugerido ?? null,
      stock,
      demanda,
      promedioVentasDiarias,
      estado,
      id,
    ],
  );

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });

  res.json({ mensaje: 'Producto actualizado correctamente' });
});

export const eliminarProducto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });

  res.json({ mensaje: 'Producto eliminado correctamente' });
});
