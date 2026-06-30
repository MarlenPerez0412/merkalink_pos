import { Router } from 'express';
import {
  actualizarEstadoAlerta,
  generarAlertas,
  obtenerAlertas,
  solicitarCompra,
} from '../controllers/alertas.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, soloAdmin, obtenerAlertas);
router.post('/generar', autenticar, soloAdmin, generarAlertas);
router.post('/actualizar', autenticar, soloAdmin, generarAlertas);
router.put('/:id/solicitar-compra', autenticar, soloAdmin, solicitarCompra);
router.put('/:id/estado', autenticar, soloAdmin, actualizarEstadoAlerta);

export default router;
