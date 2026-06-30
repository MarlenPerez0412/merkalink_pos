import { Router } from 'express';
import {
  actualizarPerfil,
  actualizarUsuario,
  cambiarPassword,
  crearUsuario,
  desactivarUsuario,
  login,
  obtenerUsuarios,
} from '../controllers/auth.controller.js';
import { autenticar, autorizarMismoUsuarioOAdmin, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.put('/password', autenticar, autorizarMismoUsuarioOAdmin, cambiarPassword);
router.get('/usuarios', autenticar, soloAdmin, obtenerUsuarios);
router.post('/usuarios', autenticar, soloAdmin, crearUsuario);
router.put('/usuarios/:id', autenticar, autorizarMismoUsuarioOAdmin, actualizarPerfil);
router.put('/usuarios/:id/admin', autenticar, soloAdmin, actualizarUsuario);
router.delete('/usuarios/:id', autenticar, soloAdmin, desactivarUsuario);
router.patch('/usuarios/:id/desactivar', autenticar, soloAdmin, desactivarUsuario);

export default router;
