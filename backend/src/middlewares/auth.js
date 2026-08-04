import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const ADMIN_ROLES = ['Administrador', 'Administrador General'];

const obtenerJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }

  return process.env.JWT_SECRET;
};

const obtenerToken = (req) => {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo === 'Bearer' && token) return token;
  return req.headers['x-auth-token'] || null;
};

export const autenticar = async (req, res, next) => {
  try {
    const token = obtenerToken(req);

    if (!token) {
      return res.status(401).json({
        message: 'Token de autenticacion requerido',
        mensaje: 'Token de autenticacion requerido',
      });
    }

    let payload;

    try {
      payload = jwt.verify(token, obtenerJwtSecret());
    } catch {
      return res.status(401).json({
        message: 'Token invalido o expirado',
        mensaje: 'Token invalido o expirado',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id FROM usuarios WHERE id = ? LIMIT 1',
      [payload.id],
    );
    const usuario = rows[0];

    if (!usuario || usuario.estado !== 'Activo') {
      return res.status(401).json({
        message: 'Sesion no valida. Inicia sesion nuevamente.',
        mensaje: 'Sesion no valida. Inicia sesion nuevamente.',
      });
    }

    req.user = {
      id: payload.id,
      empresaId: payload.empresaId,
      correo: payload.correo,
      rol: payload.rol,
    };

    req.usuario = {
      id: usuario.id,
      empresaId: usuario.empresa_id || null,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      canalId: usuario.canal_id || null,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
  const rol = String(req.usuario?.rol || req.user?.rol || '').trim();

  if (!rolesPermitidos.includes(rol)) {
    return res.status(403).json({
      message: 'No tienes permisos para realizar esta accion.',
      mensaje: 'No tienes permisos para realizar esta accion.',
    });
  }

  return next();
};

export const soloAdmin = autorizarRoles(...ADMIN_ROLES);

export const autorizarMismoUsuarioOAdmin = (req, res, next) => {
  const rol = String(req.usuario?.rol || req.user?.rol || '').trim();
  const idSolicitado = Number(req.params.id || req.body.usuarioId || req.body.usuario_id || 0);

  if (ADMIN_ROLES.includes(rol) || (idSolicitado && idSolicitado === Number(req.usuario?.id || req.user?.id))) {
    return next();
  }

  return res.status(403).json({
    message: 'No tienes permisos para realizar esta accion.',
    mensaje: 'No tienes permisos para realizar esta accion.',
  });
};
