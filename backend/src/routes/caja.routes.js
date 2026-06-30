import { Router } from 'express';
import { crearRetiro, obtenerResumenCaja, obtenerRetiros } from '../controllers/caja.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/resumen', autenticar, soloAdmin, obtenerResumenCaja);
router.get('/retiros', autenticar, soloAdmin, obtenerRetiros);
router.post('/retiros', autenticar, soloAdmin, crearRetiro);

export default router;
