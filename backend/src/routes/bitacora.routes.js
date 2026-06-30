import { Router } from 'express';
import { obtenerBitacora, obtenerBitacoraPorId } from '../controllers/bitacora.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, soloAdmin, obtenerBitacora);
router.get('/:id', autenticar, soloAdmin, obtenerBitacoraPorId);

export default router;
