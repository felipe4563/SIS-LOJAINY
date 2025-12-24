import express from "express";
import { reporteProductosVendidos, reporteStockActual } from "../controllers/reporte.controller.js";

const router = express.Router();

// Productos vendidos entre fechas
router.get("/productos-vendidos", reporteProductosVendidos);

// Stock actual de productos
router.get("/stock", reporteStockActual);

export default router;
