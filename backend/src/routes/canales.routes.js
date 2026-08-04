import { Router } from 'express';
import {
  actualizarCanal,
  crearCanal,
  desactivarCanal,
  eliminarCanal,
  obtenerCanales,
} from '../controllers/canales.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, obtenerCanales);
router.post('/', autenticar, soloAdmin, crearCanal);
router.put('/:id', autenticar, soloAdmin, actualizarCanal);
router.patch('/:id/desactivar', autenticar, soloAdmin, desactivarCanal);
router.delete('/:id', autenticar, soloAdmin, eliminarCanal);

export default router;

