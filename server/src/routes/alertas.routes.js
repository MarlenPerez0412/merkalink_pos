import { Router } from 'express';
import { actualizarEstadoAlerta, obtenerAlertas } from '../controllers/alertas.controller.js';

const router = Router();

router.get('/', obtenerAlertas);
router.put('/:id/estado', actualizarEstadoAlerta);

export default router;
