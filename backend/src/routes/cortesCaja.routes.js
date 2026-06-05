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

const router = Router();

router.get('/', obtenerCortesCaja);
router.post('/', crearCorteCaja);
router.get('/resumen-productos', obtenerResumenProductosCorte);
router.get('/:id/reporte', obtenerReporteCorteCaja);
router.get('/:id/pdf-data', obtenerPdfDataCorte);
router.get('/:id', obtenerCorteCajaPorId);
router.delete('/:id', cancelarCorteCaja);

export default router;
