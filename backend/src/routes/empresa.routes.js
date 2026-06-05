import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { actualizarEmpresa, obtenerEmpresa, subirLogoEmpresa } from '../controllers/empresa.controller.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.resolve(
  process.env.FRONTEND_IMAGES_DIR || path.resolve(__dirname, '../../../frontend/public/images'),
);

fs.mkdirSync(imagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => cb(null, 'logo-empresa.png'),
});

const uploadLogo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.get('/', obtenerEmpresa);
router.put('/', actualizarEmpresa);
router.post('/logo', uploadLogo.single('logo'), subirLogoEmpresa);

export default router;
