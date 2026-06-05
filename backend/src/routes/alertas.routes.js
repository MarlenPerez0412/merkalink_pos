import { Router } from 'express';
import {
  actualizarEstadoAlerta,
  generarAlertas,
  obtenerAlertas,
  solicitarCompra,
} from '../controllers/alertas.controller.js';

const router = Router();

router.get('/', obtenerAlertas);
router.post('/generar', generarAlertas);
router.post('/actualizar', generarAlertas);
router.put('/:id/solicitar-compra', solicitarCompra);
router.put('/:id/estado', actualizarEstadoAlerta);

export default router;
