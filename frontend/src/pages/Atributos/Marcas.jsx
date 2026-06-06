import { listarMarcas, crearMarca, actualizarMarca, eliminarMarca } from "../../services/atributos";
import AtributoBase from "./AtributoBase";
import { Award } from "lucide-react";

const Marcas = () => (
  <AtributoBase
    titulo="Marcas"
    tituloSingular="Marca"
    Icon={Award}
    idKey="id_marca"
    fetchFn={listarMarcas}
    crearFn={crearMarca}
    actualizarFn={actualizarMarca}
    eliminarFn={eliminarMarca}
    placeholder="Ej: Nike, Adidas, Zara, H&M…"
    maxLength={100}
  />
);

export default Marcas;
