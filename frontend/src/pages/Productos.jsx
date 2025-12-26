import { useEffect, useState, useContext, useRef } from "react";
import { listarProductos, eliminarProducto } from "../services/producto";
import { listarCategorias, listarTallas, listarColores } from "../services/atributos";
import { AbilityContext } from "../context/AbilityContext";
import FormularioProducto from "../pages/Producto/FormularioProducto";
import EtiquetaQR from "../components/EtiquetaQr";
import { useReactToPrint } from "react-to-print";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productoEdit, setProductoEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productoParaQR, setProductoParaQR] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [colores, setColores] = useState([]);

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTalla, setFiltroTalla] = useState("");
  const [filtroColor, setFiltroColor] = useState("");
  const [filtroStock, setFiltroStock] = useState(false);

  const ability = useContext(AbilityContext);
  const printRef = useRef();

  // Configurar react-to-print
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

  const cargarProductos = async () => setProductos(await listarProductos());

  const cargarFiltros = async () => {
    setCategorias(await listarCategorias());
    setTallas(await listarTallas());
    setColores(await listarColores());
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>

      {ability.can("create", "Producto") && (
        <button
          onClick={() => { setProductoEdit(null); setShowForm(true); }}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Nuevo Producto
        </button>
      )}

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
          ))}
        </select>

        <select
          value={filtroTalla}
          onChange={(e) => setFiltroTalla(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todas las tallas</option>
          {tallas.map(t => (
            <option key={t.id_talla} value={t.id_talla}>{t.nombre}</option>
          ))}
        </select>

        <select
          value={filtroColor}
          onChange={(e) => setFiltroColor(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos los colores</option>
          {colores.map(c => (
            <option key={c.id_color} value={c.id_color}>{c.nombre}</option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtroStock}
            onChange={(e) => setFiltroStock(e.target.checked)}
          />
          Solo con stock
        </label>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Imagen</th>
              <th className="border border-gray-300 p-2 text-left">Descripción</th>
              <th className="border border-gray-300 p-2 text-left">Categoría</th>
              <th className="border border-gray-300 p-2 text-left">Talla</th>
              <th className="border border-gray-300 p-2 text-left">Color</th>
              <th className="border border-gray-300 p-2 text-left">Precio</th>
              <th className="border border-gray-300 p-2 text-left">Stock</th>
              <th className="border border-gray-300 p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos
              .filter(p =>
                (filtroCategoria === "" || p.id_categoria === parseInt(filtroCategoria)) &&
                (filtroTalla === "" || p.id_talla === parseInt(filtroTalla)) &&
                (filtroColor === "" || p.id_color === parseInt(filtroColor)) &&
                (!filtroStock || p.stock > 0)
              )
              .map(p => (
                <tr key={p.id_producto} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {p.imagen_principal && (
                      <img
                        src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/productos/${p.imagen_principal}`}
                        alt={p.descripcion}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' font-size='8'%3ESin imagen%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">{p.descripcion}</td>
                  <td className="border border-gray-300 p-2">{p.categoria}</td>
                  <td className="border border-gray-300 p-2">{p.talla}</td>
                  <td className="border border-gray-300 p-2">{p.color}</td>
                  <td className="border border-gray-300 p-2 font-medium">Bs {parseFloat(p.precio).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 font-medium">{p.stock}</td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex flex-wrap gap-2">
                      {ability.can("update", "Producto") && (
                        <button
                          onClick={() => { setProductoEdit(p); setShowForm(true); }}
                          className="bg-yellow-500 px-3 py-1 text-white rounded hover:bg-yellow-600 transition"
                        >
                          Editar
                        </button>
                      )}
                      {ability.can("delete", "Producto") && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar "${p.descripcion}"?`)) {
                              eliminarProducto(p.id_producto).then(cargarProductos);
                            }
                          }}
                          className="bg-red-600 px-3 py-1 text-white rounded hover:bg-red-700 transition"
                        >
                          Eliminar
                        </button>
                      )}
                      <button
                        onClick={() => iniciarImpresionQR(p)}
                        className="bg-green-600 px-3 py-1 text-white rounded hover:bg-green-700 transition"
                      >
                        Imprimir QR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {productos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay productos registrados
        </div>
      )}

      {showForm && (
        <FormularioProducto
          producto={productoEdit}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); cargarProductos(); }}
        />
      )}

      {/* Área oculta para la impresión */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {productoParaQR && <EtiquetaQR producto={productoParaQR} />}
        </div>
      </div>

      {/* Overlay de carga durante la impresión */}
      {isPrinting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-center">Preparando impresión del QR...</p>
            <p className="text-sm text-gray-600 mt-2">
              Si no aparece el cuadro de impresión, revisa los bloqueadores de ventanas emergentes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
