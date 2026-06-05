import { Router } from 'express';
import { crearRetiro, obtenerResumenCaja, obtenerRetiros } from '../controllers/caja.controller.js';

const router = Router();

router.get('/resumen', obtenerResumenCaja);
router.get('/retiros', obtenerRetiros);
router.post('/retiros', crearRetiro);

export default router;
