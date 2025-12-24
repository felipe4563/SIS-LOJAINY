import { Router } from 'express';
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  toggleEstadoUsuario
} from '../controllers/user.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';

const router = Router();

// Crear usuario
router.post(
  '/',
  authMiddleware,
  initAbility,
  checkAbility('manage', 'Usuario'),
  crearUsuario
);

// Listar usuarios
router.get(
  '/',
  authMiddleware,
  initAbility,
  checkAbility('manage', 'Usuario'),
  listarUsuarios
);

// Obtener usuario por ID
router.get(
  '/:id',
  authMiddleware,
  initAbility,
  checkAbility('manage', 'Usuario'),
  obtenerUsuario
);

// Actualizar usuario
router.put(
  '/:id',
  authMiddleware,
  initAbility,
  checkAbility('manage', 'Usuario'),
  actualizarUsuario
);

// Activar / Desactivar usuario
router.patch(
  '/:id/estado',
  authMiddleware,
  initAbility,
  checkAbility('manage', 'Usuario'),
  toggleEstadoUsuario
);

export default router;
