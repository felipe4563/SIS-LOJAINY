import { useContext, useState, useEffect } from "react";
import { AbilityContext } from "../context/AbilityContext";

import Categorias from "./Atributos/Categorias";
import Tallas from "./Atributos/Tallas";
import Colores from "./Atributos/Colores";
import Marcas from "./Atributos/Marcas";

const Atributos = () => {
  const ability = useContext(AbilityContext);
  const [active, setActive] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Definir las pestañas disponibles según permisos
  const availableTabs = [
    ability.can("manage", "Categoria") && { 
      key: "categoria", 
      label: "Categorías",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    ability.can("manage", "Talla") && { 
      key: "talla", 
      label: "Tallas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    ability.can("manage", "Color") && { 
      key: "color", 
      label: "Colores",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    ability.can("manage", "Marca") && { 
      key: "marca", 
      label: "Marcas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ].filter(Boolean);

  // Selecciona la primera pestaña disponible al cargar
  useEffect(() => {
    if (availableTabs.length && !active) {
      setActive(availableTabs[0].key);
    }
  }, [availableTabs, active]);

  // Si no hay permisos
  if (availableTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-gray-50 rounded-xl shadow-sm">
        <div className="w-20 h-20 mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Acceso restringido</h3>
        <p className="text-gray-500 max-w-md">
          No tienes permisos para gestionar ningún atributo. Por favor, contacta al administrador del sistema si necesitas acceso.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Atributos</h1>
        <p className="text-gray-600 mt-2">Administra las categorías, tallas, colores y marcas de tu catálogo</p>
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-6">
        {/* Versión escritorio - Horizontal */}
        <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {availableTabs.map(tab => (
            <button
              key={tab.key}
              className={`
                flex items-center justify-center px-5 py-3 rounded-lg font-medium transition-all duration-200 
                ${active === tab.key 
                  ? "bg-white text-yellow-600 shadow-md" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }
              `}
              onClick={() => setActive(tab.key)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Versión móvil - Scroll horizontal */}
        <div className="md:hidden overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {availableTabs.map(tab => (
              <button
                key={tab.key}
                className={`
                  flex items-center px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200
                  ${active === tab.key 
                    ? "bg-yellow-500 text-white shadow-md" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                `}
                onClick={() => setActive(tab.key)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de pestaña activa (solo móvil) */}
      {isMobile && (
        <div className="mb-6 md:hidden">
          <div className="flex items-center text-yellow-600 font-medium">
            <span className="mr-2">
              {availableTabs.find(tab => tab.key === active)?.icon}
            </span>
            <span className="text-lg">
              {availableTabs.find(tab => tab.key === active)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Contenido de la pestaña activa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6">
          {active === "categoria" && <Categorias />}
          {active === "talla" && <Tallas />}
          {active === "color" && <Colores />}
          {active === "marca" && <Marcas />}
        </div>
      </div>

      {/* Indicador de pestaña activa (pie de página, solo móvil) */}
      {isMobile && (
        <div className="mt-4 text-center text-sm text-gray-500 md:hidden">
          {availableTabs.findIndex(tab => tab.key === active) + 1} de {availableTabs.length}
        </div>
      )}
    </div>
  );
};

export default Atributos;