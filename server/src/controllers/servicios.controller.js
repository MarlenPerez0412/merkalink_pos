import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapServicio = (servicio) => ({
  id: servicio.id,
  cliente: servicio.cliente,
  telefonoCliente: servicio.telefono_cliente,
  equipo: servicio.equipo,
  servicio: servicio.servicio,
  canalId: servicio.canal_id,
  canal: servicio.canal,
  estado: servicio.estado,
  fechaEntrega: servicio.fecha_entrega,
  horaEntrega: servicio.hora_entrega,
  prioridad: servicio.prioridad,
  observaciones: servicio.observaciones,
  fechaRegistro: servicio.fecha_registro,
});

export const obtenerServicios = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      s.*,
      c.nombre AS canal
    FROM servicios s
    LEFT JOIN canales c ON c.id = s.canal_id
    ORDER BY s.fecha_registro DESC
  `);

  res.json(rows.map(mapServicio));
});
