import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapVenta = (venta) => ({
  id: venta.id,
  productoId: venta.producto_id,
  producto: venta.producto,
  canalId: venta.canal_id,
  canal: venta.canal,
  cantidad: venta.cantidad,
  total: Number(venta.total),
  fecha: venta.fecha,
});

export const obtenerVentas = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      v.id,
      v.producto_id,
      p.nombre AS producto,
      v.canal_id,
      c.nombre AS canal,
      v.cantidad,
      v.total,
      v.fecha
    FROM ventas v
    INNER JOIN productos p ON p.id = v.producto_id
    INNER JOIN canales c ON c.id = v.canal_id
    ORDER BY v.fecha DESC
  `);

  res.json(rows.map(mapVenta));
});

export const crearVenta = asyncHandler(async (req, res) => {
  const { productoId, producto_id, canalId, canal_id, cantidad } = req.body;
  const finalProductoId = productoId || producto_id;
  const finalCanalId = canalId || canal_id;

  if (!finalProductoId || !finalCanalId || !cantidad) {
    return res.status(400).json({ mensaje: 'Faltan datos de la venta' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.query('SELECT id, precio, stock FROM productos WHERE id = ? FOR UPDATE', [finalProductoId]);
    const product = products[0];

    if (!product) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (product.stock < cantidad) {
      await connection.rollback();
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    const total = Number(product.precio) * Number(cantidad);

    const [result] = await connection.query(
      'INSERT INTO ventas (producto_id, canal_id, cantidad, total) VALUES (?, ?, ?, ?)',
      [finalProductoId, finalCanalId, cantidad, total],
    );

    await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, finalProductoId]);

    await connection.commit();

    res.status(201).json({
      id: result.insertId,
      total,
      mensaje: 'Venta registrada correctamente',
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
