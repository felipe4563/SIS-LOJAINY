import { Router } from 'express';
import {
    reporteVentas
} from '../controllers/reporte.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';

const router = Router();

router.get(
  '/ventas',
  authMiddleware,
  initAbility,
  checkAbility('read', 'Reporte'),
  reporteVentas
);

export default router;
