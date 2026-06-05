import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let canalesSchemaListo = false;

const asegurarColumnaActivoCanales = async () => {
  if (canalesSchemaListo) return;

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'canales'
      AND COLUMN_NAME = 'activo'
    LIMIT 1
  `);

  if (!columns[0]) {
    await pool.query('ALTER TABLE canales ADD COLUMN activo TINYINT DEFAULT 1');
  }

  canalesSchemaListo = true;
};

export const obtenerResumenReportes = asyncHandler(async (req, res) => {
  await asegurarColumnaActivoCanales();

  const [[empresaRows], [productos], [ventas], [canales], [alertas]] = await Promise.all([
    pool.query('SELECT * FROM empresa ORDER BY id ASC LIMIT 1'),
    pool.query(`
      SELECT p.id, p.nombre, p.stock, p.demanda, p.estado, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE COALESCE(p.estado, 'Activo') <> 'Inactivo'
      ORDER BY p.nombre ASC
    `),
    pool.query(`
      SELECT v.id, v.folio, v.total, v.estado, v.fecha, c.nombre AS origen
      FROM ventas v
      LEFT JOIN canales c ON c.id = v.canal_id
      ORDER BY v.fecha DESC
    `),
    pool.query(`
      SELECT id, nombre, tipo, estado
      FROM canales
      WHERE COALESCE(activo, 1) = 1
        AND COALESCE(estado, 'Activo') <> 'Inactivo'
      ORDER BY nombre ASC
    `),
    pool.query(`
      SELECT a.id, a.tipo, a.estado, a.nivel, a.mensaje, a.fecha, p.nombre AS producto
      FROM alertas a
      LEFT JOIN productos p ON p.id = a.producto_id
      WHERE a.estado NOT IN ('Vista', 'Resuelta')
      ORDER BY a.fecha DESC
    `),
  ]);

  const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  const categorias = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoria';
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});
  const ventasPorOrigen = ventas.reduce((acc, venta) => {
    const origen = venta.origen || 'Sin origen';
    acc[origen] = (acc[origen] || 0) + Number(venta.total || 0);
    return acc;
  }, {});

  res.json({
    success: true,
    empresa: empresaRows[0] || null,
    resumen: {
      productosActivos: productos.length,
      ventasRegistradas: ventas.length,
      totalVentas,
      origenesActivos: canales.length,
      alertasActivas: alertas.length,
    },
    categorias,
    ventasPorOrigen,
    productos,
    ventas,
    canales,
    alertas,
  });
});
