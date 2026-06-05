import { Router } from 'express';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
  obtenerProductosPorCategoria,
} from '../controllers/productos.controller.js';

const router = Router();

router.get('/', obtenerCategorias);
router.get('/:id/productos', obtenerProductosPorCategoria);
router.post('/', crearCategoria);
router.put('/:id', actualizarCategoria);
router.delete('/:id', eliminarCategoria);

export default router;
