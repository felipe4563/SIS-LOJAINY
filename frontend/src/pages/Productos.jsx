import { useEffect, useState, useContext, useRef } from "react";
import { listarProductos, eliminarProducto } from "../services/producto";
import { listarCategorias, listarTallas, listarColores, listarMarcas } from "../services/atributos";
import { AbilityContext } from "../context/AbilityContext";
import FormularioProducto from "../pages/Producto/FormularioProducto";
import EtiquetaQR from "../components/EtiquetaQr";
import { descargarCatalogoPDF } from "../utils/catalogoPDF";
import { useReactToPrint } from "react-to-print";
import {
  Pencil, Trash2, QrCode, Plus, ImageOff, Tag,
  Ruler, Palette, Store, Package, Filter,
  X, ChevronDown, ChevronUp, Search, ArrowLeft,
  CheckCircle, AlertCircle, AlertTriangle,
  LayoutGrid, LayoutList, FileDown,
} from "lucide-react";

// ─── Componente principal ─────────────────────────────────────────────────
const Productos = () => {
  const ability = useContext(AbilityContext);

  const [productos,      setProductos]      = useState([]);
  const [productoEdit,   setProductoEdit]   = useState(null);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [productoParaQR, setProductoParaQR] = useState(null);
  const [isPrinting,     setIsPrinting]     = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const [viewMode,       setViewMode]       = useState("grid");

  const [categorias, setCategorias] = useState([]);
  const [tallas,     setTallas]     = useState([]);
  const [colores,    setColores]    = useState([]);
  const [marcas,     setMarcas]     = useState([]);

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTalla,     setFiltroTalla]     = useState("");
  const [filtroColor,     setFiltroColor]     = useState("");
  const [filtroMarca,     setFiltroMarca]     = useState("");
  const [filtroStock,     setFiltroStock]     = useState(false);
  const [busqueda,        setBusqueda]        = useState("");

  const [confirmarEliminar, setConfirmarEliminar] = useState(null); // { id, nombre }
  const [error,  setError]  = useState("");
  const [exito,  setExito]  = useState("");
  const [eliminando, setEliminando] = useState(false);

  const printRef = useRef();

  // ── QR print ──
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `@page { size: 40mm 40mm; margin: 0mm; } @media print { body { margin: 0; padding: 0; } }`,
    documentTitle: "QR_Producto",
    removeAfterPrint: true,
    onBeforeGetContent: () => { setIsPrinting(true); return Promise.resolve(); },
    onAfterPrint:       () => { setIsPrinting(false); setProductoParaQR(null); },
    onPrintError:       (loc, err) => { console.error(loc, err); setIsPrinting(false); },
  });

  const mostrarError = (msg) => { setError(msg);  setTimeout(() => setError(""),  4000); };
  const mostrarExito = (msg) => { setExito(msg);  setTimeout(() => setExito(""),  3000); };

  const cargarProductos = async () => {
    try {
      const datos = await listarProductos();
      setProductos(datos);
    } catch (err) {
      console.error(err);
      mostrarError("Error al cargar los productos");
    }
  };

  const cargarFiltros = async () => {
    try {
      const [cat, tal, col, mar] = await Promise.all([
        listarCategorias(), listarTallas(), listarColores(), listarMarcas(),
      ]);
      setCategorias(cat); setTallas(tal); setColores(col); setMarcas(mar);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { cargarProductos(); cargarFiltros(); }, []);

  useEffect(() => {
    if (productoParaQR && printRef.current) {
      setTimeout(() => handlePrint(), 100);
    }
  }, [productoParaQR]);

  const confirmarYEliminar = async () => {
    if (!confirmarEliminar) return;
    setEliminando(true);
    try {
      await eliminarProducto(confirmarEliminar.id);
      mostrarExito(`"${confirmarEliminar.nombre}" eliminado correctamente`);
      setConfirmarEliminar(null);
      cargarProductos();
    } catch (err) {
      console.error(err);
      mostrarError(err.response?.data?.message || "Error al eliminar el producto");
      setConfirmarEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const handleFormSuccess = () => {
    cargarProductos();
    setModoFormulario(false);
    mostrarExito(productoEdit ? "Producto actualizado correctamente" : "Producto creado correctamente");
    setProductoEdit(null);
  };

  const handleCloseForm = () => { setModoFormulario(false); setProductoEdit(null); };

  const limpiarFiltros = () => {
    setFiltroCategoria(""); setFiltroTalla(""); setFiltroColor("");
    setFiltroMarca(""); setFiltroStock(false); setBusqueda("");
  };

  const productosFiltrados = productos.filter(p =>
    (filtroCategoria === "" || p.id_categoria === parseInt(filtroCategoria)) &&
    (filtroTalla     === "" || p.id_talla     === parseInt(filtroTalla))     &&
    (filtroColor     === "" || p.id_color     === parseInt(filtroColor))     &&
    (filtroMarca     === "" || p.id_marca     === parseInt(filtroMarca))     &&
    (!filtroStock || p.stock > 0) &&
    (busqueda === "" ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(busqueda.toLowerCase())  ||
      p.marca?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const hayFiltrosActivos = filtroCategoria || filtroTalla || filtroColor || filtroMarca || filtroStock || busqueda;

  const StockBadge = ({ stock }) => {
    if (stock === 0)   return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-[#C8102E] border border-red-200">Sin stock</span>;
    if (stock <= 5)    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">{stock} unid.</span>;
    return               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">{stock} unid.</span>;
  };

  // ── Vista formulario ──
  if (modoFormulario) {
    return (
      <div className="space-y-4 pb-20 sm:pb-0 animate-fade-in">
        <button
          onClick={handleCloseForm}
          className="flex items-center gap-2 text-[#003087] hover:opacity-70 font-semibold text-sm transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-[#003087]">
              {productoEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {productoEdit
                ? "Modifica la información del producto existente"
                : "Completa todos los campos para agregar al inventario"}
            </p>
          </div>
          <FormularioProducto
            producto={productoEdit}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    );
  }

  // ── Vista lista ──
  return (
    <div className="space-y-4 sm:space-y-5 pb-20 sm:pb-0 animate-fade-in">

      {/* Banner error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#C8102E] text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Banner éxito */}
      {exito && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{exito}</span>
          <button onClick={() => setExito("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#C8102E]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Eliminar producto</h3>
                <p className="text-xs text-slate-500 mt-0.5 break-words">
                  ¿Eliminar <strong>"{confirmarEliminar.nombre}"</strong>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmarEliminar(null)}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarYEliminar}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                {eliminando ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight leading-tight">
              Gestión de Productos
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""} encontrado{productosFiltrados.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle vista */}
          <div className="bg-white rounded-xl border border-slate-200 p-1 flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#003087] text-white" : "text-slate-500 hover:text-slate-800"}`}
              title="Vista cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#003087] text-white" : "text-slate-500 hover:text-slate-800"}`}
              title="Vista lista"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          {/* Exportar PDF */}
          <button
            onClick={() => descargarCatalogoPDF(productos)}
            className="flex items-center gap-2 px-3 py-2 bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white rounded-xl text-sm font-bold transition-colors border border-[#003087]/20"
            title="Exportar inventario a PDF"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>

          {/* Nuevo producto */}
          {ability.can("create", "Producto") && (
            <button
              onClick={() => { setProductoEdit(null); setModoFormulario(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded-xl text-sm font-bold hover:bg-[#003087]/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Buscar + filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por descripción, categoría o marca…"
              className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition placeholder-slate-400"
            />
            {busqueda && (
              <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle filtros */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} className="flex items-center gap-1 text-xs text-[#C8102E] hover:opacity-70 font-semibold transition-opacity">
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              {[
                { label: "Categoría", value: filtroCategoria, set: setFiltroCategoria, items: categorias, key: "id_categoria" },
                { label: "Talla",     value: filtroTalla,     set: setFiltroTalla,     items: tallas,     key: "id_talla"     },
                { label: "Color",     value: filtroColor,     set: setFiltroColor,     items: colores,    key: "id_color"     },
                { label: "Marca",     value: filtroMarca,     set: setFiltroMarca,     items: marcas,     key: "id_marca"     },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <select
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition bg-white"
                  >
                    <option value="">Todos</option>
                    {f.items.map(item => (
                      <option key={item[f.key]} value={item[f.key]}>{item.nombre}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filtroStock}
                    onChange={e => setFiltroStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003087] focus:ring-[#003087]"
                  />
                  <span className="text-sm font-medium text-slate-700">Solo productos con stock disponible</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estado vacío */}
      {productosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-800 font-bold text-base">Sin productos</p>
          <p className="text-slate-500 text-sm mt-1 mb-5">
            {hayFiltrosActivos ? "Ningún producto coincide con los filtros actuales" : "Aún no hay productos en el inventario"}
          </p>
          {hayFiltrosActivos ? (
            <button onClick={limpiarFiltros} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
              <X className="w-4 h-4" /> Limpiar filtros
            </button>
          ) : ability.can("create", "Producto") && (
            <button
              onClick={() => { setProductoEdit(null); setModoFormulario(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003087] text-white rounded-xl text-sm font-bold hover:bg-[#003087]/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Agregar primer producto
            </button>
          )}
        </div>
      )}

      {/* ── Vista Grid ── */}
      {viewMode === "grid" && productosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map(p => (
            <div key={p.id_producto} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              {/* Imagen */}
              <div className="relative h-44 bg-slate-100">
                {p.imagenes?.length > 0 ? (
                  <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {p.imagenes.map((img, i) => (
                      <div key={i} className="flex-shrink-0 w-full snap-center">
                        <img
                          src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${img}`}
                          alt={`${p.descripcion} ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E"; }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                {p.imagenes?.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {p.imagenes.map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-white/80 rounded-full" />
                    ))}
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-sm mb-2.5 line-clamp-2 leading-snug">{p.descripcion}</h3>

                <div className="space-y-1 mb-3">
                  {[
                    { icon: <Tag className="w-3.5 h-3.5" />,     text: p.categoria || "Sin categoría" },
                    { icon: <Ruler className="w-3.5 h-3.5" />,   text: `Talla: ${p.talla || "N/A"}` },
                    { icon: <Palette className="w-3.5 h-3.5" />, text: `Color: ${p.color || "N/A"}` },
                    { icon: <Store className="w-3.5 h-3.5" />,   text: p.marca || "Sin marca" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                      {row.icon} <span>{row.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-base font-extrabold text-[#003087]">
                      Bs {Number(p.precio).toFixed(2)}
                    </div>
                    <StockBadge stock={p.stock} />
                  </div>
                  <div className="flex gap-1.5">
                    {ability.can("update", "Producto") && (
                      <button
                        onClick={() => { setProductoEdit(p); setModoFormulario(true); }}
                        className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white flex items-center justify-center transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setProductoParaQR(p)}
                      className="w-8 h-8 rounded-lg bg-green-50 text-green-700 hover:bg-green-700 hover:text-white flex items-center justify-center transition-colors"
                      title="Imprimir QR"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {ability.can("delete", "Producto") && (
                  <button
                    onClick={() => setConfirmarEliminar({ id: p.id_producto, nombre: p.descripcion })}
                    className="w-full mt-2.5 py-1.5 bg-red-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Vista Lista ── */}
      {viewMode === "list" && productosFiltrados.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-bold">Imag.</th>
                  <th className="px-4 py-3 font-bold">Producto</th>
                  <th className="px-4 py-3 font-bold hidden lg:table-cell">Categoría</th>
                  <th className="px-4 py-3 font-bold hidden md:table-cell">Talla</th>
                  <th className="px-4 py-3 font-bold hidden md:table-cell">Color</th>
                  <th className="px-4 py-3 font-bold hidden lg:table-cell">Marca</th>
                  <th className="px-4 py-3 font-bold text-right">Precio</th>
                  <th className="px-4 py-3 font-bold text-center">Stock</th>
                  <th className="px-4 py-3 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productosFiltrados.map(p => (
                  <tr key={p.id_producto} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1.5">
                        {p.imagenes?.slice(0, 3).map((img, i) => (
                          <div key={i} className="relative">
                            <img
                              src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${img}`}
                              alt=""
                              className="w-9 h-9 rounded-lg border-2 border-white object-cover"
                              onError={e => { e.target.onerror = null; e.target.style.display = "none"; }}
                            />
                            {i === 2 && p.imagenes.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">+{p.imagenes.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!p.imagenes || p.imagenes.length === 0) && (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 text-sm">{p.descripcion}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-[#003087]/10 text-[#003087] rounded-full text-xs font-bold">{p.categoria}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600">{p.talla}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0" style={{ background: p.color?.toLowerCase() || "#cbd5e1" }} />
                        {p.color}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">{p.marca}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#003087] text-sm whitespace-nowrap">
                      Bs {Number(p.precio).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1.5">
                        {ability.can("update", "Producto") && (
                          <button
                            onClick={() => { setProductoEdit(p); setModoFormulario(true); }}
                            className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setProductoParaQR(p)}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-700 hover:bg-green-700 hover:text-white flex items-center justify-center transition-colors"
                          title="Imprimir QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {ability.can("delete", "Producto") && (
                          <button
                            onClick={() => setConfirmarEliminar({ id: p.id_producto, nombre: p.descripcion })}
                            className="w-8 h-8 rounded-lg bg-red-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white flex items-center justify-center transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Área impresión oculta ── */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {productoParaQR && <EtiquetaQR producto={productoParaQR} />}
        </div>
      </div>
      {/* Overlay impresión QR */}
      {isPrinting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#003087] border-t-transparent mx-auto mb-5" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Preparando QR</h3>
            <p className="text-slate-500 text-sm">
              Generando código QR para <strong>{productoParaQR?.descripcion}</strong>
            </p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />
    </div>
  );
};

export default Productos;
