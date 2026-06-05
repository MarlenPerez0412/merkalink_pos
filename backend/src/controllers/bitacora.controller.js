import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { asegurarTablaBitacora } from '../utils/bitacora.js';

const parseJsonSeguro = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const mapBitacora = (row) => ({
  id: row.id,
  empresaId: row.empresa_id || null,
  usuarioId: row.usuario_id || null,
  usuario: row.usuario || null,
  modulo: row.modulo,
  accion: row.accion,
  descripcion: row.descripcion,
  registroAfectadoId: row.registro_afectado_id || null,
  datosAnteriores: parseJsonSeguro(row.datos_anteriores),
  datosNuevos: parseJsonSeguro(row.datos_nuevos),
  fecha: row.fecha,
});

export const obtenerBitacora = asyncHandler(async (req, res) => {
  await asegurarTablaBitacora();

  const { modulo, accion, fecha_inicio, fecha_fin, usuario_id } = req.query;
  const filtros = [];
  const params = [];

  if (modulo) {
    filtros.push('b.modulo = ?');
    params.push(modulo);
  }

  if (accion) {
    filtros.push('b.accion = ?');
    params.push(accion);
  }

  if (usuario_id) {
    filtros.push('b.usuario_id = ?');
    params.push(usuario_id);
  }

  if (fecha_inicio) {
    filtros.push('DATE(b.fecha) >= ?');
    params.push(fecha_inicio);
  }

  if (fecha_fin) {
    filtros.push('DATE(b.fecha) <= ?');
    params.push(fecha_fin);
  }

  const whereSql = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      SELECT b.*, u.nombre AS usuario
      FROM bitacora_sistema b
      LEFT JOIN usuarios u ON u.id = b.usuario_id
      ${whereSql}
      ORDER BY b.fecha DESC
      LIMIT 500
    `,
    params,
  );

  res.json({ success: true, data: rows.map(mapBitacora) });
});

export const obtenerBitacoraPorId = asyncHandler(async (req, res) => {
  await asegurarTablaBitacora();

  const [rows] = await pool.query(
    `
      SELECT b.*, u.nombre AS usuario
      FROM bitacora_sistema b
      LEFT JOIN usuarios u ON u.id = b.usuario_id
      WHERE b.id = ?
      LIMIT 1
    `,
    [req.params.id],
  );

  if (!rows[0]) return res.status(404).json({ success: false, mensaje: 'Movimiento no encontrado' });

  res.json({ success: true, data: mapBitacora(rows[0]) });
});
