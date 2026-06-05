import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import {
  actualizarCategoria,
  actualizarProducto,
  crearCategoria,
  crearProducto,
  eliminarCategoria,
  eliminarProducto,
  obtenerCategorias,
  obtenerProductosPorCategoria,
  obtenerProductos,
} from '../controllers/productos.controller.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productosDir = path.resolve(
  process.env.PRODUCT_IMAGES_DIR || path.resolve(__dirname, '../../../frontend/public/images/productos'),
);

fs.mkdirSync(productosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productosDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    cb(null, `${baseName || 'producto'}-${Date.now()}${extension}`);
  },
});

const uploadProducto = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
      cb(null, true);
      return;
    }

    cb(new Error('Solo se permiten imagenes jpg, jpeg, png o webp'));
  },
});

router.get('/categorias', obtenerCategorias);
router.get('/categorias/:id/productos', obtenerProductosPorCategoria);
router.post('/categorias', crearCategoria);
router.put('/categorias/:id', actualizarCategoria);
router.delete('/categorias/:id', eliminarCategoria);

const responderImagenSubida = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'Selecciona una imagen valida' });
  }

  return res.status(201).json({
    url: `/images/productos/${req.file.filename}`,
    imagenUrl: `/images/productos/${req.file.filename}`,
    imagen_url: `/images/productos/${req.file.filename}`,
    mensaje: 'Imagen de producto subida correctamente',
  });
};

router.post('/imagenes', uploadProducto.single('imagen'), responderImagenSubida);
router.post('/upload-image', uploadProducto.single('imagen'), responderImagenSubida);
router.post('/upload-imagen', uploadProducto.single('imagen'), responderImagenSubida);

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;
