import { useEffect, useState, useCallback } from "react";
import {
  obtenerVentasPorRango,
  obtenerVentasPorVendedor,
  obtenerProductosMasVendidos,
  obtenerResumenInventario
} from "../services/dashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Calendar, DollarSign, Package, Users, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [ventasRango, setVentasRango] = useState([]);
  const [ventasVendedor, setVentasVendedor] = useState([]);
  const [categoriasMasVendidas, setCategoriasMasVendidas] = useState([]);
  const [inventario, setInventario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState("mes");
  const [error, setError] = useState(null);

  // Generar fechas según filtro
  const generarFechas = (filtro) => {
    const hoy = new Date();
    let inicio, fin;

    switch (filtro) {
      case "hoy":
        inicio = fin = format(hoy, "yyyy-MM-dd");
        break;
      case "semana":
        inicio = format(new Date(hoy.setDate(hoy.getDate() - hoy.getDay())), "yyyy-MM-dd");
        fin = format(new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6)), "yyyy-MM-dd");
        break;
      case "mes":
        inicio = format(new Date(hoy.getFullYear(), hoy.getMonth(), 1), "yyyy-MM-dd");
        fin = format(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0), "yyyy-MM-dd");
        break;
      case "año":
        inicio = format(new Date(hoy.getFullYear(), 0, 1), "yyyy-MM-dd");
        fin = format(new Date(hoy.getFullYear(), 11, 31), "yyyy-MM-dd");
        break;
      default:
        inicio = format(new Date(hoy.getFullYear(), hoy.getMonth(), 1), "yyyy-MM-dd");
        fin = format(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0), "yyyy-MM-dd");
    }

    return { inicio, fin };
  };

  // Cargar datos
  const cargarDatos = useCallback(async (filtro = "mes") => {
    setLoading(true);
    setError(null);
    
    try {
      const { inicio, fin } = generarFechas(filtro);

      const [rango, vendedor, categorias, inv] = await Promise.all([
        obtenerVentasPorRango({ fecha_inicio: inicio, fecha_fin: fin }),
        obtenerVentasPorVendedor(),
        obtenerProductosMasVendidos(),
        obtenerResumenInventario()
      ]);

      setVentasRango(rango.data);
      setVentasVendedor(vendedor.data);
      setCategoriasMasVendidas(categorias.data);
      setInventario(inv.data);
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
      setError("Error al cargar los datos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos(filtroFecha);
  }, [cargarDatos, filtroFecha]);

  // Estilos y colores
  const colores = {
    primario: "rgba(59, 130, 246, 0.7)",
    secundario: "rgba(249, 115, 22, 0.7)",
    exito: "rgba(34, 197, 94, 0.7)",
    peligro: "rgba(239, 68, 68, 0.7)",
    info: "rgba(6, 182, 212, 0.7)",
    advertencia: "rgba(245, 158, 11, 0.7)",
    gris: "rgba(156, 163, 175, 0.7)"
  };

  const coloresCategorias = Object.values(colores);

  // Gráfico de ventas por rango
  const datosVentasRango = {
    labels: ventasRango.map(v => format(new Date(v.fecha), "dd MMM", { locale: es })),
    datasets: [
      {
        label: "Total Ventas (Bs)",
        data: ventasRango.map(v => v.total),
        borderColor: colores.primario,
        backgroundColor: colores.primario.replace("0.7", "0.1"),
        tension: 0.4,
        fill: true,
        borderWidth: 2
      }
    ]
  };

  // Gráfico de ventas por vendedor
  const datosVentasVendedor = {
    labels: ventasVendedor.slice(0, 8).map(v => v.vendedor),
    datasets: [
      {
        label: "Total Ventas (Bs)",
        data: ventasVendedor.slice(0, 8).map(v => v.total_ventas || 0),
        backgroundColor: [colores.primario, colores.secundario, colores.exito, colores.info, colores.advertencia],
        borderRadius: 4
      }
    ]
  };

  // Gráfico de categorías
  const datosCategorias = {
    labels: categoriasMasVendidas.slice(0, 8).map(c => c.categoria),
    datasets: [
      {
        label: "Total Vendido (Bs)",
        data: categoriasMasVendidas.slice(0, 8).map(c => c.total_vendido),
        backgroundColor: coloresCategorias,
        borderWidth: 1
      }
    ]
  };

  // Opciones para gráficos responsivos
  const opcionesComunes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 11
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 11
          },
          callback: function(value) {
            return 'Bs ' + value.toLocaleString('es-ES');
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">📊 Dashboard de Ventas</h1>
            <p className="text-gray-600 mt-1">Resumen completo de ventas e inventario</p>
          </div>
          
          {/* Filtros de fecha */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select 
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="año">Este año</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => cargarDatos(filtroFecha)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                Bs {inventario?.valor_total ? Number(inventario.valor_total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {inventario?.total_productos || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendedores Activos</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {ventasVendedor.length || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categorías</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {categoriasMasVendidas.length || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <PieChart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ventas por fecha */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Ventas por Fecha</h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {filtroFecha.charAt(0).toUpperCase() + filtroFecha.slice(1)}
            </span>
          </div>
          <div className="h-64 md:h-72">
            {ventasRango.length > 0 ? (
              <Line 
                data={datosVentasRango} 
                options={{
                  ...opcionesComunes,
                  plugins: {
                    ...opcionesComunes.plugins,
                    legend: { display: false }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">No hay datos de ventas para este período</p>
              </div>
            )}
          </div>
        </div>

        {/* Ventas por vendedor */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Top Vendedores</h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              Top {Math.min(ventasVendedor.length, 8)}
            </span>
          </div>
          <div className="h-64 md:h-72">
            {ventasVendedor.length > 0 ? (
              <Bar 
                data={datosVentasVendedor} 
                options={{
                  ...opcionesComunes,
                  plugins: {
                    ...opcionesComunes.plugins,
                    legend: { display: false }
                  },
                  indexAxis: window.innerWidth < 768 ? 'y' : 'x'
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">No hay datos de vendedores</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categorías y tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribución por categoría */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Distribución por Categoría</h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Por valor
            </span>
          </div>
          <div className="h-64 md:h-72">
            {categoriasMasVendidas.length > 0 ? (
              <Doughnut 
                data={datosCategorias} 
                options={{
                  ...opcionesComunes,
                  plugins: {
                    ...opcionesComunes.plugins,
                    legend: {
                      position: window.innerWidth < 768 ? 'bottom' : 'right',
                      labels: {
                        boxWidth: 10,
                        padding: 10
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">No hay datos de categorías</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de categorías */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Categorías Más Vendidas</h3>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
              Top {categoriasMasVendidas.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoriasMasVendidas.slice(0, 5).map((categoria, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: coloresCategorias[index % coloresCategorias.length] }}
                        />
                        <span className="font-medium text-gray-900 text-sm">
                          {categoria.categoria.length > 20 ? categoria.categoria.substring(0, 20) + '...' : categoria.categoria}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-medium text-gray-900">
                        {categoria.cantidad_vendida.toLocaleString('es-ES')}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-bold text-blue-700">
                        Bs {Number(categoria.total_vendido || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categoriasMasVendidas.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Mostrando 5 de {categoriasMasVendidas.length} categorías
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;