import { useEffect, useState, useContext, useRef } from "react";
import { listarProductos, eliminarProducto } from "../services/producto";
import { listarCategorias, listarTallas, listarColores, listarMarcas } from "../services/atributos";
import { AbilityContext } from "../context/AbilityContext";
import FormularioProducto from "../pages/Producto/FormularioProducto";
import EtiquetaQR from "../components/EtiquetaQr";
import { useReactToPrint } from "react-to-print";

// Importaciones de iconos
import { 
  PencilIcon, 
  TrashIcon, 
  QrCodeIcon, 
  PlusIcon,
  PhotoIcon,
  TagIcon,
  ArrowsUpDownIcon,
  SwatchIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productoEdit, setProductoEdit] = useState(null);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [productoParaQR, setProductoParaQR] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [mensajeExito, setMensajeExito] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [colores, setColores] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTalla, setFiltroTalla] = useState("");
  const [filtroColor, setFiltroColor] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroStock, setFiltroStock] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const ability = useContext(AbilityContext);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: 40mm 40mm; margin: 0mm; }
      @media print { body { margin: 0; padding: 0; } }
    `,
    documentTitle: `QR_Producto`,
    removeAfterPrint: true,
    onBeforeGetContent: () => { setIsPrinting(true); return Promise.resolve(); },
    onAfterPrint: () => { setIsPrinting(false); setProductoParaQR(null); },
    onPrintError: (errorLocation, error) => { console.error("Error en impresión:", errorLocation, error); setIsPrinting(false); }
  });

  const cargarProductos = async () => {
    try {
      const datos = await listarProductos();
      setProductos(datos);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const cargarFiltros = async () => {
    try {
      const [cat, tal, col, mar] = await Promise.all([
        listarCategorias(),
        listarTallas(),
        listarColores(),
        listarMarcas()
      ]);
      setCategorias(cat);
      setTallas(tal);
      setColores(col);
      setMarcas(mar);
    } catch (error) {
      console.error("Error al cargar filtros:", error);
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

  const iniciarImpresionQR = (producto) => setProductoParaQR(producto);

  const productosFiltrados = productos.filter(p =>
    (filtroCategoria === "" || p.id_categoria === parseInt(filtroCategoria)) &&
    (filtroTalla === "" || p.id_talla === parseInt(filtroTalla)) &&
    (filtroColor === "" || p.id_color === parseInt(filtroColor)) &&
    (filtroMarca === "" || p.id_marca === parseInt(filtroMarca)) &&
    (!filtroStock || p.stock > 0) &&
    (busqueda === "" || 
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroTalla("");
    setFiltroColor("");
    setFiltroMarca("");
    setFiltroStock(false);
    setBusqueda("");
  };

  // Función para manejar el éxito del formulario
  const handleFormSuccess = () => {
    cargarProductos();
    setModoFormulario(false);
    setProductoEdit(null);
    setMensajeExito(productoEdit ? "¡Producto actualizado correctamente!" : "¡Producto creado correctamente!");
    setTimeout(() => setMensajeExito(""), 3000);
  };

  // Función para cerrar el formulario
  const handleCloseForm = () => {
    setModoFormulario(false);
    setProductoEdit(null);
  };

  // Si estamos en modo formulario, mostrar solo el formulario
  if (modoFormulario) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header del formulario */}
          <div className="mb-6">
            <button
              onClick={handleCloseForm}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Volver a la lista de productos</span>
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {productoEdit ? "✏️ Editar Producto" : "➕ Crear Nuevo Producto"}
              </h2>
              <p className="text-gray-600">
                {productoEdit 
                  ? "Modifica la información del producto existente" 
                  : "Completa todos los campos para agregar un nuevo producto al inventario"}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <FormularioProducto
            producto={productoEdit}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    );
  }

  // Vista normal de lista de productos
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mensaje de éxito */}
        {mensajeExito && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <span className="text-green-700 font-medium">{mensajeExito}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Productos</h2>
            <p className="text-gray-600 mt-1">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Vista toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                title="Vista de tarjetas"
              >
                <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-current rounded-sm"></div>
                  ))}
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                title="Vista de lista"
              >
                <div className="w-5 h-5 flex flex-col gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-current h-1 rounded-sm"></div>
                  ))}
                </div>
              </button>
            </div>

            {ability.can("create", "Producto") && (
              <button
                onClick={() => { 
                  setProductoEdit(null); 
                  setModoFormulario(true); 
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Nuevo Producto</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos por descripción, categoría o marca..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Botón toggle filtros */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filtros</span>
                {showFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </button>

              {(filtroCategoria || filtroTalla || filtroColor || filtroMarca || filtroStock || busqueda) && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Filtros expandibles */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Talla</label>
                  <select
                    value={filtroTalla}
                    onChange={(e) => setFiltroTalla(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Todas las tallas</option>
                    {tallas.map(t => <option key={t.id_talla} value={t.id_talla}>{t.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    value={filtroColor}
                    onChange={(e) => setFiltroColor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Todos los colores</option>
                    {colores.map(c => <option key={c.id_color} value={c.id_color}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <select
                    value={filtroMarca}
                    onChange={(e) => setFiltroMarca(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Todas las marcas</option>
                    {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtroStock}
                      onChange={(e) => setFiltroStock(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Mostrar solo productos con stock disponible</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vista Grid - Tarjetas */}
        {viewMode === "grid" && productosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map(p => (
              <div key={p.id_producto} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                {/* Galería de imágenes con scroll horizontal */}
                <div className="relative h-48 bg-gray-100">
                  {p.imagenes?.length > 0 ? (
                    <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                      {p.imagenes.map((img, i) => (
                        <div key={i} className="flex-shrink-0 w-full snap-center">
                          <img
                            src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${img}`}
                            alt={`${p.descripcion} - Imagen ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Indicadores de imágenes */}
                  {p.imagenes?.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {p.imagenes.map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-white bg-opacity-60 rounded-full"></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2" title={p.descripcion}>
                    {p.descripcion}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TagIcon className="w-4 h-4" />
                      <span>{p.categoria || "Sin categoría"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ArrowsUpDownIcon className="w-4 h-4" />
                      <span>Talla: {p.talla || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <SwatchIcon className="w-4 h-4" />
                      <span>Color: {p.color || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BuildingStorefrontIcon className="w-4 h-4" />
                      <span>{p.marca || "Sin marca"}</span>
                    </div>
                  </div>

                  {/* Precio y Stock */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        Bs {parseFloat(p.precio).toFixed(2)}
                      </div>
                      <div className={`text-sm font-medium ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        <CubeIcon className="w-4 h-4 inline mr-1" />
                        Stock: {p.stock} unid.
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {ability.can("update", "Producto") && (
                        <button
                          onClick={() => { 
                            setProductoEdit(p); 
                            setModoFormulario(true); 
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => iniciarImpresionQR(p)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                        title="Imprimir QR"
                      >
                        <QrCodeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Botón eliminar (si tiene permisos) */}
                  {ability.can("delete", "Producto") && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro de eliminar "${p.descripcion}"?`)) {
                          eliminarProducto(p.id_producto).then(cargarProductos);
                        }
                      }}
                      className="w-full mt-3 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Eliminar producto
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista Lista - Tabla para pantallas grandes */}
        {viewMode === "list" && productosFiltrados.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Imágenes</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Categoría</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Talla</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Color</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Marca</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productosFiltrados.map(p => (
                    <tr key={p.id_producto} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex -space-x-2">
                          {p.imagenes?.slice(0, 3).map((img, i) => (
                            <div key={i} className="relative">
                              <img
                                src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${img}`}
                                alt={`${p.descripcion} ${i + 1}`}
                                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23f3f4f6'/%3E%3Ctext x='20' y='22' text-anchor='middle' font-size='10' fill='%239ca3af'%3EImg%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              {i === 2 && p.imagenes.length > 3 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">+{p.imagenes.length - 3}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{p.descripcion}</div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-gray-700">{p.talla}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: p.color?.toLowerCase() || '#ccc' }} />
                          <span>{p.color}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <span className="text-gray-700">{p.marca}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-600">Bs {parseFloat(p.precio).toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {ability.can("update", "Producto") && (
                            <button
                              onClick={() => { 
                                setProductoEdit(p); 
                                setModoFormulario(true); 
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          {ability.can("delete", "Producto") && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Estás seguro de eliminar "${p.descripcion}"?`)) {
                                  eliminarProducto(p.id_producto).then(cargarProductos);
                                }
                              }}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => iniciarImpresionQR(p)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                            title="Imprimir QR"
                          >
                            <QrCodeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mensaje sin resultados */}
        {productosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <CubeIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500 mb-6">Intenta ajustar los filtros o agrega un nuevo producto</p>
            {ability.can("create", "Producto") && (
              <button
                onClick={() => { 
                  setProductoEdit(null); 
                  setModoFormulario(true); 
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                <PlusIcon className="w-5 h-5" />
                Crear primer producto
              </button>
            )}
          </div>
        )}
      </div>

      {/* Área oculta para la impresión */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {productoParaQR && <EtiquetaQR producto={productoParaQR} />}
        </div>
      </div>

      {/* Overlay de carga durante la impresión */}
      {isPrinting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparando impresión</h3>
              <p className="text-gray-600 text-center mb-4">
                Generando código QR para <strong>{productoParaQR?.descripcion}</strong>
              </p>
              <p className="text-sm text-gray-500 text-center">
                Si no aparece el cuadro de impresión, revisa los bloqueadores de ventanas emergentes en tu navegador
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;