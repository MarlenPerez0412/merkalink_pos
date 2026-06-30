import { Router } from 'express';
import { obtenerResumenReportes } from '../controllers/reportes.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/resumen', autenticar, soloAdmin, obtenerResumenReportes);

export default router;
