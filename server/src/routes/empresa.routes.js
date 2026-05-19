import { Router } from 'express';
import { obtenerEmpresa } from '../controllers/empresa.controller.js';

const router = Router();

router.get('/', obtenerEmpresa);

export default router;
