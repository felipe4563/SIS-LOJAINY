import { Router } from "express";
import {
  listarCatalogo,
  verProductoCatalogo
} from "../controllers/catalogo.controller.js";

const router = Router();

router.get("/productos", listarCatalogo);
router.get("/productos/:id_producto", verProductoCatalogo);

export default router;
