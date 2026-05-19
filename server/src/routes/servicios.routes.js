import { Router } from 'express';
import { obtenerServicios } from '../controllers/servicios.controller.js';

const router = Router();

router.get('/', obtenerServicios);

export default router;
