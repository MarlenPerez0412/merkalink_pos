import { Router } from 'express';
import {
  cancelarCorteCaja,
  crearCorteCaja,
  obtenerCorteCajaPorId,
  obtenerCortesCaja,
  obtenerPdfDataCorte,
  obtenerReporteCorteCaja,
  obtenerResumenProductosCorte,
} from '../controllers/cortesCaja.controller.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, obtenerCortesCaja);
router.post('/', autenticar, crearCorteCaja);
router.get('/resumen-productos', autenticar, obtenerResumenProductosCorte);
router.get('/:id/reporte', autenticar, obtenerReporteCorteCaja);
router.get('/:id/pdf-data', autenticar, obtenerPdfDataCorte);
router.get('/:id', autenticar, obtenerCorteCajaPorId);
router.delete('/:id', autenticar, cancelarCorteCaja);

export default router;
