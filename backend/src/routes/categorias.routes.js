import { Router } from 'express';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
  obtenerProductosPorCategoria,
} from '../controllers/productos.controller.js';
import { autenticar, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', autenticar, obtenerCategorias);
router.get('/:id/productos', autenticar, obtenerProductosPorCategoria);
router.post('/', autenticar, soloAdmin, crearCategoria);
router.put('/:id', autenticar, soloAdmin, actualizarCategoria);
router.delete('/:id', autenticar, soloAdmin, eliminarCategoria);

export default router;
