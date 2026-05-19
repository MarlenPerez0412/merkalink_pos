import { Router } from 'express';
import { obtenerCanales } from '../controllers/canales.controller.js';

const router = Router();

router.get('/', obtenerCanales);

export default router;
