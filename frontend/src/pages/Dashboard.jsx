import { useEffect, useState, useCallback } from "react";
import {
  obtenerVentasPorRango,
  obtenerVentasPorVendedor,
  obtenerProductosMasVendidos,
  obtenerResumenInventario,
} from "../services/Dashboard";
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
  ArcElement,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ShoppingBag,
  PieChart,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler
);

// ── Brand palette ──────────────────────────────────────────
const C = {
  navy:        "#003087",
  navyMid:     "#0044BB",
  navyLight:   "rgba(0,48,135,0.10)",
  navySolid:   "rgba(0,48,135,0.80)",
  yellow:      "#FFCD00",
  yellowLight: "rgba(255,205,0,0.15)",
  red:         "#C8102E",
  redLight:    "rgba(200,16,46,0.12)",
};

const CHART_PALETTE = [
  "rgba(0,48,135,0.80)",
  "rgba(255,205,0,0.85)",
  "rgba(200,16,46,0.75)",
  "rgba(0,68,187,0.70)",
  "rgba(230,168,0,0.80)",
  "rgba(21,101,192,0.75)",
  "rgba(245,127,23,0.80)",
  "rgba(0,100,180,0.70)",
];

const PERIODS = [
  { key: "hoy",    label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes",    label: "Mes" },
  { key: "año",   label: "Año" },
];

// ── Helpers ────────────────────────────────────────────────
const fmtBs = (v) =>
  "Bs " + Number(v || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const generarFechas = (filtro) => {
  const hoy = new Date();
  switch (filtro) {
    case "hoy":
      return { inicio: format(hoy, "yyyy-MM-dd"), fin: format(hoy, "yyyy-MM-dd") };
    case "semana": {
      const s = new Date(hoy); s.setDate(hoy.getDate() - hoy.getDay());
      const e = new Date(s);   e.setDate(s.getDate() + 6);
      return { inicio: format(s, "yyyy-MM-dd"), fin: format(e, "yyyy-MM-dd") };
    }
    case "mes":
      return {
        inicio: format(new Date(hoy.getFullYear(), hoy.getMonth(), 1), "yyyy-MM-dd"),
        fin:    format(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0), "yyyy-MM-dd"),
      };
    case "año":
      return {
        inicio: format(new Date(hoy.getFullYear(), 0, 1), "yyyy-MM-dd"),
        fin:    format(new Date(hoy.getFullYear(), 11, 31), "yyyy-MM-dd"),
      };
    default:
      return { inicio: format(hoy, "yyyy-MM-dd"), fin: format(hoy, "yyyy-MM-dd") };
  }
};

// ── Sub-components ─────────────────────────────────────────
const StatCard = ({ label, value, Icon, accentClass, iconBg, iconColor }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden`}>
    <div className={`h-1 w-full ${accentClass}`} />
    <div className="p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-2 leading-none truncate">{value}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, badge, badgeClass, Icon, iconColor, children, empty, emptyText }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-50">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${iconColor}`}>
          <Icon size={16} className="text-white" />
        </div>
        <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${badgeClass}`}>
          {badge}
        </span>
      )}
    </div>
    <div className="flex-1 p-5">
      {empty ? (
        <div className="h-60 flex flex-col items-center justify-center gap-2 text-slate-300">
          <Package size={32} strokeWidth={1.5} />
          <p className="text-sm text-slate-400">{emptyText || "Sin datos disponibles"}</p>
        </div>
      ) : children}
    </div>
  </div>
);

const commonOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.82)",
      titleFont: { size: 12, weight: "bold" },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 11 }, color: "#94a3b8" },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.04)" },
      border: { display: false, dash: [4, 4] },
      ticks: {
        font: { size: 11 },
        color: "#94a3b8",
        callback: (v) => "Bs " + v.toLocaleString("es-ES"),
      },
    },
  },
};

// ── Main component ─────────────────────────────────────────
const Dashboard = () => {
  const [ventasRango, setVentasRango]           = useState([]);
  const [ventasVendedor, setVentasVendedor]     = useState([]);
  const [categorias, setCategorias]             = useState([]);
  const [inventario, setInventario]             = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [filtro, setFiltro]                     = useState("mes");
  const [error, setError]                       = useState(null);

  const cargarDatos = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      const { inicio, fin } = generarFechas(f);
      const [rango, vendedor, cats, inv] = await Promise.all([
        obtenerVentasPorRango({ fecha_inicio: inicio, fecha_fin: fin }),
        obtenerVentasPorVendedor(),
        obtenerProductosMasVendidos(),
        obtenerResumenInventario(),
      ]);
      setVentasRango(rango.data);
      setVentasVendedor(vendedor.data);
      setCategorias(cats.data);
      setInventario(inv.data);
    } catch {
      setError("Error al cargar los datos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(filtro); }, [cargarDatos, filtro]);

  // ── Chart data ───────────────────────────────────────────
  const lineData = {
    labels: ventasRango.map((v) => format(new Date(v.fecha), "dd MMM", { locale: es })),
    datasets: [{
      label: "Ventas (Bs)",
      data: ventasRango.map((v) => v.total),
      borderColor: C.navy,
      backgroundColor: C.navyLight,
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: C.navy,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const barData = {
    labels: ventasVendedor.slice(0, 8).map((v) => v.vendedor),
    datasets: [{
      label: "Total (Bs)",
      data: ventasVendedor.slice(0, 8).map((v) => v.total_ventas || 0),
      backgroundColor: CHART_PALETTE,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels: categorias.slice(0, 8).map((c) => c.categoria),
    datasets: [{
      data: categorias.slice(0, 8).map((c) => c.total_vendido),
      backgroundColor: CHART_PALETTE,
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 6,
    }],
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          padding: 12,
          font: { size: 11 },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.82)",
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#003087] border-r-[#FFCD00] border-b-[#C8102E] border-l-transparent animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-400">Cargando dashboard…</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Resumen de ventas e inventario</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                filtro === key
                  ? "bg-[#003087] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between gap-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
          <button
            onClick={() => cargarDatos(filtro)}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Valor Inventario"
          value={fmtBs(inventario?.valor_total)}
          Icon={DollarSign}
          accentClass="bg-[#FFCD00]"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
        />
        <StatCard
          label="Total Productos"
          value={(inventario?.total_productos || 0).toLocaleString("es-ES")}
          Icon={Package}
          accentClass="bg-[#003087]"
          iconBg="bg-blue-50"
          iconColor="text-[#003087]"
        />
        <StatCard
          label="Vendedores"
          value={ventasVendedor.length}
          Icon={Users}
          accentClass="bg-[#C8102E]"
          iconBg="bg-red-50"
          iconColor="text-[#C8102E]"
        />
        <StatCard
          label="Categorías"
          value={categorias.length}
          Icon={ShoppingBag}
          accentClass="bg-slate-700"
          iconBg="bg-slate-50"
          iconColor="text-slate-500"
        />
      </div>

      {/* ── Charts row 1 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Ventas por Fecha"
          badge={PERIODS.find(p => p.key === filtro)?.label}
          badgeClass="bg-blue-50 text-[#003087]"
          Icon={TrendingUp}
          iconColor="bg-[#003087]"
          empty={ventasRango.length === 0}
          emptyText="Sin ventas en este período"
        >
          <div className="h-64">
            <Line data={lineData} options={commonOpts} />
          </div>
        </ChartCard>

        <ChartCard
          title="Top Vendedores"
          badge={`Top ${Math.min(ventasVendedor.length, 8)}`}
          badgeClass="bg-red-50 text-[#C8102E]"
          Icon={Users}
          iconColor="bg-[#C8102E]"
          empty={ventasVendedor.length === 0}
          emptyText="Sin datos de vendedores"
        >
          <div className="h-64">
            <Bar data={barData} options={commonOpts} />
          </div>
        </ChartCard>
      </div>

      {/* ── Charts row 2 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Doughnut – 2 cols */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Por Categoría"
            badge="Distribución"
            badgeClass="bg-green-50 text-green-700"
            Icon={PieChart}
            iconColor="bg-green-600"
            empty={categorias.length === 0}
            emptyText="Sin datos"
          >
            <div className="h-64">
              <Doughnut data={doughnutData} options={doughnutOpts} />
            </div>
          </ChartCard>
        </div>

        {/* Table – 3 cols */}
        <div className="lg:col-span-3">
          <ChartCard
            title="Categorías Más Vendidas"
            badge={`${categorias.length} total`}
            badgeClass="bg-orange-50 text-orange-600"
            Icon={ShoppingBag}
            iconColor="bg-orange-500"
            empty={categorias.length === 0}
            emptyText="Sin ventas registradas"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                    <th className="text-left pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
                    <th className="text-right pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uds.</th>
                    <th className="text-right pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categorias.slice(0, 6).map((cat, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-3">
                        <span
                          className="inline-flex w-5 h-5 rounded-md items-center justify-center text-white text-[10px] font-black"
                          style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length].replace(/,[\d.]+\)$/, ",0.9)") }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-700">
                          {cat.categoria.length > 22 ? cat.categoria.slice(0, 22) + "…" : cat.categoria}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-500">
                        {Number(cat.cantidad_vendida).toLocaleString("es-ES")}
                      </td>
                      <td className="py-3 text-right font-black text-[#003087]">
                        {fmtBs(cat.total_vendido)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categorias.length > 6 && (
                <p className="text-center text-xs text-slate-400 pt-4 border-t border-slate-50 mt-2">
                  Mostrando 6 de {categorias.length} categorías
                </p>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
