import React, { useEffect, useState, useRef, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import { AuthContext } from "../context/AuthContext";
import { listarVentas, obtenerVenta, crearVenta } from "../services/venta";
import { obtenerProducto } from "../services/producto";
import ComprobanteVenta from "../components/ComprobanteVenta";
import { 
  FiShoppingCart, 
  FiUser, 
  FiCreditCard, 
  FiPackage, 
  FiPrinter,
  FiSearch,
  FiPlus,
  FiMinus,
  FiCheck,
  FiDollarSign,
  FiList
} from "react-icons/fi";

const Ventas = () => {
  const ability = useContext(AbilityContext);
  const { usuario } = useContext(AuthContext);

  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productosEnVenta, setProductosEnVenta] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [total, setTotal] = useState(0);
  const [cliente, setCliente] = useState({ ci: "", nombre: "", apellido: "", celular: "" });
  const [qrInput, setQrInput] = useState("");
  const comprobanteRef = useRef();

  useEffect(() => {
    if (ability.can("read", "Venta")) cargarVentas();
  }, [ability]);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await listarVentas();
      setVentas(data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  const verVenta = async (id) => {
    try {
      const data = await obtenerVenta(id);
      setVentaSeleccionada(data);
      // Scroll suave hacia la sección de detalles
      setTimeout(() => {
        document.getElementById("detalles-venta")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("No se pudo obtener la venta");
    }
  };

  const extraerIdProducto = (qrText) => {
    try {
      const url = new URL(qrText);
      const partes = url.pathname.split("/").filter(Boolean);
      
      if (partes.includes("producto")) {
        const index = partes.indexOf("producto");
        const id = parseInt(partes[index + 1]);
        return isNaN(id) ? null : id;
      }
      
      const posibleId = parseInt(partes[0]);
      return isNaN(posibleId) ? null : posibleId;
    } catch {
      const match = qrText.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    }
  };

  const agregarProductoQR = async (textoQR) => {
    const id_producto = extraerIdProducto(textoQR);
    
    if (!id_producto) {
      alert("QR inválido o no contiene un ID de producto");
      return;
    }
    
    try {
      const producto = await obtenerProducto(id_producto);
      
      setProductosEnVenta((prev) => {
        const existe = prev.find((p) => p.id_producto === id_producto);
        let nuevos;
        
        if (existe) {
          nuevos = prev.map((p) =>
            p.id_producto === id_producto
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          );
        } else {
          nuevos = [
            ...prev,
            {
              id_producto: producto.id_producto,
              precio: Number(producto.precio),
              descripcion: producto.descripcion,
              cantidad: 1,
            },
          ];
        }
        
        const sumaTotal = nuevos.reduce(
          (sum, p) => sum + p.precio * p.cantidad,
          0
        );
        
        setTotal(sumaTotal);
        return nuevos;
      });
      
      setQrInput("");
      
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el producto");
    }
  };

  const cambiarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const nuevos = productosEnVenta.map((p) =>
      p.id_producto === id_producto ? { ...p, cantidad: nuevaCantidad } : p
    );
    setProductosEnVenta(nuevos);
    setTotal(nuevos.reduce((sum, p) => sum + p.precio * p.cantidad, 0));
  };

  const eliminarProducto = (id_producto) => {
    const nuevos = productosEnVenta.filter(p => p.id_producto !== id_producto);
    setProductosEnVenta(nuevos);
    setTotal(nuevos.reduce((sum, p) => sum + p.precio * p.cantidad, 0));
  };

  const confirmarVenta = async () => {
    if (!ability.can("create", "Venta")) {
      alert("No tienes permisos para crear ventas");
      return;
    }

    if (productosEnVenta.length === 0) {
      alert("Debe agregar al menos un producto a la venta");
      return;
    }

    if (!cliente.ci || !cliente.nombre || !cliente.apellido) {
      alert("Complete los datos obligatorios del cliente (CI, Nombre y Apellido)");
      return;
    }

    const datos = {
      metodo_pago: metodoPago,
      total,
      detalles: productosEnVenta,
      cliente
    };

    try {
      const res = await crearVenta(datos);
      alert(`Venta creada exitosamente! ID: ${res.id_venta}`);
      await verVenta(res.id_venta);

      // Limpiar formulario
      setProductosEnVenta([]);
      setMetodoPago("efectivo");
      setTotal(0);
      setCliente({ ci: "", nombre: "", apellido: "", celular: "" });
      setQrInput("");
      cargarVentas();
    } catch (err) {
      console.error(err);
      alert("Error al crear la venta");
    }
  };

  const imprimirComprobante = () => {
    if (!ventaSeleccionada) return;

    const contenido = comprobanteRef.current.innerHTML;
    const ventana = window.open("", "_blank");

    ventana.document.write(`
      <html>
        <head>
          <title>Comprobante de Venta #${ventaSeleccionada.id_venta}</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${contenido}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  };

  // Formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <FiShoppingCart className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Gestión de Ventas
                </h1>
                <p className="text-gray-600 mt-1">
                  Sistema integrado de ventas y facturación
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Usuario activo</p>
              <p className="font-semibold text-gray-800">{usuario?.nombre || "Administrador"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* PANEL IZQUIERDO: NUEVA VENTA */}
          {ability.can("create", "Venta") && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiPlus className="text-white" />
                  Nueva Venta
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* SCANNER QR */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiSearch className="inline mr-2" />
                    Escanear código QR
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Pega el código QR o escribe el ID del producto"
                      className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          agregarProductoQR(qrInput);
                        }
                      }}
                    />
                    <button
                      onClick={() => agregarProductoQR(qrInput)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-lg font-medium transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* DATOS DEL CLIENTE */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    Datos del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CI *
                      </label>
                      <input
                        type="text"
                        value={cliente.ci}
                        onChange={(e) => setCliente({ ...cliente, ci: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Celular
                      </label>
                      <input
                        type="text"
                        value={cliente.celular}
                        onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="70012345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={cliente.nombre}
                        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={cliente.apellido}
                        onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pérez"
                      />
                    </div>
                  </div>
                </div>

                {/* MÉTODO DE PAGO */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiCreditCard className="text-green-500" />
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMetodoPago("efectivo")}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        metodoPago === "efectivo"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <FiDollarSign />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setMetodoPago("qr")}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        metodoPago === "qr"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <FiCreditCard />
                      Pago QR
                    </button>
                  </div>
                </div>

                {/* PRODUCTOS EN VENTA */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiPackage className="text-purple-500" />
                    Productos ({productosEnVenta.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                    {productosEnVenta.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FiPackage className="text-3xl mx-auto mb-2 opacity-50" />
                        <p>No hay productos agregados</p>
                        <p className="text-sm mt-1">Escanea un código QR para agregar productos</p>
                      </div>
                    ) : (
                      productosEnVenta.map((p) => (
                        <div key={p.id_producto} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{p.descripcion}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Bs {Number(p.precio).toFixed(2)} c/u
                              </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => cambiarCantidad(p.id_producto, p.cantidad - 1)}
                                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                >
                                  <FiMinus className="text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-medium">
                                  {p.cantidad}
                                </span>
                                <button
                                  onClick={() => cambiarCantidad(p.id_producto, p.cantidad + 1)}
                                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                >
                                  <FiPlus className="text-gray-600" />
                                </button>
                              </div>
                              <div className="text-right min-w-[100px]">
                                <p className="font-bold text-gray-800">
                                  Bs {(p.precio * p.cantidad).toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => eliminarProducto(p.id_producto)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* TOTAL Y BOTÓN DE CONFIRMACIÓN */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-700">Total:</span>
                    <span className="text-3xl font-bold text-blue-600">
                      Bs {Number(total).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={confirmarVenta}
                    disabled={productosEnVenta.length === 0 || loading}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      productosEnVenta.length === 0 || loading
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <FiCheck className="text-xl" />
                    {loading ? "Procesando..." : "Confirmar Venta"}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    * Campos obligatorios: CI, Nombre y Apellido
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PANEL DERECHO: HISTORIAL Y DETALLES */}
          <div className="space-y-6 md:space-y-8">
            {/* HISTORIAL DE VENTAS */}
            {ability.can("read", "Venta") && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiList className="text-white" />
                    Historial de Ventas
                  </h2>
                </div>
                
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Cargando ventas...</p>
                    </div>
                  ) : ventas.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FiShoppingCart className="text-4xl mx-auto mb-3 opacity-50" />
                      <p>No hay ventas registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {ventas.map((v) => (
                        <div
                          key={v.id_venta}
                          className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${
                            ventaSeleccionada?.id_venta === v.id_venta
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-800">
                                  Venta #{v.id_venta}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  v.metodo_pago === "efectivo"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {v.metodo_pago}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p className="flex items-center gap-1">
                                  <FiUser className="text-gray-400" />
                                  {v.nombre_usuario}
                                </p>
                                <p>{formatFecha(v.fecha)}</p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                              <span className="text-xl font-bold text-blue-600">
                                Bs {Number(v.total).toFixed(2)}
                              </span>
                              <button
                                onClick={() => verVenta(v.id_venta)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all text-sm"
                              >
                                Ver Detalles
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DETALLES DE VENTA SELECCIONADA */}
            {ventaSeleccionada && (
              <div id="detalles-venta" className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FiShoppingCart className="text-white" />
                      Detalles de Venta #{ventaSeleccionada.id_venta}
                    </h2>
                    <button
                      onClick={imprimirComprobante}
                      className="px-5 py-2.5 bg-white text-indigo-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                      <FiPrinter />
                      Imprimir Comprobante
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* INFORMACIÓN DE LA VENTA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha y Hora</p>
                      <p className="font-medium">{formatFecha(ventaSeleccionada.fecha)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Método de Pago</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ventaSeleccionada.metodo_pago === "efectivo"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {ventaSeleccionada.metodo_pago}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendedor</p>
                      <p className="font-medium">{ventaSeleccionada.nombre_usuario}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-medium">
                        {ventaSeleccionada.cliente_nombre} {ventaSeleccionada.cliente_apellido}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCTOS DE LA VENTA */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Productos ({ventaSeleccionada.detalles?.length || 0})
                    </h3>
                    <div className="border border-gray-200 rounded-lg divide-y max-h-80 overflow-y-auto">
                      {ventaSeleccionada.detalles?.map((d, index) => (
                        <div key={d.id_detalle || index} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{d.nombre_producto}</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {d.categoria && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {d.categoria}
                                  </span>
                                )}
                                {d.color && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {d.color}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {d.cantidad || 1} × Bs {Number(d.precio).toFixed(2)}
                              </p>
                              <p className="font-bold text-gray-800 text-lg">
                                Bs {((d.cantidad || 1) * d.precio).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total Final</span>
                      <span className="text-3xl font-bold text-white">
                        Bs {Number(ventaSeleccionada.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COMPROBANTE OCULTO */}
                <div className="hidden">
                  <ComprobanteVenta ref={comprobanteRef} venta={ventaSeleccionada} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-gray-500 text-sm py-6">
          <p>Sistema de Ventas • {new Date().getFullYear()} • Versión 1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Ventas;