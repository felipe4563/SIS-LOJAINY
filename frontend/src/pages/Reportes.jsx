import { useEffect, useState } from "react";
import ReporteVentasPDF from "../pages/Reporte/ReportesVentasPDF";
import { obtenerReporteVentas } from "../services/reporte";
import { obtenerUsuarios } from "../services/usuario";
import { 
  FiFilter, 
  FiDownload, 
  FiCalendar, 
  FiUser, 
  FiCreditCard, 
  FiSearch,
  FiLoader,
  FiRefreshCw,
  FiAlertCircle
} from "react-icons/fi";
import { MdOutlineAttachMoney } from "react-icons/md";

const Reportes = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // 🔁 función reutilizable
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

  // 🚀 AL ENTRAR AL COMPONENTE
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

  const resetFiltros = () => {
    setFiltros({
      metodo_pago: "",
      id_usuario: "",
      fecha_inicio: primerDiaMes,
      fecha_fin: ultimoDiaMes
    });
    cargarReporte({
      metodo_pago: null,
      id_usuario: null,
      fecha_inicio: primerDiaMes,
      fecha_fin: ultimoDiaMes
    });
  };

  // 💰 total general
  const totalGeneral = ventas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <MdOutlineAttachMoney className="text-green-500" />
              Reporte de Ventas
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Visualiza y gestiona todas las transacciones del sistema
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetFiltros}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FiRefreshCw />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
            
            <div className="relative">
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

      {/* 🔎 FILTROS - Versión Mejorada */}
      <div className="mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header de filtros para móvil */}
          <div 
            className="md:hidden flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <div className="flex items-center gap-2">
              <FiFilter className="text-blue-500" />
              <span className="font-medium">Filtros de Búsqueda</span>
            </div>
            <FiFilter className={`transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Contenido de filtros */}
          <div className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Método de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiCreditCard />
                    Método de Pago
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    value={filtros.metodo_pago}
                    onChange={(e) =>
                      setFiltros({ ...filtros, metodo_pago: e.target.value })
                    }
                  >
                    <option value="">Todos los métodos</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="qr">QR</option>
                  </select>
                </div>

                {/* Vendedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUser />
                    Vendedor
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
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

                {/* Fecha Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiCalendar />
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    value={filtros.fecha_inicio}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fecha_inicio: e.target.value })
                    }
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiCalendar />
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    value={filtros.fecha_fin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fecha_fin: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Botón Buscar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={buscarReporte}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiSearch />
                  )}
                  {loading ? "Buscando..." : "Buscar Reporte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN ESTADÍSTICO */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-800">Bs {totalGeneral.toFixed(2)}</p>
            </div>
            <MdOutlineAttachMoney className="text-3xl text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transacciones</p>
              <p className="text-2xl font-bold text-gray-800">{ventas.length}</p>
            </div>
            <FiCreditCard className="text-3xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vendedores</p>
              <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
            </div>
            <FiUser className="text-3xl text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Periodo</p>
              <p className="text-lg font-bold text-gray-800">
                {filtros.fecha_inicio} al {filtros.fecha_fin}
              </p>
            </div>
            <FiCalendar className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* 📋 TABLA - Versión Responsiva */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700 border-b">Fecha</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b hidden sm:table-cell">Vendedor</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b">Producto</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b hidden md:table-cell">Método</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b">Precio</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiLoader className="text-4xl text-blue-500 animate-spin mb-4" />
                      <p className="text-gray-600">Cargando datos del reporte...</p>
                    </div>
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiAlertCircle className="text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-600">No se encontraron ventas</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Intenta con otros filtros de búsqueda
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                ventas.map((v, index) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="p-4 border-b">
                      <div className="font-medium">
                        {new Date(v.fecha).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 sm:hidden">
                        {v.vendedor}
                      </div>
                    </td>
                    <td className="p-4 border-b hidden sm:table-cell">
                      {v.vendedor}
                    </td>
                    <td className="p-4 border-b">
                      <div className="font-medium">{v.producto}</div>
                      <div className="text-sm text-gray-500 md:hidden">
                        Método: {v.metodo_pago.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 border-b hidden md:table-cell">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        v.metodo_pago === 'efectivo' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {v.metodo_pago.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 border-b font-medium">
                      Bs {Number(v.precio).toFixed(2)}
                    </td>
                    <td className="p-4 border-b">
                      <div className="font-bold text-green-700">
                        Bs {Number(v.total).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 💰 TOTAL Y PIE */}
        <div className="bg-gray-50 border-t">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-lg font-bold text-gray-800">
              Total General: <span className="text-green-600">Bs {totalGeneral.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {ventas.length} {ventas.length === 1 ? 'transacción' : 'transacciones'}
            </div>
          </div>
        </div>
      </div>

      {/* INSTRUCCIONES PARA MÓVIL */}
      <div className="mt-6 md:hidden text-center text-sm text-gray-500">
        <p>💡 Desliza horizontalmente para ver más columnas</p>
      </div>
    </div>
  );
};

export default Reportes;