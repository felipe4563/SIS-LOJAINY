import { listarColores, crearColor, actualizarColor, eliminarColor } from "../../services/atributos";
import AtributoBase from "./AtributoBase";
import { Palette } from "lucide-react";

const Colores = () => (
  <AtributoBase
    titulo="Colores"
    tituloSingular="Color"
    Icon={Palette}
    idKey="id_color"
    fetchFn={listarColores}
    crearFn={crearColor}
    actualizarFn={actualizarColor}
    eliminarFn={eliminarColor}
    placeholder="Ej: Rojo, Azul Marino, Verde Lima…"
    maxLength={50}
  />
);

export default Colores;
