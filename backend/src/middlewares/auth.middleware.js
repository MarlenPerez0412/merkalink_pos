import jwt from 'jsonwebtoken';

const obtenerJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }

  return process.env.JWT_SECRET;
};

export const autenticarToken = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [tipo, token] = authorization.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticacion requerido',
      mensaje: 'Token de autenticacion requerido',
    });
  }

  try {
    req.user = jwt.verify(token, obtenerJwtSecret());
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token invalido o expirado',
      mensaje: 'Token invalido o expirado',
    });
  }
};
