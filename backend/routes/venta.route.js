import express from "express";
import { crearVenta, listarVentas, obtenerVenta, eliminarVenta, buscarClientePorCI } from "../controllers/venta.controller.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { initAbility } from "../middlewares/initAbility.js";
import { checkAbility } from "../middlewares/checkAbility.js";
import { validate } from "../middlewares/validate.js";
import { crearVentaSchema } from "../schemas/venta.schema.js";

const router = express.Router();

// ==========================
// VENTAS
// ==========================

// Buscar cliente por CI (autocompletar)
router.get(
  "/cliente/:ci",
  authMiddleware,
  initAbility,
  checkAbility("read", "Cliente"),
  buscarClientePorCI
);

// Listar ventas (según rol)
router.get(
  "/",
  authMiddleware,
  initAbility,
  checkAbility("read", "Venta"),
  listarVentas
);

// Obtener venta por ID
router.get(
  "/:id",
  authMiddleware,
  initAbility,
  checkAbility("read", "Venta"),
  obtenerVenta
);

// Crear venta
router.post(
  "/",
  authMiddleware,
  initAbility,
  checkAbility("create", "Venta"),
  validate(crearVentaSchema),
  crearVenta
);

// Eliminar venta
router.delete(
  "/:id",
  authMiddleware,
  initAbility,
  checkAbility("delete", "Venta"),
  eliminarVenta
);

export default router;
