import { Router } from 'express';
import { liberarReserva, reservarStock } from '../controllers/reservasStock.controller.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/', autenticar, reservarStock);
router.delete('/:token', autenticar, liberarReserva);

export default router;
