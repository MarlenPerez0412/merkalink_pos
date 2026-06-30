import { Router } from 'express';
import {
  actualizarProveedor,
  crearProveedor,
  desactivarProveedor,
  obtenerProveedores,
} from '../controllers/proveedores.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, soloAdmin, obtenerProveedores);
router.post('/', autenticar, soloAdmin, crearProveedor);
router.put('/:id', autenticar, soloAdmin, actualizarProveedor);
router.delete('/:id', autenticar, soloAdmin, desactivarProveedor);
router.patch('/:id/desactivar', autenticar, soloAdmin, desactivarProveedor);

export default router;
