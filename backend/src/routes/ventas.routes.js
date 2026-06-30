import { Router } from 'express';
import {
  crearVenta,
  crearVentaPos,
  obtenerVentaPorId,
  obtenerVentas,
} from '../controllers/ventas.controller.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, obtenerVentas);
router.get('/:id', autenticar, obtenerVentaPorId);
router.post('/', autenticar, crearVenta);
router.post('/pos', autenticar, crearVentaPos);

export default router;
