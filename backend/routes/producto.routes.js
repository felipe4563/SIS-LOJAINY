import express from "express";
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/producto.controller.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { initAbility } from "../middlewares/initAbility.js";
import { checkAbility } from "../middlewares/checkAbility.js";
import { uploadProductos } from "../config/upload.js";
import { validate } from "../middlewares/validate.js";
import { crearProductoSchema, actualizarProductoSchema } from "../schemas/producto.schema.js";

const router = express.Router();

// ==========================
// PRODUCTOS
// ==========================

// Listar productos
router.get(
  "/",
  authMiddleware,
  initAbility,
  checkAbility("read", "Producto"),
  listarProductos
);

// Obtener producto por ID
router.get(
  "/:id_producto",
  authMiddleware,
  initAbility,
  checkAbility("read", "Producto"),
  obtenerProducto
);

// Crear producto
router.post(
  "/",
  authMiddleware,
  initAbility,
  checkAbility("create", "Producto"),
  uploadProductos.array("imagenes", 10),
  validate(crearProductoSchema),
  crearProducto
);

// Actualizar producto
router.put(
  "/:id_producto",
  authMiddleware,
  initAbility,
  checkAbility("update", "Producto"),
  uploadProductos.array("imagenes", 10),
  validate(actualizarProductoSchema),
  actualizarProducto
);

// Eliminar producto
router.delete(
  "/:id_producto",
  authMiddleware,
  initAbility,
  checkAbility("delete", "Producto"),
  eliminarProducto
);

export default router;
