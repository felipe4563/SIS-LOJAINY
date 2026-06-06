import { Router } from 'express';
import { obtenerPerfil, actualizarPerfil, cambiarPassword } from '../controllers/perfil.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/',          authMiddleware, obtenerPerfil);
router.put('/',          authMiddleware, actualizarPerfil);
router.put('/password',  authMiddleware, cambiarPassword);

export default router;
