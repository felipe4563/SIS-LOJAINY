import { useEffect, useState } from "react";
import ReporteVentasPDF from "../pages/Reporte/ReportesVentasPDF";
import { obtenerReporteVentas } from "../services/reporte";
import { obtenerUsuarios } from "../services/usuario";
import {
  Search,
  FileDown,
  ShoppingBag,
  DollarSign,
  Users,
  Award,
  Banknote,
  QrCode,
  Package,
  Calendar,
  TrendingUp,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────
const hoy = new Date();
const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];
const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split("T")[0];

const fmtBs = (v) =>
  "Bs " + Number(v || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtFecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtHora = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

// ── Derivar estadísticas de prendas ───────────────────────
const calcularTopPrendas = (ventas) => {
  const stats = {};
  ventas.forEach((v) => {
    v.productos.forEach((p) => {
      if (!stats[p.producto]) {
        stats[p.producto] = { nombre: p.producto, cantidad: 0, total: 0, vendedores: {} };
      }
      stats[p.producto].cantidad += Number(p.cantidad);
      stats[p.producto].total   += Number(p.precio) * Number(p.cantidad);
      stats[p.producto].vendedores[v.vendedor] =
        (stats[p.producto].vendedores[v.vendedor] || 0) + Number(p.cantidad);
    });
  });
  return Object.values(stats).sort((a, b) => b.cantidad - a.cantidad);
};

// ── Sub-components ─────────────────────────────────────────
const StatCard = ({ label, value, sub, Icon, accent, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div className={`h-1 w-full ${accent}`} />
    <div className="p-4 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-800 mt-1.5 leading-none truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>}
      </div>
      <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
  </div>
);

const Label = ({ children }) => (
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

const InputField = ({ children }) => (
  <div className="[&>select]:w-full [&>select]:border [&>select]:border-slate-200 [&>select]:rounded-xl [&>select]:px-3 [&>select]:py-2.5 [&>select]:text-sm [&>select]:text-slate-700 [&>select]:bg-white [&>select]:focus:outline-none [&>select]:focus:ring-2 [&>select]:focus:ring-[#003087]/20 [&>select]:focus:border-[#003087] [&>select]:transition-colors [&>input]:w-full [&>input]:border [&>input]:border-slate-200 [&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-sm [&>input]:text-slate-700 [&>input]:focus:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-[#003087]/20 [&>input]:focus:border-[#003087] [&>input]:transition-colors">
    {children}
  </div>
);

const MetodoBadge = ({ metodo }) => {
  const styles = {
    efectivo: "bg-green-50 text-green-700 border border-green-100",
    qr:       "bg-blue-50 text-[#003087] border border-blue-100",
  };
  const icons = { efectivo: <Banknote size={11} />, qr: <QrCode size={11} /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[metodo] || "bg-slate-100 text-slate-500"}`}>
      {icons[metodo]} {metodo}
    </span>
  );
};

// ── Main ───────────────────────────────────────────────────
const Reportes = () => {
  const [ventas, setVentas]         = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtros, setFiltros]       = useState({
    metodo_pago:  "",
    id_usuario:   "",
    fecha_inicio: primerDia,
    fecha_fin:    ultimoDia,
  });

  const cargarReporte = async (params) => {
    try {
      setLoading(true);
      const { data } = await obtenerReporteVentas(params);
      setVentas(data);
    } catch (e) {
      console.error("Error al cargar reporte", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [rRes, uRes] = await Promise.all([
          obtenerReporteVentas({ metodo_pago: null, id_usuario: null, fecha_inicio: primerDia, fecha_fin: ultimoDia }),
          obtenerUsuarios(),
        ]);
        setVentas(rRes.data);
        setUsuarios(uRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const buscar = () =>
    cargarReporte({
      metodo_pago:  filtros.metodo_pago  || null,
      id_usuario:   filtros.id_usuario   || null,
      fecha_inicio: filtros.fecha_inicio,
      fecha_fin:    filtros.fecha_fin,
    });

  // ── Filtro de producto (client-side) ──────────────────
  const productosUnicos = [...new Set(
    ventas.flatMap((v) => v.productos.map((p) => p.producto))
  )].sort();

  const ventasFiltradas = filtroProducto
    ? ventas
        .map((v) => ({ ...v, productos: v.productos.filter((p) => p.producto === filtroProducto) }))
        .filter((v) => v.productos.length > 0)
    : ventas;

  // ── Derived stats ──────────────────────────────────────
  const totalGeneral    = ventasFiltradas.reduce((a, v) => a + Number(v.total || 0), 0);
  const totalProductos  = ventasFiltradas.reduce((a, v) => a + v.productos.length, 0);
  const topPrendas      = calcularTopPrendas(ventasFiltradas);
  const topPrenda       = topPrendas[0] || null;
  const topVendedorPrenda = topPrenda
    ? Object.entries(topPrenda.vendedores).sort((a, b) => b[1] - a[1])[0]
    : null;

  const vendedoresUnicos = new Set(ventasFiltradas.map((v) => v.vendedor)).size;

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reportes de Ventas</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {fmtFecha(filtros.fecha_inicio)} — {fmtFecha(filtros.fecha_fin)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
          <Calendar size={14} />
          <span>{ventasFiltradas.length} ventas encontradas</span>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total General"
          value={fmtBs(totalGeneral)}
          Icon={DollarSign}
          accent="bg-[#FFCD00]"
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
        />
        <StatCard
          label="Nº de Ventas"
          value={ventas.length}
          sub={`${totalProductos} productos`}
          Icon={ShoppingBag}
          accent="bg-[#003087]"
          iconBg="bg-blue-50"
          iconColor="text-[#003087]"
        />
        <StatCard
          label="Vendedores"
          value={vendedoresUnicos}
          sub="activos en el período"
          Icon={Users}
          accent="bg-[#C8102E]"
          iconBg="bg-red-50"
          iconColor="text-[#C8102E]"
        />
        <StatCard
          label="Prenda Líder"
          value={topPrenda ? topPrenda.cantidad + " uds." : "—"}
          sub={topPrenda ? topPrenda.nombre : "Sin ventas"}
          Icon={TrendingUp}
          accent="bg-slate-700"
          iconBg="bg-slate-50"
          iconColor="text-slate-500"
        />
      </div>

      {/* ── Prenda más vendida ─────────────────────────── */}
      {topPrenda && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#FFCD00] via-[#003087] to-[#C8102E]" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[#FFCD00]">
                <Award size={15} className="text-[#003087]" />
              </div>
              <h2 className="font-bold text-slate-700 text-sm">Prenda Más Vendida</h2>
              <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                En el período seleccionado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prenda principal */}
              <div className="md:col-span-1 bg-[#003087] rounded-xl p-4 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                      #1 Más Vendida
                    </p>
                    <p className="font-black text-lg leading-tight truncate">{topPrenda.nombre}</p>
                    <p className="text-[#FFCD00] font-black text-2xl mt-2">{topPrenda.cantidad} <span className="text-sm font-semibold text-white/70">unidades</span></p>
                    <p className="text-white/60 text-xs mt-1">{fmtBs(topPrenda.total)} facturado</p>
                  </div>
                  <div className="bg-[#FFCD00] p-2 rounded-lg shrink-0">
                    <Package size={20} className="text-[#003087]" />
                  </div>
                </div>
              </div>

              {/* Top vendedores de esa prenda */}
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Quién la vendió más
                </p>
                <div className="space-y-2">
                  {Object.entries(topPrenda.vendedores)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([vendedor, qty], i) => {
                      const pct = Math.round((qty / topPrenda.cantidad) * 100);
                      const isTop = i === 0;
                      return (
                        <div key={vendedor} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${isTop ? "bg-[#FFCD00] text-[#003087]" : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold truncate ${isTop ? "text-slate-800" : "text-slate-600"}`}>
                                {vendedor}
                              </span>
                              <span className="text-xs font-bold text-slate-500 ml-2 shrink-0">{qty} uds · {pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isTop ? "bg-[#003087]" : "bg-slate-300"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Top 5 prendas tabla compacta */}
            {topPrendas.length > 1 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Ranking de Prendas
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {topPrendas.slice(0, 6).map((prenda, i) => (
                    <div key={prenda.nombre} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                      <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${i === 0 ? "bg-[#FFCD00] text-[#003087]" : "bg-slate-200 text-slate-500"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">{prenda.nombre}</p>
                        <p className="text-[10px] text-slate-400">{prenda.cantidad} uds · {fmtBs(prenda.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Filters + Table ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Filter panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-[#003087]">
                <Search size={14} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Filtros</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Método de Pago</Label>
                <InputField>
                  <select value={filtros.metodo_pago} onChange={(e) => setFiltros({ ...filtros, metodo_pago: e.target.value })}>
                    <option value="">Todos</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="qr">QR</option>
                  </select>
                </InputField>
              </div>

              <div>
                <Label>Vendedor</Label>
                <InputField>
                  <select value={filtros.id_usuario} onChange={(e) => setFiltros({ ...filtros, id_usuario: e.target.value })}>
                    <option value="">Todos</option>
                    {usuarios.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre} {u.apellido}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>

              <div>
                <Label>Producto</Label>
                <InputField>
                  <select
                    value={filtroProducto}
                    onChange={(e) => setFiltroProducto(e.target.value)}
                  >
                    <option value="">Todos los productos</option>
                    {productosUnicos.map((nombre) => (
                      <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                  </select>
                </InputField>
              </div>

              <div>
                <Label>Fecha Inicio</Label>
                <InputField>
                  <input type="date" value={filtros.fecha_inicio} onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
                </InputField>
              </div>

              <div>
                <Label>Fecha Fin</Label>
                <InputField>
                  <input type="date" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
                </InputField>
              </div>

              <button
                onClick={buscar}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#002266] disabled:opacity-60 text-white font-bold rounded-xl py-2.5 text-sm transition-colors"
              >
                <Search size={15} />
                Buscar
              </button>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Exportar</p>
                <div className="[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:gap-2 [&>button]:bg-[#C8102E] [&>button]:hover:bg-red-700 [&>button]:text-white [&>button]:font-bold [&>button]:rounded-xl [&>button]:py-2.5 [&>button]:text-sm [&>button]:transition-colors">
                  <ReporteVentasPDF
                    ventas={ventas}
                    filtros={{
                      metodo_pago: filtros.metodo_pago,
                      vendedor: usuarios.find((u) => u.id_usuario == filtros.id_usuario)?.nombre || "",
                      fecha_inicio: filtros.fecha_inicio,
                      fecha_fin: filtros.fecha_fin,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm">Detalle de Ventas</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {ventasFiltradas.length} resultados
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#003087] border-r-[#FFCD00] border-b-[#C8102E] border-l-transparent animate-spin" />
                </div>
                <p className="text-sm text-slate-400">Cargando reporte…</p>
              </div>
            ) : ventasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                <Package size={40} strokeWidth={1.5} />
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-400">Sin resultados</p>
                  <p className="text-xs text-slate-300">Intenta con otros filtros de búsqueda</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["Fecha", "Vendedor", "Prenda", "Método", "Subtotal", "Total Venta"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ventasFiltradas.map((v) =>
                        v.productos.map((p, idx) => (
                          <tr
                            key={`${v.id_venta}-${idx}`}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            {idx === 0 && (
                              <td rowSpan={v.productos.length} className="px-4 py-3 border-l-2 border-transparent align-top">
                                <p className="font-semibold text-slate-700 whitespace-nowrap">{fmtFecha(v.fecha)}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{fmtHora(v.fecha)}</p>
                              </td>
                            )}
                            {idx === 0 && (
                              <td rowSpan={v.productos.length} className="px-4 py-3 align-top">
                                <p className="font-semibold text-slate-700 whitespace-nowrap">{v.vendedor}</p>
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-700">{p.producto}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {p.cantidad} × {fmtBs(p.precio)}
                              </p>
                            </td>
                            {idx === 0 && (
                              <td rowSpan={v.productos.length} className="px-4 py-3 align-top">
                                <MetodoBadge metodo={v.metodo_pago} />
                              </td>
                            )}
                            <td className="px-4 py-3 text-right font-semibold text-slate-600 whitespace-nowrap">
                              {fmtBs(Number(p.precio) * Number(p.cantidad))}
                            </td>
                            {idx === 0 && (
                              <td rowSpan={v.productos.length} className="px-4 py-3 text-right align-top">
                                <span className="font-black text-[#003087] whitespace-nowrap">{fmtBs(v.total)}</span>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer total */}
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-semibold">
                    {ventasFiltradas.length} ventas · {totalProductos} productos
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Total General</span>
                    <span className="text-base font-black text-[#003087]">{fmtBs(totalGeneral)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
