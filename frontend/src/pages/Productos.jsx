import { useEffect, useState, useContext, useRef } from "react";
import { listarProductos, eliminarProducto } from "../services/producto";
import { listarCategorias, listarTallas, listarColores } from "../services/atributos";
import { AbilityContext } from "../context/AbilityContext";
import FormularioProducto from "../pages/Producto/FormularioProducto";
import EtiquetaQR from "../components/EtiquetaQr";
import { useReactToPrint } from "react-to-print";
import { FiEdit2, FiTrash2, FiPrinter, FiPlus, FiFilter, FiEye, FiShoppingCart } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productoEdit, setProductoEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productoParaQR, setProductoParaQR] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'cards', 'table'

  const [categorias, setCategorias] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [colores, setColores] = useState([]);

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTalla, setFiltroTalla] = useState("");
  const [filtroColor, setFiltroColor] = useState("");
  const [filtroStock, setFiltroStock] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const ability = useContext(AbilityContext);
  const printRef = useRef();

  // Configurar react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: 40mm 40mm; margin: 0mm; }
      @media print { body { margin: 0; padding: 0; } }
    `,
    documentTitle: `QR_${productoParaQR?.descripcion?.substring(0, 20) || 'Producto'}`,
    removeAfterPrint: true,
    onBeforeGetContent: () => { setIsPrinting(true); return Promise.resolve(); },
    onAfterPrint: () => { setIsPrinting(false); setProductoParaQR(null); },
    onPrintError: (errorLocation, error) => { 
      console.error("Error en impresión:", errorLocation, error); 
      setIsPrinting(false); 
      alert("Error al imprimir. Revisa la configuración de impresión.");
    }
  });

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await listarProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarFiltros = async () => {
    try {
      const [cat, tall, col] = await Promise.all([
        listarCategorias(),
        listarTallas(),
        listarColores()
      ]);
      setCategorias(cat);
      setTallas(tall);
      setColores(col);
    } catch (error) {
      console.error("Error cargando filtros:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarFiltros();
  }, []);

  useEffect(() => {
    if (productoParaQR && printRef.current) {
      setTimeout(() => handlePrint(), 100);
    }
  }, [productoParaQR]);

  const handleEliminar = async (producto) => {
    if (window.confirm(`¿Estás seguro de eliminar "${producto.descripcion}"? Esta acción no se puede deshacer.`)) {
      try {
        await eliminarProducto(producto.id_producto);
        cargarProductos();
      } catch (error) {
        alert("Error al eliminar el producto");
      }
    }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = !busqueda || 
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.color.toLowerCase().includes(busqueda.toLowerCase());

    return (
      coincideBusqueda &&
      (filtroCategoria === "" || p.id_categoria === parseInt(filtroCategoria)) &&
      (filtroTalla === "" || p.id_talla === parseInt(filtroTalla)) &&
      (filtroColor === "" || p.id_color === parseInt(filtroColor)) &&
      (!filtroStock || p.stock > 0)
    );
  });

  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroTalla("");
    setFiltroColor("");
    setFiltroStock(false);
    setBusqueda("");
  };

  // Determinar si mostrar tarjetas basado en el tamaño de pantalla
  const shouldShowCards = () => {
    if (viewMode === 'cards') return true;
    if (viewMode === 'table') return false;
    // 'auto' mode - mostrar tarjetas en pantallas pequeñas
    return window.innerWidth < 768;
  };

  // Componente de tarjeta para producto
  const ProductoCard = ({ producto }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
            {producto.imagen_principal ? (
              <img
                src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${producto.imagen_principal}`}
                alt={producto.descripcion}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' fill='%23f0f0f0'/%3E%3Ctext x='64' y='64' text-anchor='middle' dy='.3em' font-size='10' fill='%23999'%3ESin imagen%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <BsQrCodeScan className="text-gray-400" size={32} />
              </div>
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                {producto.descripcion}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {producto.categoria}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {producto.talla}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {producto.color}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                Bs {parseFloat(producto.precio).toFixed(2)}
              </div>
              <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                producto.stock > 10 ? 'bg-green-100 text-green-800' : 
                producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {producto.stock} unidades
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => iniciarImpresionQR(producto)}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex-1 min-w-[120px] justify-center"
            >
              <FiPrinter size={16} />
              <span>Imprimir QR</span>
            </button>
            
            {ability.can("update", "Producto") && (
              <button
                onClick={() => { setProductoEdit(producto); setShowForm(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex-1 min-w-[120px] justify-center"
              >
                <FiEdit2 size={16} />
                <span>Editar</span>
              </button>
            )}
            
            {ability.can("delete", "Producto") && (
              <button
                onClick={() => handleEliminar(producto)}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex-1 min-w-[120px] justify-center"
              >
                <FiTrash2 size={16} />
                <span>Eliminar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Productos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'} encontrados
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Selector de vista (solo visible en desktop) */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('auto')}
              className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'auto' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Vista automática"
            >
              Auto
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'cards' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Vista en tarjetas"
            >
              <FiEye size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded-md transition ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Vista en tabla"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${mostrarFiltros ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
          >
            <FiFilter size={18} />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          {ability.can("create", "Producto") && (
            <button
              onClick={() => { setProductoEdit(null); setShowForm(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FiPlus size={18} />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTROS EXPANDIBLES */}
      {mostrarFiltros && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Filtros</h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Talla</label>
              <select
                value={filtroTalla}
                onChange={(e) => setFiltroTalla(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="">Todas las tallas</option>
                {tallas.map(t => (
                  <option key={t.id_talla} value={t.id_talla}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={filtroColor}
                onChange={(e) => setFiltroColor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="">Todos los colores</option>
                {colores.map(c => (
                  <option key={c.id_color} value={c.id_color}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg w-full h-[42px]">
                <input
                  type="checkbox"
                  checked={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Solo con stock disponible</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL - TARJETAS O TABLA */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {shouldShowCards() ? (
            // VISTA EN TARJETAS
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosFiltrados.map(producto => (
                <ProductoCard key={producto.id_producto} producto={producto} />
              ))}
            </div>
          ) : (
            // VISTA EN TABLA
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Especificaciones
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productosFiltrados.map(p => (
                    <tr key={p.id_producto} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                            {p.imagen_principal ? (
                              <img
                                src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${p.imagen_principal}`}
                                alt={p.descripcion}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' font-size='8' fill='%23999'%3ESin imagen%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                <BsQrCodeScan className="text-gray-400" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">{p.descripcion}</div>
                            <div className="text-sm text-gray-500 md:hidden">
                              {p.categoria} • {p.talla} • {p.color}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {p.talla}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {p.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          p.stock > 10 ? 'bg-green-100 text-green-800' : 
                          p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {p.stock} unidades
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          Bs {parseFloat(p.precio).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => iniciarImpresionQR(p)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Imprimir QR"
                          >
                            <FiPrinter size={18} />
                          </button>
                          
                          {ability.can("update", "Producto") && (
                            <button
                              onClick={() => { setProductoEdit(p); setShowForm(true); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <FiEdit2 size={18} />
                            </button>
                          )}
                          
                          {ability.can("delete", "Producto") && (
                            <button
                              onClick={() => handleEliminar(p)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
                <BsQrCodeScan size={96} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {busqueda || filtroCategoria || filtroTalla || filtroColor || filtroStock 
                  ? "Intenta con otros filtros de búsqueda" 
                  : "No hay productos registrados. ¡Crea tu primer producto!"}
              </p>
              {!busqueda && !filtroCategoria && !filtroTalla && !filtroColor && !filtroStock && ability.can("create", "Producto") && (
                <button
                  onClick={() => { setProductoEdit(null); setShowForm(true); }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                  <FiPlus /> Crear primer producto
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL FORMULARIO */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <FormularioProducto
              producto={productoEdit}
              onClose={() => setShowForm(false)}
              onSuccess={() => { setShowForm(false); cargarProductos(); }}
            />
          </div>
        </div>
      )}

      {/* Área oculta para la impresión */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {productoParaQR && <EtiquetaQR producto={productoParaQR} />}
        </div>
      </div>

      {/* Overlay de carga durante la impresión */}
      {isPrinting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Preparando impresión</h3>
            <p className="text-gray-600 text-center mb-4">
              Generando código QR para: <br/>
              <span className="font-medium">{productoParaQR?.descripcion}</span>
            </p>
            <p className="text-sm text-gray-500 text-center">
              Si no aparece el cuadro de impresión, revisa los bloqueadores de ventanas emergentes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;