import { Router } from 'express';
import { crearVenta, obtenerVentas } from '../controllers/ventas.controller.js';

const router = Router();

router.get('/', obtenerVentas);
router.post('/', crearVenta);

export default router;
