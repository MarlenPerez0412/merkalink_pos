import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registrarBitacora } from '../utils/bitacora.js';

const scryptAsync = promisify(scrypt);
const HASH_PREFIX = 'scrypt$';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const PASSWORD_SEGURA_MENSAJE =
  'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';

const validarPasswordSegura = (password = '') =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(String(password));

const obtenerJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }

  return process.env.JWT_SECRET;
};

const generarToken = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      empresaId: usuario.empresaId,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    obtenerJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN },
  );

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(String(password), salt, 64);
  return `${HASH_PREFIX}${salt}$${Buffer.from(hash).toString('hex')}`;
};

const verificarPassword = async (password, storedPassword = '') => {
  const stored = String(storedPassword || '');

  if (!stored.startsWith(HASH_PREFIX)) {
    return String(password) === stored;
  }

  const [, salt, hashHex] = stored.split('$');
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(String(password), salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

let usuariosSchemaListo = false;

const asegurarSchemaUsuarios = async () => {
  if (usuariosSchemaListo) return;

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME IN ('empresa_id', 'canal_id')
  `);

  const existentes = new Set(columns.map((column) => column.COLUMN_NAME));

  if (!existentes.has('empresa_id')) {
    await pool.query('ALTER TABLE usuarios ADD COLUMN empresa_id INT NULL AFTER id');
  }

  if (!existentes.has('canal_id')) {
    await pool.query('ALTER TABLE usuarios ADD COLUMN canal_id INT NULL AFTER estado');
  }

  usuariosSchemaListo = true;
};

const mapUsuario = (usuario) => ({
  id: usuario.id,
  empresaId: usuario.empresa_id || null,
  nombre: usuario.nombre,
  correo: usuario.correo,
  rol: usuario.rol,
  estado: usuario.estado || 'Activo',
  canalId: usuario.canal_id || null,
  canal: usuario.canal || null,
  fechaCreacion: usuario.fecha_creacion || null,
});

export const login = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  const [rows] = await pool.query(
    `
      SELECT id, empresa_id, nombre, correo, password, rol, estado, canal_id, fecha_creacion
      FROM usuarios
      WHERE correo = ?
        AND estado = 'Activo'
      LIMIT 1
    `,
    [correo],
  );

  const usuarioRow = rows[0];
  const passwordValida = usuarioRow ? await verificarPassword(password, usuarioRow.password) : false;

  if (!usuarioRow || !passwordValida) {
    return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
  }

  if (!String(usuarioRow.password || '').startsWith(HASH_PREFIX)) {
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [await hashPassword(password), usuarioRow.id]);
  }

  const usuario = mapUsuario(usuarioRow);

  res.json({
    mensaje: 'Inicio de sesión correcto',
    usuario,
    token: generarToken(usuario),
  });
});

export const cambiarPassword = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();
  const { usuarioId, passwordActual, nuevoPassword } = req.body;

  if (!usuarioId || !passwordActual || !nuevoPassword) {
    return res.status(400).json({ mensaje: 'Faltan datos para cambiar la contraseña' });
  }

  if (!validarPasswordSegura(nuevoPassword)) {
    return res.status(400).json({ mensaje: PASSWORD_SEGURA_MENSAJE });
  }

  const [rows] = await pool.query(
    'SELECT id, password FROM usuarios WHERE id = ? AND estado = ? LIMIT 1',
    [usuarioId, 'Activo'],
  );

  if (!rows[0] || !(await verificarPassword(passwordActual, rows[0].password))) {
    return res.status(401).json({ mensaje: 'La contraseña actual no es correcta' });
  }

  await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [await hashPassword(nuevoPassword), usuarioId]);

  res.json({ mensaje: 'Contraseña actualizada correctamente' });
});

export const actualizarPerfil = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();
  const { id } = req.params;
  const { nombre, correo } = req.body;

  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  if (!correo) return res.status(400).json({ mensaje: 'El correo es obligatorio' });

  const [existentes] = await pool.query(
    'SELECT id FROM usuarios WHERE correo = ? AND id <> ? LIMIT 1',
    [correo, id],
  );

  if (existentes[0]) return res.status(409).json({ mensaje: 'Ya existe otro usuario con ese correo' });

  const [result] = await pool.query(
    'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
    [nombre, correo, id],
  );

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  const [rows] = await pool.query(
    'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id, fecha_creacion FROM usuarios WHERE id = ? LIMIT 1',
    [id],
  );

  res.json({ mensaje: 'Perfil actualizado correctamente', usuario: mapUsuario(rows[0]) });
});

export const obtenerUsuarios = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();

  const [rows] = await pool.query(`
    SELECT u.id, u.empresa_id, u.nombre, u.correo, u.rol, u.estado, u.canal_id, u.fecha_creacion, c.nombre AS canal
    FROM usuarios u
    LEFT JOIN canales c ON c.id = u.canal_id
    ORDER BY u.id DESC
  `);

  res.json(rows.map(mapUsuario));
});

export const crearUsuario = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();

  const {
    empresaId = null,
    nombre,
    correo,
    password,
    rol,
    estado = 'Activo',
    canalId = null,
  } = req.body;

  if (!String(nombre || '').trim()) return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  if (!String(correo || '').trim()) return res.status(400).json({ mensaje: 'El correo es obligatorio' });
  if (!password) return res.status(400).json({ mensaje: 'La contraseña temporal es obligatoria' });
  if (!validarPasswordSegura(password)) return res.status(400).json({ mensaje: PASSWORD_SEGURA_MENSAJE });
  if (!['Administrador', 'Cajero'].includes(rol)) return res.status(400).json({ mensaje: 'Rol no valido' });

  const [existentes] = await pool.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
  if (existentes[0]) return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo' });

  const [result] = await pool.query(
    `
      INSERT INTO usuarios (empresa_id, nombre, correo, password, rol, estado, canal_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [empresaId, nombre.trim(), correo.trim(), await hashPassword(password), rol, estado || 'Activo', canalId || null],
  );

  await registrarBitacora({
    modulo: 'Usuarios',
    accion: 'Crear usuario',
    descripcion: `Se creo el usuario ${nombre.trim()} con rol ${rol}.`,
    registro_afectado_id: result.insertId,
    datos_nuevos: {
      id: result.insertId,
      empresa_id: empresaId,
      nombre: nombre.trim(),
      correo: correo.trim(),
      rol,
      estado: estado || 'Activo',
      canal_id: canalId || null,
    },
  });

  res.status(201).json({ id: result.insertId, mensaje: 'Usuario creado correctamente' });
});

export const actualizarUsuario = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();

  const { id } = req.params;
  const { nombre, correo, password, rol, estado = 'Activo', canalId = null } = req.body;

  if (!String(nombre || '').trim()) return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  if (!String(correo || '').trim()) return res.status(400).json({ mensaje: 'El correo es obligatorio' });
  if (password && !validarPasswordSegura(password)) return res.status(400).json({ mensaje: PASSWORD_SEGURA_MENSAJE });
  if (!['Administrador', 'Cajero'].includes(rol)) return res.status(400).json({ mensaje: 'Rol no valido' });

  const [existentes] = await pool.query('SELECT id FROM usuarios WHERE correo = ? AND id <> ? LIMIT 1', [correo, id]);
  if (existentes[0]) return res.status(409).json({ mensaje: 'Ya existe otro usuario con ese correo' });

  const passwordSql = password ? ', password = ?' : '';
  const [anteriores] = await pool.query(
    'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id, fecha_creacion FROM usuarios WHERE id = ? LIMIT 1',
    [id],
  );
  const anterior = anteriores[0];
  const values = [nombre.trim(), correo.trim(), rol, estado || 'Activo', canalId || null];
  if (password) values.push(await hashPassword(password));
  values.push(id);

  const [result] = await pool.query(
    `
      UPDATE usuarios
      SET nombre = ?, correo = ?, rol = ?, estado = ?, canal_id = ?${passwordSql}
      WHERE id = ?
    `,
    values,
  );

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  const nuevo = {
    ...(anterior || {}),
    nombre: nombre.trim(),
    correo: correo.trim(),
    rol,
    estado: estado || 'Activo',
    canal_id: canalId || null,
  };

  await registrarBitacora({
    modulo: 'Usuarios',
    accion: 'Editar usuario',
    descripcion: `Se edito el usuario ${nombre.trim()}.`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: nuevo,
  });

  if (anterior && anterior.rol !== rol) {
    await registrarBitacora({
      modulo: 'Usuarios',
      accion: 'Cambiar rol',
      descripcion: `Se cambio el rol de ${nombre.trim()} de ${anterior.rol} a ${rol}.`,
      registro_afectado_id: Number(id),
      datos_anteriores: { rol: anterior.rol },
      datos_nuevos: { rol },
    });
  }

  if (anterior && anterior.estado !== (estado || 'Activo')) {
    await registrarBitacora({
      modulo: 'Usuarios',
      accion: 'Cambiar estado',
      descripcion: `Se cambio el estado de ${nombre.trim()} de ${anterior.estado} a ${estado || 'Activo'}.`,
      registro_afectado_id: Number(id),
      datos_anteriores: { estado: anterior.estado },
      datos_nuevos: { estado: estado || 'Activo' },
    });
  }

  res.json({ mensaje: 'Usuario actualizado correctamente' });
});

export const desactivarUsuario = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();
  if (Number(req.params.id) === Number(req.usuario?.id || req.user?.id || 0)) {
    return res.status(400).json({ mensaje: 'No puedes desactivar tu propio usuario desde esta sección.' });
  }

  const [anteriores] = await pool.query(
    'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id, fecha_creacion FROM usuarios WHERE id = ? LIMIT 1',
    [req.params.id],
  );
  const anterior = anteriores[0];

  const [result] = await pool.query('UPDATE usuarios SET estado = ? WHERE id = ?', ['Inactivo', req.params.id]);

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  await registrarBitacora({
    modulo: 'Usuarios',
    accion: 'Desactivar usuario',
    descripcion: `Se desactivo el usuario ${anterior?.nombre || req.params.id}.`,
    registro_afectado_id: Number(req.params.id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado: 'Inactivo' },
  });

  res.json({ mensaje: 'Usuario desactivado correctamente' });
});

export const activarUsuario = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();
  const [anteriores] = await pool.query(
    'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id, fecha_creacion FROM usuarios WHERE id = ? LIMIT 1',
    [req.params.id],
  );
  const anterior = anteriores[0];

  const [result] = await pool.query('UPDATE usuarios SET estado = ? WHERE id = ?', ['Activo', req.params.id]);

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  await registrarBitacora({
    modulo: 'Usuarios',
    accion: 'Activar usuario',
    descripcion: `Se activo el usuario ${anterior?.nombre || req.params.id}.`,
    registro_afectado_id: Number(req.params.id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado: 'Activo' },
  });

  res.json({ mensaje: 'Usuario activado correctamente' });
});

export const eliminarUsuario = asyncHandler(async (req, res) => {
  await asegurarSchemaUsuarios();

  const usuarioId = Number(req.params.id);
  if (usuarioId === Number(req.usuario?.id || req.user?.id || 0)) {
    return res.status(400).json({ mensaje: 'No puedes eliminar tu propio usuario desde esta sección.' });
  }

  const [anteriores] = await pool.query(
    'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id, fecha_creacion FROM usuarios WHERE id = ? LIMIT 1',
    [usuarioId],
  );
  const anterior = anteriores[0];

  if (!anterior) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [usuarioId]);

    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await registrarBitacora({
      modulo: 'Usuarios',
      accion: 'Eliminar usuario',
      descripcion: `Se elimino el usuario ${anterior.nombre}.`,
      registro_afectado_id: usuarioId,
      datos_anteriores: anterior,
    });

    return res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2' || error?.errno === 1451) {
      return res.status(409).json({
        mensaje: 'No se puede eliminar este usuario porque tiene historial relacionado. Desactívalo para bloquear su acceso sin perder registros.',
      });
    }

    throw error;
  }
});
