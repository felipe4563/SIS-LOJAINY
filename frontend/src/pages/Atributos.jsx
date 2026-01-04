import { useContext, useState, useEffect } from "react";
import { AbilityContext } from "../context/AbilityContext";

import Categorias from "./Atributos/Categorias";
import Tallas from "./Atributos/Tallas";
import Colores from "./Atributos/Colores";
import Marcas from "./Atributos/Marcas";

const Atributos = () => {
  const ability = useContext(AbilityContext);
  const [active, setActive] = useState(null);

  const tabs = [
    ability.can("manage", "Categoria") && { key: "categoria", label: "Categoría" },
    ability.can("manage", "Talla") && { key: "talla", label: "Talla" },
    ability.can("manage", "Color") && { key: "color", label: "Color" },
    ability.can("manage", "Marca") && { key: "marca", label: "Marca" }
  ].filter(Boolean);

  // Selecciona la primera pestaña disponible
  useEffect(() => {
    if (tabs.length && !active) setActive(tabs[0].key);
  }, [tabs, active]);

  if (tabs.length === 0) return <p>No tienes permisos para ver ningún atributo</p>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${
              active === tab.key ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {active === "categoria" && <Categorias />}  {/* Cambiado de "categorias" a "categoria" */}
        {active === "talla" && <Tallas />}
        {active === "color" && <Colores />}
        {active === "marca" && <Marcas />}
      </div>
    </div>
  );
};

export default Atributos;