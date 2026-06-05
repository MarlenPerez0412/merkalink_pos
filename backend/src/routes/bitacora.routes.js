import { Router } from 'express';
import { obtenerBitacora, obtenerBitacoraPorId } from '../controllers/bitacora.controller.js';

const router = Router();

router.get('/', obtenerBitacora);
router.get('/:id', obtenerBitacoraPorId);

export default router;
