import { Router } from 'express';
import {
  actualizarProveedor,
  crearProveedor,
  desactivarProveedor,
  obtenerProveedores,
} from '../controllers/proveedores.controller.js';

const router = Router();

router.get('/', obtenerProveedores);
router.post('/', crearProveedor);
router.put('/:id', actualizarProveedor);
router.delete('/:id', desactivarProveedor);
router.patch('/:id/desactivar', desactivarProveedor);

export default router;
