import { Router } from 'express';
import {
  actualizarProveedor,
  activarProveedor,
  crearProveedor,
  desactivarProveedor,
  eliminarProveedor,
  obtenerProveedores,
} from '../controllers/proveedores.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, soloAdmin, obtenerProveedores);
router.post('/', autenticar, soloAdmin, crearProveedor);
router.put('/:id', autenticar, soloAdmin, actualizarProveedor);
router.delete('/:id', autenticar, soloAdmin, eliminarProveedor);
router.patch('/:id/activar', autenticar, soloAdmin, activarProveedor);
router.patch('/:id/desactivar', autenticar, soloAdmin, desactivarProveedor);

export default router;
