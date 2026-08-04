import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registrarBitacora } from '../utils/bitacora.js';

let canalesSchemaListo = false;

const normalizarTipoCanal = (nombre = '', tipo = '') => {
  const texto = `${nombre} ${tipo}`.toLowerCase();
  if (texto.includes('mostrador') || texto.includes('punto') || texto.includes('presencial')) {
    return 'Presencial';
  }
  return 'Digital';
};

const asegurarColumnaActivo = async () => {
  if (canalesSchemaListo) return;

  const [columns] = await pool.query(
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
    await pool.query('ALTER TABLE canales ADD COLUMN activo TINYINT DEFAULT 1');
  }

  canalesSchemaListo = true;
};

export const obtenerCanales = asyncHandler(async (req, res) => {
  await asegurarColumnaActivo();

  const [rows] = await pool.query(`
    SELECT
      c.id,
      c.nombre,
      c.tipo,
      c.activo,
      c.estado,
      COUNT(v.id) AS totalVentas,
      COALESCE(SUM(v.total), 0) AS totalVendido
    FROM canales c
    LEFT JOIN ventas v ON v.canal_id = c.id AND v.estado <> 'Cancelada'
    GROUP BY c.id, c.nombre, c.tipo, c.activo, c.estado
    ORDER BY c.activo DESC, c.nombre ASC
  `);

  res.json(rows.map((canal) => ({
    ...canal,
    totalVentas: Number(canal.totalVentas || 0),
    totalVendido: Number(canal.totalVendido || 0),
  })));
});

export const crearCanal = asyncHandler(async (req, res) => {
  const { nombre, tipo, estado = 'Activo' } = req.body;
  await asegurarColumnaActivo();
  const nombreLimpio = String(nombre || '').trim();

  if (!nombreLimpio || !tipo) {
    return res.status(400).json({
      success: false,
      message: 'El nombre y tipo del origen de venta son obligatorios',
      mensaje: 'El nombre y tipo del canal son obligatorios',
    });
  }

  const [existentes] = await pool.query('SELECT * FROM canales WHERE LOWER(nombre) = LOWER(?) LIMIT 1', [nombreLimpio]);
  const existente = existentes[0];

  if (existente) {
    return res.status(409).json({
      success: false,
      message: Number(existente.activo ?? 1) === 1 && String(existente.estado || 'Activo') !== 'Inactivo'
        ? 'Este origen de venta ya existe.'
        : 'Este origen de venta ya existe como desactivado. Activalo desde la lista si deseas usarlo nuevamente.',
      mensaje: Number(existente.activo ?? 1) === 1 && String(existente.estado || 'Activo') !== 'Inactivo'
        ? 'Este origen de venta ya existe.'
        : 'Este origen de venta ya existe como desactivado. Activalo desde la lista si deseas usarlo nuevamente.',
    });
  }

  const [result] = await pool.query(
    `
    INSERT INTO canales (nombre, tipo, estado, activo)
    VALUES (?, ?, ?, ?)
    `,
    [nombreLimpio, normalizarTipoCanal(nombreLimpio, tipo), estado, 1]
  );

  await registrarBitacora({
    modulo: 'Origen de venta',
    accion: 'Crear origen',
    descripcion: `Se creo el origen de venta "${nombreLimpio}".`,
    registro_afectado_id: result.insertId,
    datos_nuevos: { id: result.insertId, nombre: nombreLimpio, tipo: normalizarTipoCanal(nombreLimpio, tipo), estado, activo: 1 },
  });

  res.status(201).json({
    id: result.insertId,
    success: true,
    message: 'Origen de venta creado correctamente',
    mensaje: 'Canal creado correctamente',
  });
});

export const actualizarCanal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, estado = 'Activo' } = req.body;
  await asegurarColumnaActivo();
  const nombreLimpio = String(nombre || '').trim();

  if (!nombreLimpio || !tipo) {
    return res.status(400).json({
      success: false,
      message: 'El nombre y tipo del origen de venta son obligatorios',
      mensaje: 'El nombre y tipo del canal son obligatorios',
    });
  }

  const [duplicados] = await pool.query('SELECT id, estado, activo FROM canales WHERE LOWER(nombre) = LOWER(?) AND id <> ? LIMIT 1', [nombreLimpio, id]);
  if (duplicados[0]) {
    return res.status(409).json({
      success: false,
      message: 'Este origen de venta ya existe.',
      mensaje: 'Este origen de venta ya existe.',
    });
  }

  const [anteriores] = await pool.query('SELECT * FROM canales WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];

  const [result] = await pool.query(
    `
    UPDATE canales
    SET nombre = ?, tipo = ?, estado = ?, activo = ?
    WHERE id = ?
    `,
    [nombreLimpio, normalizarTipoCanal(nombreLimpio, tipo), estado, 1, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Origen de venta no encontrado',
      mensaje: 'Canal no encontrado',
    });
  }

  await registrarBitacora({
    modulo: 'Origen de venta',
    accion: 'Editar origen',
    descripcion: `Se actualizo el origen de venta "${nombreLimpio}".`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), nombre: nombreLimpio, tipo: normalizarTipoCanal(nombreLimpio, tipo), estado, activo: 1 },
  });

  res.json({
    success: true,
    message: 'Origen de venta actualizado correctamente',
    mensaje: 'Canal actualizado correctamente',
  });
});

export const desactivarCanal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await asegurarColumnaActivo();

  const [anteriores] = await pool.query('SELECT * FROM canales WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];

  const [result] = await pool.query(
    `
    UPDATE canales
    SET estado = 'Inactivo', activo = 0
    WHERE id = ?
    `,
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Origen de venta no encontrado',
      mensaje: 'Canal no encontrado',
    });
  }

  await registrarBitacora({
    modulo: 'Origen de venta',
    accion: 'Desactivar origen',
    descripcion: `Se desactivo el origen de venta "${anterior?.nombre || id}".`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado: 'Inactivo', activo: 0 },
  });

  res.json({
    success: true,
    message: 'Origen de venta desactivado correctamente',
    mensaje: 'Canal desactivado correctamente',
  });
});

export const eliminarCanal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await asegurarColumnaActivo();

  const [anteriores] = await pool.query('SELECT * FROM canales WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];

  const [result] = await pool.query(
    `
    UPDATE canales
    SET estado = 'Inactivo', activo = 0
    WHERE id = ?
    `,
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Origen de venta no encontrado',
      mensaje: 'Canal no encontrado',
    });
  }

  await registrarBitacora({
    modulo: 'Origen de venta',
    accion: 'Eliminar origen',
    descripcion: `El usuario elimino/desactivo el origen "${anterior?.nombre || id}".`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado: 'Inactivo', activo: 0 },
  });

  res.json({
    success: true,
    message: 'Origen de venta desactivado correctamente',
    mensaje: 'Canal desactivado correctamente',
  });
});

