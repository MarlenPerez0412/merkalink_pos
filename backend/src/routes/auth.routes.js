import { Router } from 'express';
import {
  actualizarPerfil,
  actualizarUsuario,
  activarUsuario,
  cambiarPassword,
  crearUsuario,
  desactivarUsuario,
  eliminarUsuario,
  login,
  obtenerUsuarios,
} from '../controllers/auth.controller.js';
import { autenticar, autorizarMismoUsuarioOAdmin, soloAdmin } from '../middlewares/auth.js';
import { autenticarToken } from '../middlewares/auth.middleware.js';
import { autorizarRoles } from '../middlewares/roles.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/session', autenticarToken, (req, res) => {
  res.json({ mensaje: 'Token valido', usuario: req.user });
});
router.get('/admin-test', autenticarToken, autorizarRoles('Administrador'), (req, res) => {
  res.json({ mensaje: 'Acceso de administrador permitido', usuario: req.user });
});
router.put('/password', autenticar, autorizarMismoUsuarioOAdmin, cambiarPassword);
router.get('/usuarios', autenticar, soloAdmin, obtenerUsuarios);
router.post('/usuarios', autenticar, soloAdmin, crearUsuario);
router.put('/usuarios/:id', autenticar, autorizarMismoUsuarioOAdmin, actualizarPerfil);
router.put('/usuarios/:id/admin', autenticar, soloAdmin, actualizarUsuario);
router.delete('/usuarios/:id', autenticar, soloAdmin, eliminarUsuario);
router.patch('/usuarios/:id/activar', autenticar, soloAdmin, activarUsuario);
router.patch('/usuarios/:id/desactivar', autenticar, soloAdmin, desactivarUsuario);

export default router;
