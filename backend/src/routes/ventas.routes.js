import { Router } from 'express';
import {
  crearVenta,
  crearVentaPos,
  obtenerVentaPorId,
  obtenerVentas,
} from '../controllers/ventas.controller.js';

const router = Router();

router.get('/', obtenerVentas);
router.get('/:id', obtenerVentaPorId);
router.post('/', crearVenta);
router.post('/pos', crearVentaPos);

export default router;
