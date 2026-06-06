import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { AbilityContext } from "../context/AbilityContext";
import { AuthContext } from "../context/AuthContext";
import { listarVentas, obtenerVenta, crearVenta, buscarClientePorCI } from "../services/venta";
import { obtenerProducto } from "../services/producto";
import ComprobanteVenta from "../components/ComprobanteVenta";
import {
  ShoppingCart, User, CreditCard, Package, Printer,
  QrCode, Plus, Minus, CheckCircle, Banknote, ClipboardList,
  X, AlertCircle, ShoppingBag, Trash2, UserCheck,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────
const fmtBs = (v) =>
  "Bs " + Number(v || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtFecha = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ── Sub-components ─────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
    {children}{required && <span className="text-[#C8102E] ml-0.5">*</span>}
  </label>
);

const Field = ({ children }) => (
  <div className="[&>input]:w-full [&>input]:border [&>input]:border-slate-200 [&>input]:rounded-xl [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-sm [&>input]:text-slate-700 [&>input]:focus:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-[#003087]/20 [&>input]:focus:border-[#003087] [&>input]:transition-colors">
    {children}
  </div>
);

const MetodoBadge = ({ metodo }) => {
  const styles = {
    efectivo: "bg-green-50 text-green-700 border border-green-100",
    qr: "bg-blue-50 text-[#003087] border border-blue-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[metodo] || "bg-slate-100 text-slate-500"}`}>
      {metodo === "efectivo" ? <Banknote size={10} /> : <QrCode size={10} />}
      {metodo}
    </span>
  );
};

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="text-[10px] font-bold text-[#C8102E] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Sin stock</span>;
  if (stock <= 3) return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">{stock} disponibles</span>;
  return <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">{stock} en stock</span>;
};

// ── Main ───────────────────────────────────────────────────
const Ventas = () => {
  const ability  = useContext(AbilityContext);
  const { usuario } = useContext(AuthContext);

  const [ventas, setVentas]                 = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [procesando, setProcesando]         = useState(false);
  const [productosEnVenta, setProductosEnVenta] = useState([]);
  const [metodoPago, setMetodoPago]         = useState("efectivo");
  const [total, setTotal]                   = useState(0);
  const [cliente, setCliente]               = useState({ ci: "", nombre: "", apellido: "", celular: "" });
  const [qrInput, setQrInput]               = useState("");
  const [error, setError]                   = useState("");
  const [exitoMsg, setExitoMsg]             = useState("");
  const [clienteSugerido, setClienteSugerido] = useState(null);
  const [buscandoCI, setBuscandoCI]         = useState(false);
  const ciTimerRef                          = useRef(null);
  const comprobanteRef                      = useRef();

  useEffect(() => {
    if (ability.can("read", "Venta")) cargarVentas();
  }, [ability]);

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await listarVentas();
      setVentas(data);
    } catch {
      mostrarError("Error al cargar el historial de ventas");
    } finally {
      setLoading(false);
    }
  };

  const verVenta = async (id) => {
    try {
      const data = await obtenerVenta(id);
      setVentaSeleccionada(data);
      setTimeout(() => document.getElementById("panel-comprobante")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      mostrarError("No se pudo obtener el detalle de la venta");
    }
  };

  const extraerIdProducto = (qrText) => {
    try {
      const url = new URL(qrText);
      const partes = url.pathname.split("/").filter(Boolean);
      if (partes.includes("producto")) {
        const id = parseInt(partes[partes.indexOf("producto") + 1]);
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
    if (!textoQR.trim()) return;
    const id_producto = extraerIdProducto(textoQR.trim());
    if (!id_producto) {
      mostrarError("QR inválido: no se pudo extraer un ID de producto");
      return;
    }

    try {
      const producto = await obtenerProducto(id_producto);

      // ── Validación de stock ───────────────────────────
      if (Number(producto.stock) === 0) {
        mostrarError(`"${producto.descripcion}" no tiene stock disponible (agotado)`);
        setQrInput("");
        return;
      }

      const enCarrito = productosEnVenta.find((p) => p.id_producto === id_producto);
      if (enCarrito && enCarrito.cantidad >= Number(producto.stock)) {
        mostrarError(`Solo hay ${producto.stock} unidades disponibles de "${producto.descripcion}"`);
        setQrInput("");
        return;
      }

      setProductosEnVenta((prev) => {
        let nuevos;
        if (enCarrito) {
          nuevos = prev.map((p) =>
            p.id_producto === id_producto ? { ...p, cantidad: p.cantidad + 1 } : p
          );
        } else {
          nuevos = [
            ...prev,
            {
              id_producto: producto.id_producto,
              precio: Number(producto.precio),
              descripcion: producto.descripcion,
              stock: Number(producto.stock),
              cantidad: 1,
            },
          ];
        }
        setTotal(nuevos.reduce((s, p) => s + p.precio * p.cantidad, 0));
        return nuevos;
      });
      setQrInput("");
    } catch {
      mostrarError("No se pudo obtener el producto. Verifique el código QR");
    }
  };

  const cambiarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const prod = productosEnVenta.find((p) => p.id_producto === id_producto);
    if (prod && nuevaCantidad > prod.stock) {
      mostrarError(`Máximo disponible: ${prod.stock} unidades de "${prod.descripcion}"`);
      return;
    }
    const nuevos = productosEnVenta.map((p) =>
      p.id_producto === id_producto ? { ...p, cantidad: nuevaCantidad } : p
    );
    setProductosEnVenta(nuevos);
    setTotal(nuevos.reduce((s, p) => s + p.precio * p.cantidad, 0));
  };

  const eliminarProducto = (id_producto) => {
    const nuevos = productosEnVenta.filter((p) => p.id_producto !== id_producto);
    setProductosEnVenta(nuevos);
    setTotal(nuevos.reduce((s, p) => s + p.precio * p.cantidad, 0));
  };

  const handleCIChange = (valor) => {
    setCliente({ ...cliente, ci: valor });
    setClienteSugerido(null);
    clearTimeout(ciTimerRef.current);
    if (valor.trim().length < 3) { setBuscandoCI(false); return; }
    setBuscandoCI(true);
    ciTimerRef.current = setTimeout(async () => {
      try {
        const data = await buscarClientePorCI(valor.trim());
        setClienteSugerido(data);
      } catch {
        setClienteSugerido(null);
      } finally {
        setBuscandoCI(false);
      }
    }, 400);
  };

  const aplicarSugerencia = () => {
    if (!clienteSugerido) return;
    setCliente({
      ci: clienteSugerido.ci,
      nombre: clienteSugerido.nombre,
      apellido: clienteSugerido.apellido,
      celular: clienteSugerido.celular || "",
    });
    setClienteSugerido(null);
  };

  const confirmarVenta = async () => {
    if (!ability.can("create", "Venta")) {
      mostrarError("No tienes permisos para crear ventas");
      return;
    }
    if (productosEnVenta.length === 0) {
      mostrarError("Agrega al menos un producto a la venta");
      return;
    }
    if (!cliente.ci || !cliente.nombre || !cliente.apellido) {
      mostrarError("Completa los datos obligatorios del cliente: CI, Nombre y Apellido");
      return;
    }

    setProcesando(true);
    try {
      const res = await crearVenta({ metodo_pago: metodoPago, total, detalles: productosEnVenta, cliente });
      setExitoMsg(`Venta #${res.id_venta} registrada exitosamente`);
      setTimeout(() => setExitoMsg(""), 5000);
      await verVenta(res.id_venta);
      setProductosEnVenta([]);
      setMetodoPago("efectivo");
      setTotal(0);
      setCliente({ ci: "", nombre: "", apellido: "", celular: "" });
      setQrInput("");
      cargarVentas();
    } catch {
      mostrarError("Error al registrar la venta. Intenta de nuevo");
    } finally {
      setProcesando(false);
    }
  };

  const imprimirComprobante = () => {
    if (!ventaSeleccionada) return;
    const ventana = window.open("", "_blank");
    ventana.document.write(`<html><head><title>Comprobante #${ventaSeleccionada.id_venta}</title><meta charset="utf-8"/><style>@media print{body{margin:0;padding:20px}}</style></head><body>${comprobanteRef.current.innerHTML}<script>window.onload=function(){window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);
    ventana.document.close();
  };

  const totalItems = productosEnVenta.reduce((s, p) => s + p.cantidad, 0);

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nueva Venta</h1>
          <p className="text-sm text-slate-400 mt-0.5">Escanea los productos y registra la venta</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
          <User size={14} />
          <span>{usuario?.nombre || "Vendedor"}</span>
        </div>
      </div>

      {/* ── Error / Éxito banner ───────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-[#C8102E] px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto shrink-0 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      )}
      {exitoMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle size={16} className="shrink-0" />
          <span>{exitoMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* ── Panel izquierdo: formulario venta ──────── */}
        {ability.can("create", "Venta") && (
          <div className="xl:col-span-3 space-y-4">

            {/* Scanner QR */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-[#003087]" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-[#003087]">
                    <QrCode size={14} className="text-white" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-sm">Escanear Producto</h2>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && agregarProductoQR(qrInput)}
                    placeholder="Pega el código QR o escribe el ID del producto…"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition-colors"
                  />
                  <button
                    onClick={() => agregarProductoQR(qrInput)}
                    className="bg-[#003087] hover:bg-[#002266] text-white px-5 rounded-xl font-bold text-sm transition-colors shrink-0"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-[#FFCD00]" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-[#FFCD00]">
                    <User size={14} className="text-[#003087]" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-sm">Datos del Cliente</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* CI con autocompletado */}
                  <div className="col-span-2 sm:col-span-1">
                    <Label required>CI</Label>
                    <div className="relative">
                      <Field>
                        <input
                          type="text"
                          value={cliente.ci}
                          onChange={(e) => handleCIChange(e.target.value)}
                          placeholder="1234567"
                          autoComplete="off"
                        />
                      </Field>
                      {/* Spinner búsqueda */}
                      {buscandoCI && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 border-t-[#003087] animate-spin" />
                        </div>
                      )}
                    </div>
                    {/* Card de sugerencia */}
                    {clienteSugerido && (
                      <button
                        type="button"
                        onClick={aplicarSugerencia}
                        className="mt-1.5 w-full flex items-center gap-2.5 bg-[#003087] hover:bg-[#002266] text-white rounded-xl px-3 py-2.5 transition-colors text-left group"
                      >
                        <div className="bg-[#FFCD00] p-1.5 rounded-lg shrink-0">
                          <UserCheck size={13} className="text-[#003087]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white/60 uppercase tracking-wide">Cliente encontrado</p>
                          <p className="text-sm font-black truncate">
                            {clienteSugerido.nombre} {clienteSugerido.apellido}
                          </p>
                          {clienteSugerido.celular && (
                            <p className="text-[10px] text-white/50">{clienteSugerido.celular}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#FFCD00] shrink-0 group-hover:underline">
                          Autocompletar →
                        </span>
                      </button>
                    )}
                  </div>

                  <div>
                    <Label>Celular</Label>
                    <Field>
                      <input
                        type="text"
                        value={cliente.celular}
                        onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                        placeholder="70012345"
                      />
                    </Field>
                  </div>
                  <div>
                    <Label required>Nombre</Label>
                    <Field>
                      <input
                        type="text"
                        value={cliente.nombre}
                        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                        placeholder="Juan"
                      />
                    </Field>
                  </div>
                  <div>
                    <Label required>Apellido</Label>
                    <Field>
                      <input
                        type="text"
                        value={cliente.apellido}
                        onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })}
                        placeholder="Pérez"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-slate-200" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-slate-100">
                    <CreditCard size={14} className="text-slate-600" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-sm">Método de Pago</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMetodoPago("efectivo")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 border-2 text-sm font-bold transition-all ${
                      metodoPago === "efectivo"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Banknote size={16} />
                    Efectivo
                  </button>
                  <button
                    onClick={() => setMetodoPago("qr")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 border-2 text-sm font-bold transition-all ${
                      metodoPago === "qr"
                        ? "border-[#003087] bg-blue-50 text-[#003087]"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <QrCode size={16} />
                    Pago QR
                  </button>
                </div>
              </div>
            </div>

            {/* Productos en venta */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-[#C8102E]" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-[#C8102E]">
                    <Package size={14} className="text-white" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-sm">
                    Productos en Venta
                  </h2>
                  {productosEnVenta.length > 0 && (
                    <span className="ml-auto bg-[#003087] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
                    </span>
                  )}
                </div>

                {productosEnVenta.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300">
                    <ShoppingBag size={36} strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-slate-400">Sin productos</p>
                    <p className="text-xs text-slate-300">Escanea un QR para agregar prendas</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
                    {productosEnVenta.map((p) => (
                      <div key={p.id_producto} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 truncate">{p.descripcion}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">{fmtBs(p.precio)} c/u</span>
                            <StockBadge stock={p.stock} />
                          </div>
                        </div>
                        {/* Cantidad */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => cambiarCantidad(p.id_producto, p.cantidad - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-[#003087] hover:text-[#003087] flex items-center justify-center transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-slate-700">{p.cantidad}</span>
                          <button
                            onClick={() => cambiarCantidad(p.id_producto, p.cantidad + 1)}
                            disabled={p.cantidad >= p.stock}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-[#003087] hover:text-[#003087] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        {/* Subtotal */}
                        <span className="text-sm font-black text-[#003087] w-20 text-right shrink-0">
                          {fmtBs(p.precio * p.cantidad)}
                        </span>
                        {/* Eliminar */}
                        <button
                          onClick={() => eliminarProducto(p.id_producto)}
                          className="text-slate-300 hover:text-[#C8102E] transition-colors shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total + confirmar */}
                {productosEnVenta.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-semibold text-slate-500">Total a cobrar</span>
                      <span className="text-2xl font-black text-[#003087]">{fmtBs(total)}</span>
                    </div>
                    <button
                      onClick={confirmarVenta}
                      disabled={procesando}
                      className="w-full flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#002266] disabled:opacity-60 text-white font-black rounded-xl py-3 text-sm transition-colors shadow-md shadow-[#003087]/20"
                    >
                      {procesando ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Procesando…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Confirmar Venta
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">
                      Campos requeridos: CI, Nombre y Apellido del cliente
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Panel derecho: historial + comprobante ─── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Historial reciente */}
          {ability.can("read", "Venta") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[#FFCD00] via-[#003087] to-[#C8102E]" />
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100">
                  <ClipboardList size={14} className="text-slate-600" />
                </div>
                <h2 className="font-bold text-slate-700 text-sm">Ventas Recientes</h2>
                <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {ventas.length} registros
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-3 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-3 border-t-[#003087] border-r-[#FFCD00] border-b-[#C8102E] border-l-transparent animate-spin" style={{ borderWidth: 3 }} />
                  </div>
                  <p className="text-xs text-slate-400">Cargando…</p>
                </div>
              ) : ventas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-300">
                  <ShoppingCart size={32} strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-slate-400">Sin ventas registradas</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto custom-scroll">
                  {ventas.map((v) => (
                    <div
                      key={v.id_venta}
                      className={`px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${ventaSeleccionada?.id_venta === v.id_venta ? "bg-blue-50/60 border-l-2 border-[#003087]" : "border-l-2 border-transparent"}`}
                      onClick={() => verVenta(v.id_venta)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-black text-slate-700">#{v.id_venta}</span>
                            <MetodoBadge metodo={v.metodo_pago} />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{v.nombre_usuario} · {fmtFecha(v.fecha)}</p>
                        </div>
                        <span className="text-sm font-black text-[#003087] shrink-0">{fmtBs(v.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comprobante / Detalle de venta */}
          {ventaSeleccionada && (
            <div id="panel-comprobante" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-1 w-full bg-[#003087]" />
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#003087]">
                    <ShoppingCart size={14} className="text-white" />
                  </div>
                  <h2 className="font-bold text-slate-700 text-sm">Venta #{ventaSeleccionada.id_venta}</h2>
                </div>
                <button
                  onClick={imprimirComprobante}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Printer size={13} />
                  Imprimir
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Info venta */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Fecha", value: fmtFecha(ventaSeleccionada.fecha) },
                    { label: "Método", value: <MetodoBadge metodo={ventaSeleccionada.metodo_pago} /> },
                    { label: "Vendedor", value: ventaSeleccionada.nombre_usuario },
                    { label: "Cliente", value: `${ventaSeleccionada.cliente_nombre || ""} ${ventaSeleccionada.cliente_apellido || ""}`.trim() || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Productos */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Productos ({ventaSeleccionada.detalles?.length || 0})
                  </p>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scroll">
                    {ventaSeleccionada.detalles?.map((d, i) => (
                      <div key={d.id_detalle || i} className="flex items-start justify-between gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{d.nombre_producto}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {d.categoria && <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">{d.categoria}</span>}
                            {d.color && <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">{d.color}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-400">{d.cantidad || 1} × {fmtBs(d.precio)}</p>
                          <p className="text-xs font-black text-[#003087]">{fmtBs((d.cantidad || 1) * d.precio)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between bg-[#003087] rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-white/70">Total</span>
                  <span className="text-lg font-black text-white">{fmtBs(ventaSeleccionada.total)}</span>
                </div>
              </div>

              {/* Comprobante oculto para imprimir */}
              <div className="hidden">
                <ComprobanteVenta ref={comprobanteRef} venta={ventaSeleccionada} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,48,135,0.15); border-radius: 10px; }
      ` }} />
    </div>
  );
};

export default Ventas;
