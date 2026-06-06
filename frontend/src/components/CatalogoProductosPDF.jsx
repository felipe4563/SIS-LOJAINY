const CatalogoProductosPDF = ({ productos }) => {
  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const totalStock = productos.reduce((s, p) => s + Number(p.stock), 0);
  const totalValor = productos.reduce((s, p) => s + Number(p.stock) * Number(p.precio), 0);
  const sinStock   = productos.filter(p => Number(p.stock) === 0).length;

  const scStyle = (stock) => {
    if (stock === 0) return { background: "#fee2e2", color: "#dc2626" };
    if (stock <= 5)  return { background: "#fef3c7", color: "#d97706" };
    return { background: "#dcfce7", color: "#16a34a" };
  };

  const cell = (extra = {}) => ({
    padding: "7px 10px", borderBottom: "1px solid #f1f5f9", ...extra,
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif", background: "white", color: "#1e293b" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #003087", paddingBottom: "14px", marginBottom: "14px" }}>
        <img src="/logo.png" alt="Boutique Lojainy" style={{ height: "76px", objectFit: "contain" }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#003087", lineHeight: 1.1 }}>
            Inventario de Productos
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px" }}>
            Boutique Lojainy &nbsp;·&nbsp; {fecha}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "PRODUCTOS",           value: productos.length,               color: "#003087", bg: "#eff6ff" },
          { label: "UNIDADES EN STOCK",   value: totalStock,                     color: "#16a34a", bg: "#f0fdf4" },
          { label: "VALOR DE INVENTARIO", value: `Bs. ${totalValor.toFixed(2)}`, color: "#C8102E", bg: "#fff1f2" },
          { label: "SIN STOCK",           value: sinStock,                       color: "#d97706", bg: "#fffbeb" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.bg, borderRadius: "8px", padding: "10px 12px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", letterSpacing: "0.5px", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
        <thead>
          <tr style={{ background: "#003087" }}>
            {[
              { label: "ID",          align: "left"   },
              { label: "DESCRIPCIÓN", align: "left"   },
              { label: "CATEGORÍA",   align: "left"   },
              { label: "TALLA",       align: "left"   },
              { label: "COLOR",       align: "left"   },
              { label: "MARCA",       align: "left"   },
              { label: "PRECIO",      align: "right"  },
              { label: "STOCK",       align: "center" },
            ].map(h => (
              <th key={h.label} style={{ padding: "8px 10px", textAlign: h.align, color: "white", fontWeight: "700", fontSize: "9px", letterSpacing: "0.6px" }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={p.id_producto} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
              <td style={cell({ color: "#94a3b8", fontSize: "9px" })}>{p.id_producto}</td>
              <td style={cell({ fontWeight: "600", color: "#1e293b" })}>{p.descripcion}</td>
              <td style={cell({ color: "#475569" })}>{p.categoria || "—"}</td>
              <td style={cell({ color: "#475569" })}>{p.talla    || "—"}</td>
              <td style={cell({ color: "#475569" })}>{p.color    || "—"}</td>
              <td style={cell({ color: "#475569" })}>{p.marca    || "—"}</td>
              <td style={cell({ textAlign: "right", fontWeight: "700", color: "#003087" })}>
                Bs. {Number(p.precio).toFixed(2)}
              </td>
              <td style={cell({ textAlign: "center" })}>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "99px", fontSize: "10px", fontWeight: "700", ...scStyle(Number(p.stock)) }}>
                  {p.stock}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: "18px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "9px", color: "#94a3b8" }}>Boutique Lojainy · Sistema de Gestión de Inventario</span>
        <span style={{ fontSize: "9px", color: "#94a3b8" }}>{productos.length} productos · {totalStock} unidades en stock</span>
      </div>
    </div>
  );
};

export default CatalogoProductosPDF;
