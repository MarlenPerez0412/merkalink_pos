import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const MINUTOS_RESERVA = 10;

export const asegurarSchemaReservasStock = async (connection = pool) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reservas_stock (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token VARCHAR(120) NOT NULL,
      usuario_id INT NULL,
      producto_id INT NOT NULL,
      cantidad INT NOT NULL DEFAULT 0,
      estado ENUM('Activa', 'Completada', 'Cancelada', 'Expirada') NOT NULL DEFAULT 'Activa',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      fecha_expiracion DATETIME NOT NULL,
      UNIQUE KEY uq_reserva_token_producto (token, producto_id),
      INDEX idx_reservas_producto_estado (producto_id, estado, fecha_expiracion),
      INDEX idx_reservas_token_estado (token, estado),
      CONSTRAINT fk_reservas_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);
};

export const limpiarReservasExpiradas = async (connection = pool) => {
  await connection.query(`
    UPDATE reservas_stock
    SET estado = 'Expirada'
    WHERE estado = 'Activa'
      AND fecha_expiracion <= NOW()
  `);
};

export const obtenerReservadoProducto = async (connection, productoId, tokenExcluir = '') => {
  await limpiarReservasExpiradas(connection);

  const params = [productoId];
  let filtroToken = '';

  if (tokenExcluir) {
    filtroToken = 'AND token <> ?';
    params.push(tokenExcluir);
  }

  const [rows] = await connection.query(
    `
      SELECT COALESCE(SUM(cantidad), 0) AS reservado
      FROM reservas_stock
      WHERE producto_id = ?
        AND estado = 'Activa'
        AND fecha_expiracion > NOW()
        ${filtroToken}
    `,
    params,
  );

  return Number(rows[0]?.reservado || 0);
};

export const completarReservaToken = async (connection, token) => {
  if (!token) return;
  await asegurarSchemaReservasStock(connection);
  await connection.query(
    `
      UPDATE reservas_stock
      SET estado = 'Completada'
      WHERE token = ?
        AND estado = 'Activa'
    `,
    [token],
  );
};

export const reservarStock = asyncHandler(async (req, res) => {
  const token = String(req.body.token || '').trim();
  const productoId = Number(req.body.productoId || req.body.producto_id);
  const cantidad = Number(req.body.cantidad || 0);

  if (!token || !productoId || cantidad < 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos de reserva invalidos',
      mensaje: 'Datos de reserva invalidos',
    });
  }

  const connection = await pool.getConnection();

  try {
    await asegurarSchemaReservasStock(connection);
    await connection.beginTransaction();
    await limpiarReservasExpiradas(connection);

    const [productos] = await connection.query(
      `
        SELECT id, nombre, stock
        FROM productos
        WHERE id = ? AND COALESCE(estado, 'Activo') <> 'Inactivo'
        FOR UPDATE
      `,
      [productoId],
    );

    const producto = productos[0];

    if (!producto) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const reservadoOtros = await obtenerReservadoProducto(connection, productoId, token);
    const stockFisico = Number(producto.stock || 0);
    const disponibleParaToken = Math.max(0, stockFisico - reservadoOtros);

    if (cantidad > disponibleParaToken) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: `Solo hay ${disponibleParaToken} unidades disponibles para ${producto.nombre}.`,
        mensaje: `Solo hay ${disponibleParaToken} unidades disponibles para ${producto.nombre}.`,
        stockDisponible: disponibleParaToken,
      });
    }

    if (cantidad === 0) {
      await connection.query(
        `
          UPDATE reservas_stock
          SET estado = 'Cancelada'
          WHERE token = ? AND producto_id = ? AND estado = 'Activa'
        `,
        [token, productoId],
      );
    } else {
      await connection.query(
        `
          INSERT INTO reservas_stock
            (token, usuario_id, producto_id, cantidad, estado, fecha_expiracion)
          VALUES (?, ?, ?, ?, 'Activa', DATE_ADD(NOW(), INTERVAL ${MINUTOS_RESERVA} MINUTE))
          ON DUPLICATE KEY UPDATE
            usuario_id = VALUES(usuario_id),
            cantidad = VALUES(cantidad),
            estado = 'Activa',
            fecha_expiracion = VALUES(fecha_expiracion),
            fecha_actualizacion = CURRENT_TIMESTAMP
        `,
        [token, req.usuario?.id || req.user?.id || null, productoId, cantidad],
      );
    }

    await connection.commit();

    res.json({
      success: true,
      productoId,
      cantidadReservada: cantidad,
      stockFisico,
      stockDisponible: Math.max(0, disponibleParaToken - cantidad),
      minutosReserva: MINUTOS_RESERVA,
      mensaje: cantidad > 0 ? 'Stock reservado temporalmente' : 'Reserva liberada',
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const liberarReserva = asyncHandler(async (req, res) => {
  const token = String(req.params.token || req.body.token || '').trim();

  if (!token) {
    return res.status(400).json({ mensaje: 'Token de reserva requerido' });
  }

  await asegurarSchemaReservasStock();
  await pool.query(
    `
      UPDATE reservas_stock
      SET estado = 'Cancelada'
      WHERE token = ? AND estado = 'Activa'
    `,
    [token],
  );

  res.json({ success: true, mensaje: 'Reserva liberada correctamente' });
});
