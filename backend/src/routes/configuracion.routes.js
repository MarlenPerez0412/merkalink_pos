import { Router } from 'express';
import {
  actualizarConfiguracion,
  obtenerConfiguracion,
} from '../controllers/configuracion.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, obtenerConfiguracion);
router.put('/', autenticar, soloAdmin, actualizarConfiguracion);

export default router;
