import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const obtenerEmpresa = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM empresa ORDER BY id ASC LIMIT 1');
  res.json(rows[0] || null);
});
