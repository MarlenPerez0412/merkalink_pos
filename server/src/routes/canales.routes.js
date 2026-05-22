import { Router } from 'express';
import {
  actualizarCanal,
  crearCanal,
  eliminarCanal,
  obtenerCanales,
} from '../controllers/canales.controller.js';

const router = Router();

router.get('/', obtenerCanales);
router.post('/', crearCanal);
router.put('/:id', actualizarCanal);
router.delete('/:id', eliminarCanal);

export default router;