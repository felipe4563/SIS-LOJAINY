import express from "express";
import * as ctrl from "../controllers/atributos.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { initAbility } from "../middlewares/initAbility.js";
import { checkAbility } from "../middlewares/checkAbility.js";

const router = express.Router();

// Todas las rutas requieren usuario autenticado e inicializar CASL
router.use(authMiddleware);
router.use(initAbility);

// Categorias
router.get("/categorias", checkAbility("manage", "Categoria"), ctrl.listar("categorias", "Categoria"));
router.get("/categorias/:id", checkAbility("manage", "Categoria"), ctrl.obtener("categorias", "id_categoria", "Categoria"));
router.post("/categorias", checkAbility("manage", "Categoria"), ctrl.crear("categorias", ["nombre"], "Categoria"));
router.put("/categorias/:id", checkAbility("manage", "Categoria"), ctrl.actualizar("categorias", "id_categoria", ["nombre"], "Categoria"));
router.delete("/categorias/:id", checkAbility("manage", "Categoria"), ctrl.eliminar("categorias", "id_categoria", "Categoria"));

// Tallas
router.get("/tallas", checkAbility("manage", "Talla"), ctrl.listar("tallas", "Talla"));
router.get("/tallas/:id", checkAbility("manage", "Talla"), ctrl.obtener("tallas", "id_talla", "Talla"));
router.post("/tallas", checkAbility("manage", "Talla"), ctrl.crear("tallas", ["nombre"], "Talla"));
router.put("/tallas/:id", checkAbility("manage", "Talla"), ctrl.actualizar("tallas", "id_talla", ["nombre"], "Talla"));
router.delete("/tallas/:id", checkAbility("manage", "Talla"), ctrl.eliminar("tallas", "id_talla", "Talla"));

// Colores
router.get("/colores", checkAbility("manage", "Color"), ctrl.listar("color", "Color"));
router.get("/colores/:id", checkAbility("manage", "Color"), ctrl.obtener("color", "id_color", "Color"));
router.post("/colores", checkAbility("manage", "Color"), ctrl.crear("color", ["nombre"], "Color"));
router.put("/colores/:id", checkAbility("manage", "Color"), ctrl.actualizar("color", "id_color", ["nombre"], "Color"));
router.delete("/colores/:id", checkAbility("manage", "Color"), ctrl.eliminar("color", "id_color", "Color"));

export default router;
