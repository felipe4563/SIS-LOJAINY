import { useEffect, useState } from "react";
import ReporteVentasPDF from "../pages/Reporte/ReportesVentasPDF";
import { obtenerReporteVentas } from "../services/reporte";
import { obtenerUsuarios } from "../services/usuario";

const Reportes = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📅 fechas por defecto: mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filtros, setFiltros] = useState({
    metodo_pago: "",
    id_usuario: "",
    fecha_inicio: primerDiaMes,
    fecha_fin: ultimoDiaMes
  });

  // 🔁 cargar reporte
  const cargarReporte = async (params) => {
    try {
      setLoading(true);
      const { data } = await obtenerReporteVentas(params);
      setVentas(data);
    } catch (error) {
      console.error("Error al cargar reporte", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 inicial
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setLoading(true);
        const [reporteRes, usuariosRes] = await Promise.all([
          obtenerReporteVentas({
            metodo_pago: null,
            id_usuario: null,
            fecha_inicio: primerDiaMes,
            fecha_fin: ultimoDiaMes
          }),
          obtenerUsuarios()
        ]);

        setVentas(reporteRes.data);
        setUsuarios(usuariosRes.data);
      } catch (error) {
        console.error("Error inicial de reportes", error);
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, []);

  const buscarReporte = () => {
    cargarReporte({
      metodo_pago: filtros.metodo_pago || null,
      id_usuario: filtros.id_usuario || null,
      fecha_inicio: filtros.fecha_inicio,
      fecha_fin: filtros.fecha_fin
    });
  };

  // 💰 total general (1 vez por venta)
  const totalGeneral = ventas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-blue-50 p-4 md:p-6">
      {/* Encabezado con colores de Colombia */}
      <div className="mb-6 md:mb-8">
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-blue-600 to-red-600 rounded-t-lg"></div>
        <div className="bg-white p-4 md:p-6 rounded-b-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-2 rounded-lg mr-3">
              📊
            </span>
            Reporte de Ventas
          </h1>
          <p className="text-gray-600 mt-2">Visualiza y filtra el historial de ventas de tu negocio</p>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel de filtros */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 border-l-4 border-blue-600 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-2">
                🔍
              </span>
              Filtros de Búsqueda
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filtros.metodo_pago}
                  onChange={(e) =>
                    setFiltros({ ...filtros, metodo_pago: e.target.value })
                  }
                >
                  <option value="">Todos los pagos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="qr">QR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendedor
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filtros.id_usuario}
                  onChange={(e) =>
                    setFiltros({ ...filtros, id_usuario: e.target.value })
                  }
                >
                  <option value="">Todos los vendedores</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} {u.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filtros.fecha_inicio}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fecha_inicio: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={filtros.fecha_fin}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fecha_fin: e.target.value })
                  }
                />
              </div>

              <button
                onClick={buscarReporte}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-lg p-3 hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <span className="mr-2">🔎</span>
                Buscar Reporte
              </button>

              {/* Botón PDF */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Exportar reporte:</div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                  <ReporteVentasPDF
                    ventas={ventas}
                    filtros={{
                      metodo_pago: filtros.metodo_pago,
                      vendedor:
                        usuarios.find(u => u.id_usuario == filtros.id_usuario)
                          ?.nombre || "",
                      fecha_inicio: filtros.fecha_inicio,
                      fecha_fin: filtros.fecha_fin
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="lg:col-span-3">
          {/* Tarjeta de resumen */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Resumen del Reporte</h3>
                <p className="text-blue-100">
                  {new Date(filtros.fecha_inicio).toLocaleDateString()} - {new Date(filtros.fecha_fin).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-center md:text-right">
                <div className="text-3xl font-bold">Bs {totalGeneral.toFixed(2)}</div>
                <div className="text-blue-100">Total General</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-500 bg-opacity-30 p-3 rounded-lg">
                <div className="text-sm">Total Ventas</div>
                <div className="text-lg font-bold">{ventas.length}</div>
              </div>
              <div className="bg-yellow-500 bg-opacity-30 p-3 rounded-lg">
                <div className="text-sm">Productos Vendidos</div>
                <div className="text-lg font-bold">
                  {ventas.reduce((acc, v) => acc + v.productos.length, 0)}
                </div>
              </div>
              <div className="bg-red-500 bg-opacity-30 p-3 rounded-lg">
                <div className="text-sm">Vendedores</div>
                <div className="text-lg font-bold">
                  {new Set(ventas.map(v => v.vendedor)).size}
                </div>
              </div>
            </div>
          </div>

          {/* 📋 TABLA DE RESULTADOS */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg mr-2">
                  📋
                </span>
                Detalle de Ventas
              </h3>
              <div className="text-sm text-gray-500">
                Mostrando {ventas.length} resultados
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Vendedor</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Producto</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Método</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Subtotal</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Total Venta</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                          <div className="text-gray-600">Cargando reporte...</div>
                        </div>
                      </td>
                    </tr>
                  ) : ventas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-4xl mb-4">📭</div>
                          <div className="text-gray-600 text-lg font-medium mb-2">
                            No hay resultados
                          </div>
                          <div className="text-gray-500">
                            Intenta con otros filtros de búsqueda
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ventas.map((v) =>
                      v.productos.map((p, index) => (
                        <tr
                          key={`${v.id_venta}-${index}`}
                          className={`hover:bg-yellow-50 transition-colors ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          {index === 0 && (
                            <td rowSpan={v.productos.length} className="p-4 border-t border-gray-200">
                              <div className="font-medium">{new Date(v.fecha).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(v.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </td>
                          )}

                          {index === 0 && (
                            <td rowSpan={v.productos.length} className="p-4 border-t border-gray-200">
                              <div className="font-medium">{v.vendedor}</div>
                            </td>
                          )}

                          <td className="p-4 border-t border-gray-200">
                            <div className="font-medium">{p.producto}</div>
                            <div className="text-sm text-gray-500">
                              Cantidad: {p.cantidad} × Bs {p.precio.toFixed(2)}
                            </div>
                          </td>

                          {index === 0 && (
                            <td
                              rowSpan={v.productos.length}
                              className="p-4 border-t border-gray-200"
                            >
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                v.metodo_pago === 'efectivo' 
                                  ? 'bg-green-100 text-green-800'
                                  : v.metodo_pago === 'qr'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {v.metodo_pago.toUpperCase()}
                              </span>
                            </td>
                          )}

                          <td className="p-4 border-t border-gray-200 font-medium text-right">
                            Bs {(p.precio * p.cantidad).toFixed(2)}
                          </td>

                          {index === 0 && (
                            <td
                              rowSpan={v.productos.length}
                              className="p-4 border-t border-gray-200 font-bold text-right"
                            >
                              <div className="text-blue-700">Bs {Number(v.total).toFixed(2)}</div>
                            </td>
                          )}
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* 💰 TOTAL AL FINAL */}
            {!loading && ventas.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-5">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="text-gray-600 mb-2 md:mb-0">
                    {ventas.length} ventas procesadas
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    Total General: <span className="text-yellow-600">Bs {totalGeneral.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nota al pie */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>
              Reporte generado con los colores de <span className="font-bold text-yellow-600">Col</span>
              <span className="font-bold text-blue-600">om</span>
              <span className="font-bold text-red-600">bia</span> 🇨🇴
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;