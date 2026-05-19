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
