import { useContext, useState, useEffect } from "react";
import { AbilityContext } from "../context/AbilityContext";
import Categorias from "./Atributos/Categorias";
import Tallas    from "./Atributos/Tallas";
import Colores   from "./Atributos/Colores";
import Marcas    from "./Atributos/Marcas";
import { Tag, Ruler, Palette, Award, Shield } from "lucide-react";

const Atributos = () => {
  const ability = useContext(AbilityContext);
  const [active, setActive] = useState(null);

  const tabs = [
    ability.can("manage", "Categoria") && {
      key: "categoria", label: "Categorías", Icon: Tag,     component: <Categorias />,
    },
    ability.can("manage", "Talla") && {
      key: "talla",     label: "Tallas",     Icon: Ruler,   component: <Tallas />,
    },
    ability.can("manage", "Color") && {
      key: "color",     label: "Colores",    Icon: Palette, component: <Colores />,
    },
    ability.can("manage", "Marca") && {
      key: "marca",     label: "Marcas",     Icon: Award,   component: <Marcas />,
    },
  ].filter(Boolean);

  useEffect(() => {
    if (tabs.length && !active) setActive(tabs[0].key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tabs.length) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#C8102E]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Acceso Denegado</h3>
          <p className="text-slate-500 text-sm">No tienes permisos para gestionar atributos.</p>
        </div>
      </div>
    );
  }

  const activeTab = tabs.find(t => t.key === active);

  return (
    <div className="space-y-5 pb-20 sm:pb-0 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight leading-tight">
            Gestión de Atributos
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Categorías, tallas, colores y marcas del catálogo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex-1 ${
              active === key
                ? "bg-[#003087] text-white shadow-sm"
                : "text-slate-500 hover:text-[#003087] hover:bg-[#003087]/5"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Contenido activo — key fuerza re-mount al cambiar tab */}
      {activeTab && (
        <div key={active} className="animate-fade-in">
          {activeTab.component}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
      `}} />
    </div>
  );
};

export default Atributos;
