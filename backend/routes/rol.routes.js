import express from "express";
import {
  crearRol,
  listarRoles,
  obtenerRol,
  actualizarRol,
  eliminarRol,
  listarPermisos
} from "../controllers/rol.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { initAbility } from "../middlewares/initAbility.js";
import { checkAbility } from "../middlewares/checkAbility.js";

const router = express.Router();

router.use(authMiddleware);
router.use(initAbility);

router.get("/", checkAbility("manage", "Rol"), listarRoles);
router.get("/permisos", checkAbility("manage", "Rol"), listarPermisos);
router.get("/:id", checkAbility("manage", "Rol"), obtenerRol);
router.post("/", checkAbility("manage", "Rol"), crearRol);
router.put("/:id", checkAbility("manage", "Rol"), actualizarRol);
router.delete("/:id", checkAbility("manage", "Rol"), eliminarRol);

export default router;
