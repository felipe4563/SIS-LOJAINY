import express from "express";
import { obtenerDashboardAvanzado } from "../controllers/dashboard.controller.js";

const router = express.Router();

// Endpoint del dashboard avanzado
router.get("/avanzado", obtenerDashboardAvanzado);

export default router;
