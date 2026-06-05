import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapRetiro = (retiro) => ({
  id: retiro.id,
  usuarioId: retiro.usuario_id,
  usuario: retiro.usuario,
  monto: Number(retiro.monto || 0),
  motivo: retiro.motivo,
  fecha: retiro.fecha,
  estado: retiro.estado,
});

export const obtenerResumenCaja = asyncHandler(async (req, res) => {
  const [ventas] = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS efectivo
    FROM ventas
    WHERE metodo_pago = 'Efectivo'
  `);

  const [retiros] = await pool.query(`
    SELECT COALESCE(SUM(monto), 0) AS retirado
    FROM retiros_caja
    WHERE estado = 'Activo'
  `);

  const efectivo = Number(ventas[0]?.efectivo || 0);
  const retirado = Number(retiros[0]?.retirado || 0);

  res.json({
    efectivo,
    retirado,
    disponible: Math.max(0, efectivo - retirado),
  });
});

export const obtenerRetiros = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT r.*, u.nombre AS usuario
    FROM retiros_caja r
    LEFT JOIN usuarios u ON u.id = r.usuario_id
    ORDER BY r.fecha DESC
  `);

  res.json(rows.map(mapRetiro));
});

export const crearRetiro = asyncHandler(async (req, res) => {
  const { usuarioId, monto, motivo } = req.body;
  const montoNumero = Number(monto);

  if (!usuarioId || !montoNumero || montoNumero <= 0 || !motivo) {
    return res.status(400).json({ mensaje: 'Usuario, monto y motivo son obligatorios' });
  }

  const [ventas] = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS efectivo
    FROM ventas
    WHERE metodo_pago = 'Efectivo'
  `);

  const [retiros] = await pool.query(`
    SELECT COALESCE(SUM(monto), 0) AS retirado
    FROM retiros_caja
    WHERE estado = 'Activo'
  `);

  const disponible = Number(ventas[0]?.efectivo || 0) - Number(retiros[0]?.retirado || 0);

  if (montoNumero > disponible) {
    return res.status(400).json({
      mensaje: 'No se puede retirar un monto mayor al efectivo disponible en caja.',
    });
  }

  const [result] = await pool.query(
    `
      INSERT INTO retiros_caja (usuario_id, monto, motivo, estado)
      VALUES (?, ?, ?, 'Activo')
    `,
    [usuarioId, montoNumero, motivo],
  );

  res.status(201).json({
    id: result.insertId,
    mensaje: 'Retiro registrado correctamente',
  });
});
