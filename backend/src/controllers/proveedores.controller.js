import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let proveedoresSchemaListo = false;

export const asegurarSchemaProveedores = async (connection = pool) => {
  if (proveedoresSchemaListo) return;

  await connection.query(`
    CREATE TABLE IF NOT EXISTS proveedores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empresa_id INT NULL,
      nombre VARCHAR(100) NOT NULL,
      telefono VARCHAR(20) NULL,
      correo VARCHAR(100) NULL,
      direccion TEXT NULL,
      estado ENUM('activo','inactivo') DEFAULT 'activo',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [columns] = await connection.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'proveedor_id'
    LIMIT 1
  `);

  if (!columns[0]) {
    await connection.query('ALTER TABLE productos ADD COLUMN proveedor_id INT NULL AFTER categoria_id');
  }

  proveedoresSchemaListo = true;
};

const mapProveedor = (proveedor) => ({
  id: proveedor.id,
  empresaId: proveedor.empresa_id || null,
  nombre: proveedor.nombre,
  telefono: proveedor.telefono || '',
  correo: proveedor.correo || '',
  direccion: proveedor.direccion || '',
  estado: proveedor.estado || 'activo',
  fechaCreacion: proveedor.fecha_creacion || null,
});

export const obtenerProveedores = asyncHandler(async (req, res) => {
  await asegurarSchemaProveedores();

  const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY nombre ASC');
  res.json(rows.map(mapProveedor));
});

export const crearProveedor = asyncHandler(async (req, res) => {
  await asegurarSchemaProveedores();

  const { empresaId = null, nombre, telefono = '', correo = '', direccion = '', estado = 'activo' } = req.body;
  if (!String(nombre || '').trim()) return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio' });

  const [result] = await pool.query(
    `
      INSERT INTO proveedores (empresa_id, nombre, telefono, correo, direccion, estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [empresaId, nombre.trim(), telefono || null, correo || null, direccion || null, estado],
  );

  res.status(201).json({ id: result.insertId, mensaje: 'Proveedor creado correctamente' });
});

export const actualizarProveedor = asyncHandler(async (req, res) => {
  await asegurarSchemaProveedores();

  const { nombre, telefono = '', correo = '', direccion = '', estado = 'activo' } = req.body;
  if (!String(nombre || '').trim()) return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio' });

  const [result] = await pool.query(
    `
      UPDATE proveedores
      SET nombre = ?, telefono = ?, correo = ?, direccion = ?, estado = ?
      WHERE id = ?
    `,
    [nombre.trim(), telefono || null, correo || null, direccion || null, estado, req.params.id],
  );

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });

  res.json({ mensaje: 'Proveedor actualizado correctamente' });
});

export const desactivarProveedor = asyncHandler(async (req, res) => {
  await asegurarSchemaProveedores();

  const [result] = await pool.query('UPDATE proveedores SET estado = ? WHERE id = ?', ['inactivo', req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });

  res.json({ mensaje: 'Proveedor desactivado correctamente' });
});

export const activarProveedor = asyncHandler(async (req, res) => {
  await asegurarSchemaProveedores();

  const [result] = await pool.query('UPDATE proveedores SET estado = ? WHERE id = ?', ['activo', req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });

  res.json({ mensaje: 'Proveedor activado correctamente' });
});

export const eliminarProveedor = asyncHandler(async (req, res) => {
  await asegurarSchemaProveedores();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [proveedores] = await connection.query('SELECT id FROM proveedores WHERE id = ? LIMIT 1', [req.params.id]);
    if (!proveedores[0]) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    await connection.query('UPDATE productos SET proveedor_id = NULL WHERE proveedor_id = ?', [req.params.id]);
    await connection.query('DELETE FROM proveedores WHERE id = ?', [req.params.id]);
    await connection.commit();

    return res.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
