import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  asegurarSchemaReservasStock,
  completarReservaToken,
  limpiarReservasExpiradas,
  obtenerReservadoProducto,
} from './reservasStock.controller.js';

const mapVenta = (venta) => ({
  id: venta.id,
  folio: venta.folio || `POS-${String(venta.id).padStart(6, '0')}`,
  usuarioId: venta.usuario_id || null,
  cajero: venta.cajero || null,
  productoId: venta.producto_id || null,
  producto: venta.producto || 'Venta POS',
  canalId: venta.canal_id,
  canal: venta.canal,
  metodoPago: venta.metodo_pago || null,
  montoRecibido: venta.monto_recibido === undefined ? null : Number(venta.monto_recibido || 0),
  cambio: venta.cambio === undefined ? null : Number(venta.cambio || 0),
  cantidad: Number(venta.cantidad || 0),
  total: Number(venta.total),
  estado: venta.estado || 'Completada',
  fecha: venta.fecha,
});

let ventasSchemaListo = false;
let canalesActivoSchemaListo = false;

const asegurarColumnasVentaPos = async (connection) => {
  if (ventasSchemaListo) return;

  const [columns] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'ventas'
        AND COLUMN_NAME IN ('monto_recibido', 'cambio')
    `,
  );

  const existentes = new Set(columns.map((column) => column.COLUMN_NAME));

  if (!existentes.has('monto_recibido')) {
    await connection.query('ALTER TABLE ventas ADD COLUMN monto_recibido DECIMAL(10,2) NULL AFTER metodo_pago');
  }

  if (!existentes.has('cambio')) {
    await connection.query('ALTER TABLE ventas ADD COLUMN cambio DECIMAL(10,2) NULL AFTER monto_recibido');
  }

  ventasSchemaListo = true;
};

const asegurarColumnaActivoCanales = async (connection) => {
  if (canalesActivoSchemaListo) return;

  const [columns] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'canales'
        AND COLUMN_NAME = 'activo'
      LIMIT 1
    `,
  );

  if (!columns[0]) {
    await connection.query('ALTER TABLE canales ADD COLUMN activo TINYINT DEFAULT 1');
  }

  canalesActivoSchemaListo = true;
};

const obtenerCanalVentaId = async (connection, canalIdSeleccionado) => {
  if (canalIdSeleccionado) {
    const [seleccionados] = await connection.query(
      `
        SELECT id
        FROM canales
        WHERE id = ?
          AND COALESCE(activo, 1) = 1
          AND COALESCE(estado, 'Activo') <> 'Inactivo'
        LIMIT 1
      `,
      [canalIdSeleccionado],
    );

    if (seleccionados[0]) return seleccionados[0].id;
  }

  const [rows] = await connection.query(
    `
      SELECT id
      FROM canales
      WHERE COALESCE(activo, 1) = 1
        AND COALESCE(estado, 'Activo') <> 'Inactivo'
      ORDER BY CASE WHEN LOWER(nombre) = 'mostrador' THEN 0 ELSE 1 END, id
      LIMIT 1
    `,
  );

  if (rows[0]) return rows[0].id;
  return null;
};

const obtenerVentaCompleta = async (connection, ventaId) => {
  const [ventas] = await connection.query(
    `
      SELECT
        v.id,
        v.usuario_id,
        u.nombre AS cajero,
        v.canal_id,
        c.nombre AS canal,
        v.metodo_pago,
        v.monto_recibido,
        v.cambio,
        v.total,
        v.fecha
      FROM ventas v
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      INNER JOIN canales c ON c.id = v.canal_id
      WHERE v.id = ?
      LIMIT 1
    `,
    [ventaId],
  );

  const venta = ventas[0];
  if (!venta) return null;

  const [detalle] = await connection.query(
    `
      SELECT
        d.id,
        d.venta_id,
        d.producto_id,
        p.nombre,
        p.sku,
        p.codigo_barras,
        d.cantidad,
        d.precio_unitario,
        d.subtotal
      FROM detalle_ventas d
      INNER JOIN productos p ON p.id = d.producto_id
      WHERE d.venta_id = ?
      ORDER BY d.id ASC
    `,
    [ventaId],
  );

  return {
    ventaId: venta.id,
    folio: `POS-${String(venta.id).padStart(6, '0')}`,
    usuarioId: venta.usuario_id,
    cajero: venta.cajero || 'Cajero demo',
    canalId: venta.canal_id,
    canal: venta.canal,
    metodoPago: venta.metodo_pago,
    montoRecibido: venta.monto_recibido === null ? null : Number(venta.monto_recibido || 0),
    cambio: venta.cambio === null ? null : Number(venta.cambio || 0),
    total: Number(venta.total),
    fecha: venta.fecha,
    productos: detalle.map((item) => ({
      detalleId: item.id,
      ventaId: item.venta_id,
      productoId: item.producto_id,
      nombre: item.nombre,
      sku: item.sku,
      codigoBarras: item.codigo_barras || '',
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precio_unitario),
      subtotal: Number(item.subtotal),
    })),
  };
};

export const obtenerVentas = asyncHandler(async (req, res) => {
  await asegurarColumnasVentaPos(pool);
  const { usuario_id, canal_id, fecha, hora_inicio, hora_fin } = req.query;
  const filtros = [];
  const params = [];
  const esCajero = String(req.usuario?.rol || '').trim() === 'Cajero';
  const usuarioFiltro = esCajero ? req.usuario.id : usuario_id;

  if (usuarioFiltro) {
    filtros.push('v.usuario_id = ?');
    params.push(usuarioFiltro);
  }

  if (canal_id) {
    filtros.push('v.canal_id = ?');
    params.push(canal_id);
  }

  if (fecha && hora_inicio && hora_fin) {
    filtros.push('v.fecha BETWEEN ? AND ?');
    params.push(`${fecha} ${hora_inicio}`, `${fecha} ${hora_fin}`);
  } else if (fecha) {
    filtros.push('DATE(v.fecha) = ?');
    params.push(fecha);
  }

  const whereSql = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT
      v.id,
      v.folio,
      v.usuario_id,
      u.nombre AS cajero,
      MIN(d.producto_id) AS producto_id,
      COALESCE(
        GROUP_CONCAT(
          DISTINCT CONCAT(pd.nombre, ' x', d.cantidad)
          ORDER BY pd.nombre
          SEPARATOR ', '
        ),
        'Venta POS'
      ) AS producto,
      v.canal_id,
      c.nombre AS canal,
      v.metodo_pago,
      v.monto_recibido,
      v.cambio,
      COALESCE(SUM(d.cantidad), 0) AS cantidad,
      v.total,
      v.estado,
      v.fecha
    FROM ventas v
    LEFT JOIN usuarios u ON u.id = v.usuario_id
    LEFT JOIN detalle_ventas d ON d.venta_id = v.id
    LEFT JOIN productos pd ON pd.id = d.producto_id
    INNER JOIN canales c ON c.id = v.canal_id
    ${whereSql}
    GROUP BY
      v.id,
      v.folio,
      v.usuario_id,
      u.nombre,
      v.canal_id,
      c.nombre,
      v.metodo_pago,
      v.monto_recibido,
      v.cambio,
      v.total,
      v.estado,
      v.fecha
    ORDER BY v.fecha DESC
  `, params);

  res.json(rows.map(mapVenta));
});

export const obtenerVentaPorId = asyncHandler(async (req, res) => {
  await asegurarColumnasVentaPos(pool);
  const venta = await obtenerVentaCompleta(pool, req.params.id);

  if (!venta) {
    return res.status(404).json({ mensaje: 'Venta no encontrada' });
  }

  if (String(req.usuario?.rol || '').trim() === 'Cajero' && venta.usuarioId !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta accion.' });
  }

  res.json(venta);
});

export const crearVenta = asyncHandler(async (req, res) => {
  const { productoId, producto_id, canalId, canal_id, cantidad, metodoPago = 'Efectivo' } = req.body;
  const finalProductoId = productoId || producto_id;
  const finalCanalId = canalId || canal_id;

  if (!finalProductoId || !finalCanalId || !cantidad) {
    return res.status(400).json({ mensaje: 'Faltan datos de la venta' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.query(
      'SELECT id, precio, stock FROM productos WHERE id = ? FOR UPDATE',
      [finalProductoId],
    );
    const product = products[0];

    if (!product) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (Number(product.stock) < Number(cantidad)) {
      await connection.rollback();
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    const total = Number(product.precio) * Number(cantidad);

    const [result] = await connection.query(
      'INSERT INTO ventas (usuario_id, canal_id, metodo_pago, total, estado) VALUES (?, ?, ?, ?, ?)',
      [req.usuario?.id || null, finalCanalId, metodoPago, total, 'Completada'],
    );

    await connection.query(
      `
        INSERT INTO detalle_ventas
          (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `,
      [result.insertId, finalProductoId, cantidad, Number(product.precio), total],
    );

    await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [
      cantidad,
      finalProductoId,
    ]);

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

export const crearVentaPos = asyncHandler(async (req, res) => {
  const {
    productos = [],
    metodoPago = 'Efectivo',
    cajeroId = null,
    usuarioActualId = null,
    usuario_id = null,
    canalId,
    canal_id,
    montoRecibido,
    cambio = 0,
    reservaToken = '',
    reserva_token = '',
  } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ mensaje: 'El carrito no puede estar vacio' });
  }

  const productosSolicitados = productos.map((item) => ({
    productoId: Number(item.productoId || item.producto_id),
    cantidad: Number(item.cantidad),
  }));

  const productoInvalido = productosSolicitados.find(
    (item) => !item.productoId || !item.cantidad || item.cantidad <= 0,
  );

  if (productoInvalido) {
    return res.status(400).json({ mensaje: 'Productos o cantidades invalidas' });
  }

  const connection = await pool.getConnection();

  try {
    await asegurarColumnasVentaPos(connection);
    await asegurarColumnaActivoCanales(connection);
    await asegurarSchemaReservasStock(connection);
    await connection.beginTransaction();
    await limpiarReservasExpiradas(connection);

    const vendidos = [];
    const tokenReservaFinal = String(reservaToken || reserva_token || '').trim();

    for (const item of productosSolicitados) {
      const [rows] = await connection.query(
        `
          SELECT id, nombre, precio, stock
          FROM productos
          WHERE id = ? AND estado <> 'Inactivo'
          FOR UPDATE
        `,
        [item.productoId],
      );

      const producto = rows[0];

      if (!producto) {
        await connection.rollback();
        return res.status(404).json({ mensaje: `Producto ${item.productoId} no encontrado` });
      }

      const reservadoOtros = await obtenerReservadoProducto(connection, item.productoId, tokenReservaFinal);
      const stockDisponible = Math.max(0, Number(producto.stock || 0) - reservadoOtros);

      if (stockDisponible < item.cantidad) {
        await connection.rollback();
        return res.status(400).json({ mensaje: `Stock insuficiente para ${producto.nombre}` });
      }

      const precioUnitario = Number(producto.precio);
      const subtotal = precioUnitario * item.cantidad;

      vendidos.push({
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal,
      });
    }

    const total = vendidos.reduce((sum, item) => sum + item.subtotal, 0);
    const finalCanalId = await obtenerCanalVentaId(connection, Number(canalId || canal_id || 0));

    if (!finalCanalId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No hay origenes de venta activos. Crea un origen antes de finalizar la venta.',
        mensaje: 'No hay origenes de venta activos. Crea un origen antes de finalizar la venta.',
      });
    }

    const montoRecibidoFinal = montoRecibido === undefined || montoRecibido === null
      ? total
      : Number(montoRecibido);
    const cambioFinal = Number(cambio || 0);

    const cajeroIdFinal = req.usuario?.id || cajeroId || usuarioActualId || usuario_id || null;

    const [ventaResult] = await connection.query(
      `
        INSERT INTO ventas (usuario_id, canal_id, metodo_pago, monto_recibido, cambio, total, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [cajeroIdFinal, finalCanalId, metodoPago, montoRecibidoFinal, cambioFinal, total, 'Completada'],
    );

    const ventaId = ventaResult.insertId;
    await connection.query(
      'UPDATE ventas SET folio = COALESCE(folio, ?) WHERE id = ?',
      [`POS-${String(ventaId).padStart(6, '0')}`, ventaId],
    );

    for (const item of vendidos) {
      await connection.query(
        `
          INSERT INTO detalle_ventas
            (venta_id, producto_id, cantidad, precio_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `,
        [ventaId, item.productoId, item.cantidad, item.precioUnitario, item.subtotal],
      );

      await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [
        item.cantidad,
        item.productoId,
      ]);
    }

    await completarReservaToken(connection, tokenReservaFinal);

    await connection.commit();

    const ventaCompleta = await obtenerVentaCompleta(connection, ventaId);

    res.status(201).json({
      ...ventaCompleta,
      detalle: ventaCompleta.productos,
      mensaje: 'Venta POS registrada correctamente',
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
