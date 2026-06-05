import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registrarBitacora } from '../utils/bitacora.js';

let empresaSchemaListo = false;

const columnasEmpresa = [
  ['nombre', 'VARCHAR(150) NULL'],
  ['giro', 'VARCHAR(255) NULL'],
  ['direccion', 'VARCHAR(255) NULL'],
  ['telefono', 'VARCHAR(50) NULL'],
  ['correo', 'VARCHAR(120) NULL'],
  ['mision', 'TEXT NULL'],
  ['vision', 'TEXT NULL'],
  ['valores', 'TEXT NULL'],
];

const asegurarTablaEmpresa = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS empresa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(150) NULL,
      giro VARCHAR(255) NULL,
      direccion VARCHAR(255) NULL,
      telefono VARCHAR(50) NULL,
      correo VARCHAR(120) NULL,
      mision TEXT NULL,
      vision TEXT NULL,
      valores TEXT NULL
    )
  `);

  if (empresaSchemaListo) return;

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'empresa'
  `);
  const existentes = new Set(columns.map((column) => column.COLUMN_NAME));

  for (const [nombre, definicion] of columnasEmpresa) {
    if (!existentes.has(nombre)) {
      await pool.query(`ALTER TABLE empresa ADD COLUMN ${nombre} ${definicion}`);
    }
  }

  empresaSchemaListo = true;
};

export const obtenerEmpresa = asyncHandler(async (req, res) => {
  await asegurarTablaEmpresa();
  const [rows] = await pool.query('SELECT * FROM empresa ORDER BY id ASC LIMIT 1');
  res.json(rows[0] || null);
});

export const actualizarEmpresa = asyncHandler(async (req, res) => {
  await asegurarTablaEmpresa();

  const {
    nombre,
    giro,
    direccion,
    telefono,
    correo,
    mision,
    vision,
    valores,
  } = req.body;

  const [rows] = await pool.query('SELECT id FROM empresa ORDER BY id ASC LIMIT 1');
  const empresaActual = rows[0];

  if (!empresaActual) {
    const [result] = await pool.query(
      `
        INSERT INTO empresa (nombre, giro, direccion, telefono, correo, mision, vision, valores)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [nombre, giro, direccion, telefono, correo, mision, vision, valores],
    );

    await registrarBitacora({
      modulo: 'Configuración',
      accion: 'Editar datos de empresa',
      descripcion: `Se crearon los datos de empresa ${nombre || 'MercaLink POS'}.`,
      registro_afectado_id: result.insertId,
      datos_nuevos: { id: result.insertId, nombre, giro, direccion, telefono, correo, mision, vision, valores },
    });

    return res.status(201).json({
      id: result.insertId,
      mensaje: 'Empresa creada correctamente',
    });
  }

  const [anteriores] = await pool.query('SELECT * FROM empresa WHERE id = ? LIMIT 1', [empresaActual.id]);

  await pool.query(
    `
      UPDATE empresa
      SET nombre = ?,
          giro = ?,
          direccion = ?,
          telefono = ?,
          correo = ?,
          mision = ?,
          vision = ?,
          valores = ?
      WHERE id = ?
    `,
    [nombre, giro, direccion, telefono, correo, mision, vision, valores, empresaActual.id],
  );

  await registrarBitacora({
    modulo: 'Configuración',
    accion: 'Editar datos de empresa',
    descripcion: `Se editaron los datos de empresa ${nombre || empresaActual.id}.`,
    registro_afectado_id: empresaActual.id,
    datos_anteriores: anteriores[0] || null,
    datos_nuevos: { ...(anteriores[0] || {}), nombre, giro, direccion, telefono, correo, mision, vision, valores },
  });

  res.json({ mensaje: 'Empresa actualizada correctamente' });
});

export const subirLogoEmpresa = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      mensaje: 'Selecciona una imagen válida para el logo.',
      message: 'Selecciona una imagen válida para el logo.',
    });
  }

  await registrarBitacora({
    modulo: 'Configuración',
    accion: 'Actualizar logo de empresa',
    descripcion: 'Se actualizó el logo de la empresa.',
    datos_nuevos: { logoUrl: '/images/logo-empresa.png' },
  });

  return res.status(201).json({
    url: '/images/logo-empresa.png',
    logoUrl: '/images/logo-empresa.png',
    mensaje: 'Logo actualizado correctamente',
  });
});
