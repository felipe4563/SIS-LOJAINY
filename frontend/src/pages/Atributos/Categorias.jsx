import { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../services/atributos";
import AtributoBase from "./AtributoBase";
import { Tag } from "lucide-react";

const Categorias = () => (
  <AtributoBase
    titulo="Categorías"
    tituloSingular="Categoría"
    Icon={Tag}
    idKey="id_categoria"
    fetchFn={listarCategorias}
    crearFn={crearCategoria}
    actualizarFn={actualizarCategoria}
    eliminarFn={eliminarCategoria}
    placeholder="Ej: Ropa deportiva, Accesorios, Calzado…"
    maxLength={100}
  />
);

export default Categorias;
