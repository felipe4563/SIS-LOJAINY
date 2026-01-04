import { useEffect, useState, useMemo } from "react";
import { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../services/atributos";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await listarCategorias();
      setCategorias(data);
      setError("");
    } catch (err) {
      setError("Error al cargar las categorías");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategorias = useMemo(() => {
    return categorias.filter(cat =>
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.id_categoria.toString().includes(searchTerm)
    );
  }, [categorias, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre de la categoría es requerido");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      if (editId) {
        await actualizarCategoria(editId, { nombre: nombre.trim() });
      } else {
        await crearCategoria({ nombre: nombre.trim() });
      }
      
      setNombre("");
      setEditId(null);
      setSearchTerm(""); // Limpiar búsqueda después de guardar
      await fetchCategorias();
    } catch (err) {
      setError(err.message || "Error al guardar la categoría");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditId(categoria.id_categoria);
    setNombre(categoria.nombre);
    // Scroll suave al formulario
    document.getElementById("categoria-form")?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      try {
        await eliminarCategoria(id);
        await fetchCategorias();
      } catch (err) {
        setError("Error al eliminar la categoría");
      }
    }
  };

  const handleCancel = () => {
    setNombre("");
    setEditId(null);
    setError("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header del módulo con gradiente */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="bg-gradient-to-r from-yellow-500 via-red-500 to-blue-600 text-white px-6 py-4 rounded-xl mb-4 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold">Gestión de Categorías</h2>
          <p className="text-white/90 text-sm md:text-base mt-2">
            Administra las categorías de productos de tu tienda
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div>
            <p className="text-gray-600 text-sm md:text-base">
              <span className="font-semibold text-gray-800">{filteredCategorias.length}</span> de <span className="font-semibold text-gray-800">{categorias.length}</span> categorías mostradas
            </p>
          </div>
          
          {/* Buscador responsivo */}
          <div className="w-full sm:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar categorías por nombre o ID..."
                className="w-full sm:w-80 px-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder-gray-400 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div id="categoria-form" className="bg-white rounded-xl shadow-lg border border-yellow-300 p-5 md:p-6 mb-8">
        <div className="flex items-center mb-5">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg mr-4 shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {editId ? "✏️ Editar Categoría" : "➕ Nueva Categoría"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {editId ? "Modifica los datos de la categoría seleccionada" : "Agrega una nueva categoría al catálogo"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="nombre-categoria" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la categoría
            </label>
            <input
              id="nombre-categoria"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Ropa deportiva, Accesorios, Calzado"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder-gray-400 hover:border-yellow-400"
              disabled={submitting}
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Máximo 100 caracteres
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting || !nombre.trim()}
              className="flex-1 bg-gradient-to-r from-yellow-500 via-red-500 to-blue-600 hover:from-yellow-600 hover:via-red-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {editId ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {editId ? "Actualizar Categoría" : "Crear Categoría"}
                </>
              )}
            </button>

            {editId && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-3 border-2 border-yellow-300 text-gray-700 font-semibold rounded-lg hover:bg-yellow-50 transition-colors duration-200 disabled:opacity-50 shadow-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-5 md:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg mr-3 shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Lista de Categorías</h3>
                <p className="text-gray-600 text-sm">
                  {searchTerm ? (
                    <>
                      Mostrando <span className="font-semibold text-yellow-600">{filteredCategorias.length}</span> resultados para "<span className="font-semibold">{searchTerm}</span>"
                    </>
                  ) : (
                    "Todas las categorías disponibles"
                  )}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              Orden: <span className="font-semibold text-gray-700">Más reciente</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gradient-to-r from-yellow-500 via-red-500 to-blue-600"></div>
            <p className="mt-6 text-gray-600 font-medium">Cargando categorías...</p>
            <p className="text-gray-400 text-sm mt-2">Por favor espera un momento</p>
          </div>
        ) : filteredCategorias.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-gray-600 font-bold text-lg mb-2">
              {searchTerm ? "No se encontraron resultados" : "No hay categorías registradas"}
            </h4>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              {searchTerm 
                ? `No hay categorías que coincidan con "${searchTerm}". Intenta con otro término.`
                : "Comienza creando tu primera categoría usando el formulario superior."}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-sm"
              >
                Ver todas las categorías
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCategorias.map((cat, index) => (
              <div 
                key={cat.id_categoria} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-white transition-all duration-200 group"
              >
                <div className="flex items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-bold mr-4 shadow-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 sm:flex-initial">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="font-bold text-gray-800 text-lg group-hover:text-yellow-700 transition-colors">
                        {cat.nombre}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200">
                        ID: {cat.id_categoria}
                      </span>
                    </div>
                    {cat.fecha_creacion && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Creada: {new Date(cat.fecha_creacion).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 sm:mt-0 ml-14 sm:ml-0">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm flex items-center group/edit"
                    title="Editar categoría"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id_categoria, cat.nombre)}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm flex items-center group/delete"
                    title="Eliminar categoría"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas con gradientes */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-yellow-500 via-red-500 to-blue-600 text-white rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium">Total categorías</p>
              <p className="text-3xl font-bold mt-2">{categorias.length}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-white/80 text-xs">
              {filteredCategorias.length} {searchTerm ? 'resultados encontrados' : 'disponibles'}
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-yellow-300 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm font-medium">En edición</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {editId ? "1 categoría" : "Ninguna"}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-xs">
              {editId ? "Modo edición activado" : "Listo para crear nueva"}
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm font-medium">Última actualización</p>
              <p className="text-lg font-semibold text-gray-800 mt-2">
                {new Date().toLocaleDateString('es-ES', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-xs">
              Sistema actualizado al momento
            </p>
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Las categorías eliminadas no se pueden recuperar
        </p>
      </div>
    </div>
  );
};

export default Categorias;