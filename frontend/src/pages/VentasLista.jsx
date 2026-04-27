import React, { useState, useEffect, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import { listarVentas, obtenerVenta, eliminarVenta } from "../services/venta";

const VentasLista = () => {
  const ability = useContext(AbilityContext);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null); // Para la vista inline de detalle

  useEffect(() => {
    if (ability.can("read", "Venta")) {
      cargarVentas();
    }
  }, [ability]);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await listarVentas();
      setVentas(data);
    } catch (err) {
      console.error(err);
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
      alert("Error al obtener los detalles de la venta");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta venta? El stock de los productos se restaurará automáticamente.")) {
      return;
    }
    try {
      await eliminarVenta(id);
      if (ventaDetalle && ventaDetalle.id_venta === id) {
        setVentaDetalle(null); // Cerrar vista inline si estaba abierta
      }
      cargarVentas();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al eliminar la venta");
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!ability.can("read", "Venta")) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2">No tienes permisos para ver el historial de ventas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-0">
      {!ventaDetalle ? (
        <>
          {/* Header de la sección */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight">Historial de Ventas</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Revisa y administra todas las ventas realizadas.</p>
            </div>
          </div>

          {/* LISTA DE VENTAS */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#003087]"></div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold">Nº Venta</th>
                      <th className="p-4 font-bold">Fecha</th>
                      <th className="p-4 font-bold">Usuario</th>
                      <th className="p-4 font-bold">Método de Pago</th>
                      <th className="p-4 font-bold text-right">Total</th>
                      <th className="p-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ventas.map((venta) => (
                      <tr key={venta.id_venta} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-[#003087]">#{venta.id_venta}</td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{formatearFecha(venta.fecha)}</td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{venta.nombre_usuario}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            venta.metodo_pago === 'efectivo' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {venta.metodo_pago.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right font-extrabold text-[#C8102E]">
                          Bs. {Number(venta.total).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => verDetalle(venta.id_venta)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                              title="Ver Detalles"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {ability.can("delete", "Venta") && (
                              <button
                                onClick={() => eliminar(venta.id_venta)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                                title="Eliminar Venta"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ventas.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500 bg-slate-50">
                          <span className="block text-3xl mb-2">🛍️</span>
                          <p className="text-sm">No se encontraron ventas registradas.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* VISTA DETALLE DE VENTA (INLINE) */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          {/* Header del detalle */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setVentaDetalle(null)} 
                className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                title="Volver al historial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h3 className="text-xl font-bold text-[#003087]">
                  Detalle de Venta #{ventaDetalle.id_venta}
                </h3>
                <p className="text-sm text-slate-500 font-medium">{formatearFecha(ventaDetalle.fecha)}</p>
              </div>
            </div>
            
            {/* Opcional: Mostrar botón eliminar en el detalle si tiene permiso */}
            {ability.can("delete", "Venta") && (
              <button
                onClick={() => eliminar(ventaDetalle.id_venta)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-sm font-bold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span className="hidden sm:inline">Anular Venta</span>
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Info Venta y Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Información del Cliente</h4>
                {ventaDetalle.cliente_ci ? (
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-slate-500 font-medium">CI:</span> <span className="font-bold text-slate-800">{ventaDetalle.cliente_ci}</span></p>
                    <p className="text-sm"><span className="text-slate-500 font-medium">Nombre:</span> <span className="font-bold text-slate-800">{ventaDetalle.cliente_nombre} {ventaDetalle.cliente_apellido}</span></p>
                    <p className="text-sm"><span className="text-slate-500 font-medium">Celular:</span> <span className="font-bold text-slate-800">{ventaDetalle.cliente_celular || 'No registrado'}</span></p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500 italic">Cliente no registrado (Venta rápida)</p>
                )}
              </div>
              
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Resumen de Venta</h4>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Vendedor:</span> <span className="font-bold text-slate-800">{ventaDetalle.nombre_usuario}</span></p>
                  <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Método de Pago:</span> <span className="font-bold text-slate-800 capitalize">{ventaDetalle.metodo_pago}</span></p>
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="text-base flex justify-between"><span className="text-slate-800 font-bold">Total Pagado:</span> <span className="font-extrabold text-[#C8102E] text-lg">Bs. {Number(ventaDetalle.total).toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos Vendidos */}
            <div>
              <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#003087]"></span>
                Productos Vendidos
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Producto</th>
                        <th className="p-4 font-bold text-center">Atributos</th>
                        <th className="p-4 font-bold text-center">Cantidad</th>
                        <th className="p-4 font-bold text-right">Precio Unit.</th>
                        <th className="p-4 font-bold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ventaDetalle.detalles?.map((item) => (
                        <tr key={item.id_detalle} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{item.nombre_producto}</p>
                            <p className="text-xs text-slate-500 font-medium">ID: {item.id_producto}</p>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1 text-xs font-medium text-slate-600">
                              {item.categoria && <span>Cat: {item.categoria}</span>}
                              <div className="flex gap-2 justify-center">
                                {item.color && <span>Color: {item.color}</span>}
                                {item.talla && <span>Talla: {item.talla}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-700">
                            {item.cantidad}
                          </td>
                          <td className="p-4 text-right font-medium text-slate-700">
                            Bs. {Number(item.precio).toFixed(2)}
                          </td>
                          <td className="p-4 text-right font-bold text-slate-800">
                            Bs. {(Number(item.cantidad) * Number(item.precio)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animación */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default VentasLista;
