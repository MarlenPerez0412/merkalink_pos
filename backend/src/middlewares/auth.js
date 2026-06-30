import { pool } from '../config/db.js';

const ADMIN_ROLES = ['Administrador', 'Administrador General'];

const obtenerToken = (req) => {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo?.toLowerCase() === 'bearer' && token) return token;
  return req.headers['x-auth-token'] || null;
};

const obtenerUsuarioIdDesdeToken = (token = '') => {
  const match = String(token).match(/^demo-token-(\d+)$/);
  return match ? Number(match[1]) : null;
};

export const autenticar = async (req, res, next) => {
  try {
    const token = obtenerToken(req);
    const usuarioId = obtenerUsuarioIdDesdeToken(token);

    if (!usuarioId) {
      return res.status(401).json({
        message: 'Sesion no valida. Inicia sesion nuevamente.',
        mensaje: 'Sesion no valida. Inicia sesion nuevamente.',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, empresa_id, nombre, correo, rol, estado, canal_id FROM usuarios WHERE id = ? LIMIT 1',
      [usuarioId],
    );
    const usuario = rows[0];

    if (!usuario || usuario.estado !== 'Activo') {
      return res.status(401).json({
        message: 'Sesion no valida. Inicia sesion nuevamente.',
        mensaje: 'Sesion no valida. Inicia sesion nuevamente.',
      });
    }

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
  const rol = String(req.usuario?.rol || '').trim();

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
  const rol = String(req.usuario?.rol || '').trim();
  const idSolicitado = Number(req.params.id || req.body.usuarioId || req.body.usuario_id || 0);

  if (ADMIN_ROLES.includes(rol) || (idSolicitado && idSolicitado === Number(req.usuario?.id))) {
    return next();
  }

  return res.status(403).json({
    message: 'No tienes permisos para realizar esta accion.',
    mensaje: 'No tienes permisos para realizar esta accion.',
  });
};
