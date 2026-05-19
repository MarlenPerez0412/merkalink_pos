import { Router } from 'express';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerProductos,
} from '../controllers/productos.controller.js';

const router = Router();

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;
