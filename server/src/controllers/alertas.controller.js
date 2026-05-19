import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapAlerta = (alerta) => ({
  id: alerta.id,
  productoId: alerta.producto_id,
  producto: alerta.producto,
  servicioId: alerta.servicio_id,
  servicio: alerta.servicio,
  tipo: alerta.tipo,
  mensaje: alerta.mensaje,
  nivel: alerta.nivel,
  estado: alerta.estado,
  fecha: alerta.fecha,
});

export const obtenerAlertas = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      a.*,
      p.nombre AS producto,
      s.servicio AS servicio
    FROM alertas a
    LEFT JOIN productos p ON p.id = a.producto_id
    LEFT JOIN servicios s ON s.id = a.servicio_id
    ORDER BY a.fecha DESC
  `);

  res.json(rows.map(mapAlerta));
});

export const actualizarEstadoAlerta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado = 'Vista' } = req.body;

  const [result] = await pool.query('UPDATE alertas SET estado = ? WHERE id = ?', [estado, id]);

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Alerta no encontrada' });

  res.json({ mensaje: 'Estado de alerta actualizado correctamente' });
});
