import React, { useState, useEffect, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import { listarVentas, obtenerVenta, eliminarVenta } from "../services/venta";
import {
  ClipboardList, Eye, Trash2, ArrowLeft, ShoppingBag,
  User, Banknote, QrCode, AlertCircle, AlertTriangle,
  X, CheckCircle, Package, Tag, Palette,
} from "lucide-react";

const VentasLista = () => {
  const ability = useContext(AbilityContext);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (ability.can("read", "Venta")) cargarVentas();
  }, [ability]);

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(""), 3000);
  };

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await listarVentas();
      setVentas(data);
    } catch (err) {
      console.error(err);
      mostrarError("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const data = await obtenerVenta(id);
      setVentaDetalle(data);
    } catch (err) {
      console.error(err);
      mostrarError("Error al obtener los detalles de la venta");
    }
  };

  const confirmarYEliminar = async () => {
    if (!confirmarEliminar) return;
    setEliminando(true);
    try {
      await eliminarVenta(confirmarEliminar);
      if (ventaDetalle && ventaDetalle.id_venta === confirmarEliminar) {
        setVentaDetalle(null);
      }
      setConfirmarEliminar(null);
      mostrarExito("Venta eliminada y stock restaurado correctamente");
      cargarVentas();
    } catch (err) {
      console.error(err);
      mostrarError(err.response?.data?.message || "Error al eliminar la venta");
      setConfirmarEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!ability.can("read", "Venta")) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 text-[#C8102E] rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#003087]">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2 text-sm">No tienes permisos para ver el historial de ventas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0 animate-fade-in">

      {/* Banner de error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#C8102E] text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Banner de éxito */}
      {exito && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{exito}</span>
          <button onClick={() => setExito("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#C8102E]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Anular venta #{confirmarEliminar}</h3>
                <p className="text-xs text-slate-500 mt-0.5">El stock de los productos se restaurará automáticamente.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarYEliminar}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {eliminando ? "Eliminando..." : "Sí, anular"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!ventaDetalle ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight leading-tight">
                  Historial de Ventas
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  {ventas.length > 0 ? `${ventas.length} ventas registradas` : "Revisa y administra todas las ventas realizadas"}
                </p>
              </div>
            </div>
          </div>

          {/* LISTA */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#003087]" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-800 font-bold text-base">Sin ventas registradas</p>
              <p className="text-slate-500 text-sm mt-1">Aún no hay ventas en el sistema.</p>
            </div>
          ) : (
            <>
              {/* Tabla — visible en sm+ */}
              <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-bold">Nº</th>
                        <th className="px-4 py-3 font-bold">Fecha</th>
                        <th className="px-4 py-3 font-bold hidden lg:table-cell">Vendedor</th>
                        <th className="px-4 py-3 font-bold">Método</th>
                        <th className="px-4 py-3 font-bold text-right">Total</th>
                        <th className="px-4 py-3 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ventas.map((venta) => (
                        <tr key={venta.id_venta} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#003087] text-sm">#{venta.id_venta}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                            {formatearFecha(venta.fecha)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-medium hidden lg:table-cell">
                            {venta.nombre_usuario}
                          </td>
                          <td className="px-4 py-3">
                            {venta.metodo_pago === "efectivo" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
                                <Banknote className="w-3 h-3" /> Efectivo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                <QrCode className="w-3 h-3" /> QR
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-[#C8102E] text-sm whitespace-nowrap">
                            Bs. {Number(venta.total).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => verDetalle(venta.id_venta)}
                                className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white flex items-center justify-center transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {ability.can("delete", "Venta") && (
                                <button
                                  onClick={() => setConfirmarEliminar(venta.id_venta)}
                                  className="w-8 h-8 rounded-lg bg-red-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white flex items-center justify-center transition-colors"
                                  title="Anular venta"
                                >
                                  <Trash2 className="w-4 h-4" />
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

              {/* Cards — mobile */}
              <div className="sm:hidden space-y-3">
                {ventas.map((venta) => (
                  <div
                    key={venta.id_venta}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-[#003087] bg-[#003087]/10 px-2 py-0.5 rounded-full">
                          #{venta.id_venta}
                        </span>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {formatearFecha(venta.fecha)}
                        </p>
                      </div>
                      <span className="font-extrabold text-[#C8102E] text-base">
                        Bs. {Number(venta.total).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {venta.metodo_pago === "efectivo" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
                            <Banknote className="w-3 h-3" /> Efectivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <QrCode className="w-3 h-3" /> QR
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">{venta.nombre_usuario}</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => verDetalle(venta.id_venta)}
                          className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ability.can("delete", "Venta") && (
                          <button
                            onClick={() => setConfirmarEliminar(venta.id_venta)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        /* VISTA DETALLE INLINE */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          {/* Header detalle */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setVentaDetalle(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                title="Volver al historial"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-[#003087] truncate">
                  Venta #{ventaDetalle.id_venta}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {formatearFecha(ventaDetalle.fecha)}
                </p>
              </div>
            </div>

            {ability.can("delete", "Venta") && (
              <button
                onClick={() => setConfirmarEliminar(ventaDetalle.id_venta)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-[#C8102E] text-[#C8102E] hover:text-white rounded-xl text-sm font-bold transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Anular Venta</span>
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {/* Cards: cliente + resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                  <User className="w-3.5 h-3.5 text-[#003087]" /> Cliente
                </h4>
                {ventaDetalle.cliente_ci ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">CI</span>
                      <span className="font-bold text-slate-800">{ventaDetalle.cliente_ci}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Nombre</span>
                      <span className="font-bold text-slate-800">{ventaDetalle.cliente_nombre} {ventaDetalle.cliente_apellido}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Celular</span>
                      <span className="font-bold text-slate-800">{ventaDetalle.cliente_celular || "—"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic">Venta rápida sin cliente</p>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                  <ClipboardList className="w-3.5 h-3.5 text-[#003087]" /> Resumen
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Vendedor</span>
                    <span className="font-bold text-slate-800">{ventaDetalle.nombre_usuario}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500 font-medium">Método de pago</span>
                    {ventaDetalle.metodo_pago === "efectivo" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
                        <Banknote className="w-3 h-3" /> Efectivo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <QrCode className="w-3 h-3" /> QR
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                    <span className="text-slate-800 font-bold text-sm">Total pagado</span>
                    <span className="font-extrabold text-[#C8102E] text-lg">
                      Bs. {Number(ventaDetalle.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos vendidos */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                <Package className="w-4 h-4 text-[#003087]" /> Productos vendidos
              </h4>

              {/* Tabla productos — sm+ */}
              <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-bold">Producto</th>
                        <th className="px-4 py-3 font-bold text-center hidden md:table-cell">Atributos</th>
                        <th className="px-4 py-3 font-bold text-center">Cant.</th>
                        <th className="px-4 py-3 font-bold text-right">Precio</th>
                        <th className="px-4 py-3 font-bold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ventaDetalle.detalles?.map((item) => (
                        <tr key={item.id_detalle} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800 text-sm">{item.nombre_producto}</p>
                            <p className="text-xs text-slate-400">ID: {item.id_producto}</p>
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <div className="flex flex-col items-center gap-0.5 text-xs font-medium text-slate-500">
                              {item.categoria && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />{item.categoria}
                                </span>
                              )}
                              {item.color && (
                                <span className="flex items-center gap-1">
                                  <Palette className="w-3 h-3" />{item.color}
                                </span>
                              )}
                              {item.talla && <span>T: {item.talla}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700 text-sm">
                            {item.cantidad}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-700 text-sm whitespace-nowrap">
                            Bs. {Number(item.precio).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800 text-sm whitespace-nowrap">
                            Bs. {(Number(item.cantidad) * Number(item.precio)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards productos — mobile */}
              <div className="sm:hidden space-y-3">
                {ventaDetalle.detalles?.map((item) => (
                  <div key={item.id_detalle} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.nombre_producto}</p>
                        {(item.color || item.talla || item.categoria) && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {[item.categoria, item.color, item.talla && `T:${item.talla}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                        x{item.cantidad}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Bs. {Number(item.precio).toFixed(2)} c/u</span>
                      <span className="font-bold text-slate-800">
                        Bs. {(Number(item.cantidad) * Number(item.precio)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        `
      }} />
    </div>
  );
};

export default VentasLista;
