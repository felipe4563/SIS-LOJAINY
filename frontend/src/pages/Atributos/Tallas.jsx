import { listarTallas, crearTalla, actualizarTalla, eliminarTalla } from "../../services/atributos";
import AtributoBase from "./AtributoBase";
import { Ruler } from "lucide-react";

const Tallas = () => (
  <AtributoBase
    titulo="Tallas"
    tituloSingular="Talla"
    Icon={Ruler}
    idKey="id_talla"
    fetchFn={listarTallas}
    crearFn={crearTalla}
    actualizarFn={actualizarTalla}
    eliminarFn={eliminarTalla}
    placeholder="Ej: XS, S, M, L, XL, 38, 40…"
    maxLength={20}
  />
);

export default Tallas;
