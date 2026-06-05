import { Router } from 'express';
import {
  actualizarConfiguracion,
  obtenerConfiguracion,
} from '../controllers/configuracion.controller.js';

const router = Router();

router.get('/', obtenerConfiguracion);
router.put('/', actualizarConfiguracion);

export default router;
