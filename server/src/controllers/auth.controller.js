import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      mensaje: 'Correo y contraseña son obligatorios',
    });
  }

  const [rows] = await pool.query(
    `
      SELECT id, nombre, correo, rol, estado
      FROM usuarios
      WHERE correo = ?
        AND password = ?
        AND estado = 'Activo'
      LIMIT 1
    `,
    [correo, password],
  );

  if (rows.length === 0) {
    return res.status(401).json({
      mensaje: 'Correo o contraseña incorrectos',
    });
  }

  const usuario = rows[0];

  res.json({
    mensaje: 'Inicio de sesión correcto',
    usuario,
    token: `demo-token-${usuario.id}`,
  });
});