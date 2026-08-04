export const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
      mensaje: 'Usuario no autenticado',
    });
  }

  if (!rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
      mensaje: 'No tienes permisos para acceder a este recurso',
    });
  }

  return next();
};
