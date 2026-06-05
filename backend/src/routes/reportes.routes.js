import { Router } from 'express';
import { obtenerResumenReportes } from '../controllers/reportes.controller.js';

const router = Router();

router.get('/resumen', obtenerResumenReportes);

export default router;
