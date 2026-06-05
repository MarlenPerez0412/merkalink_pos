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

const router = Router();

router.post('/login', login);
router.put('/password', cambiarPassword);
router.get('/usuarios', obtenerUsuarios);
router.post('/usuarios', crearUsuario);
router.put('/usuarios/:id', actualizarPerfil);
router.put('/usuarios/:id/admin', actualizarUsuario);
router.delete('/usuarios/:id', desactivarUsuario);
router.patch('/usuarios/:id/desactivar', desactivarUsuario);

export default router;
