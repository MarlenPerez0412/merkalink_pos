import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const obtenerCanales = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT id, nombre, tipo, estado
    FROM canales
    ORDER BY id ASC
  `);

  res.json(rows);
});

export const crearCanal = asyncHandler(async (req, res) => {
  const { nombre, tipo, estado = 'Activo' } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({
      mensaje: 'El nombre y tipo del canal son obligatorios',
    });
  }

  const [result] = await pool.query(
    `
    INSERT INTO canales (nombre, tipo, estado)
    VALUES (?, ?, ?)
    `,
    [nombre, tipo, estado]
  );

  res.status(201).json({
    id: result.insertId,
    mensaje: 'Canal creado correctamente',
  });
});

export const actualizarCanal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, estado = 'Activo' } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({
      mensaje: 'El nombre y tipo del canal son obligatorios',
    });
  }

  const [result] = await pool.query(
    `
    UPDATE canales
    SET nombre = ?, tipo = ?, estado = ?
    WHERE id = ?
    `,
    [nombre, tipo, estado, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      mensaje: 'Canal no encontrado',
    });
  }

  res.json({
    mensaje: 'Canal actualizado correctamente',
  });
});

export const eliminarCanal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query(
    `
    UPDATE canales
    SET estado = 'Inactivo'
    WHERE id = ?
    `,
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      mensaje: 'Canal no encontrado',
    });
  }

  res.json({
    mensaje: 'Canal desactivado correctamente',
  });
});