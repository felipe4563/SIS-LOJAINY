// routes/dashboard.routes.js
import { Router } from "express";
import {
  ventasPorRango,
  ventasPorVendedor,
  productosMasVendidos,
  resumenInventario
} from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { initAbility } from "../middlewares/initAbility.js";
import { checkAbility } from "../middlewares/checkAbility.js";


const router = Router();

// 📈 Ventas por rango de fechas
// GET /api/dashboard/ventas?rango_inicio=YYYY-MM-DD&rango_fin=YYYY-MM-DD
router.get("/ventas",authMiddleware, initAbility, checkAbility ("read", "Dashboard"), ventasPorRango);

// 📊 Ventas por vendedor
router.get("/ventas-vendedor",authMiddleware, initAbility, checkAbility ("read", "Dashboard"), ventasPorVendedor);

// 📊 Productos más vendidos
router.get("/productos-mas-vendidos",authMiddleware, initAbility, checkAbility ("read", "Dashboard"), productosMasVendidos);

// 📦 Resumen de inventario
router.get("/resumen-inventario",authMiddleware, initAbility, checkAbility ("read", "Dashboard"), resumenInventario);

export default router;
