import { pool } from '../config/db.js';

let bitacoraSchemaListo = false;

export const asegurarTablaBitacora = async (connection = pool) => {
  if (bitacoraSchemaListo) return;

  await connection.query(`
    CREATE TABLE IF NOT EXISTS bitacora_sistema (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empresa_id INT NULL,
      usuario_id INT NULL,
      modulo VARCHAR(80) NOT NULL,
      accion VARCHAR(80) NOT NULL,
      descripcion TEXT NOT NULL,
      registro_afectado_id INT NULL,
      datos_anteriores TEXT NULL,
      datos_nuevos TEXT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_bitacora_modulo (modulo),
      INDEX idx_bitacora_accion (accion),
      INDEX idx_bitacora_usuario (usuario_id),
      INDEX idx_bitacora_fecha (fecha)
    )
  `);

  bitacoraSchemaListo = true;
};

const serializarDatos = (value) => {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const registrarBitacora = async ({
  empresa_id = null,
  usuario_id = null,
  modulo,
  accion,
  descripcion,
  registro_afectado_id = null,
  datos_anteriores = null,
  datos_nuevos = null,
} = {}) => {
  try {
    if (!modulo || !accion || !descripcion) return;
    await asegurarTablaBitacora();
    await pool.query(
      `
        INSERT INTO bitacora_sistema
          (empresa_id, usuario_id, modulo, accion, descripcion, registro_afectado_id, datos_anteriores, datos_nuevos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        empresa_id,
        usuario_id,
        modulo,
        accion,
        descripcion,
        registro_afectado_id,
        serializarDatos(datos_anteriores),
        serializarDatos(datos_nuevos),
      ],
    );
  } catch (error) {
    console.warn('No se pudo registrar bitacora:', error.message);
  }
};
