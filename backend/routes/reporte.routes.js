import { Router } from 'express';
import {
  totalVendidoMes,
  ventasPorUsuario,
  ventasPorMetodoPago,
  productosEnStock,
  topProductosVendidos
} from '../controllers/reporte.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { initAbility } from '../middlewares/initAbility.js';
import { checkAbility } from '../middlewares/checkAbility.js';

const router = Router();

router.use(authMiddleware);
router.use(initAbility);

// 📊 REPORTES
router.get('/ventas-mes', checkAbility('read', 'Reporte'), totalVendidoMes);
router.get('/ventas-usuario', checkAbility('read', 'Reporte'), ventasPorUsuario);
router.get('/ventas-metodo', checkAbility('read', 'Reporte'), ventasPorMetodoPago);
router.get('/stock', checkAbility('read', 'Reporte'), productosEnStock);
router.get('/top-productos', checkAbility('read', 'Reporte'), topProductosVendidos);

export default router;
