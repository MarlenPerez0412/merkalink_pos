import { Router } from 'express';
import {
  actualizarCanal,
  crearCanal,
  eliminarCanal,
  obtenerCanales,
} from '../controllers/canales.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, obtenerCanales);
router.post('/', autenticar, soloAdmin, crearCanal);
router.put('/:id', autenticar, soloAdmin, actualizarCanal);
router.delete('/:id', autenticar, soloAdmin, eliminarCanal);

export default router;
