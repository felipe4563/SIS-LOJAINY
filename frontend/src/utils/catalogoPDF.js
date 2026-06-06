import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const cargarLogoBase64 = async () => {
  try {
    const res  = await fetch("/logo.png");
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const descargarCatalogoPDF = async (productos) => {
  const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W    = doc.internal.pageSize.getWidth();   // 210
  const mL   = 14;
  const mR   = 197;

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logo = await cargarLogoBase64();
  if (logo) doc.addImage(logo, "PNG", mL, 8, 38, 19);

  // ── Título ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(0, 48, 135);
  doc.text("Inventario de Productos", mR, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  doc.text(`Boutique Lojainy  ·  ${fecha}`, mR, 21, { align: "right" });

  // ── Línea divisora ────────────────────────────────────────────────────────
  doc.setDrawColor(0, 48, 135);
  doc.setLineWidth(0.7);
  doc.line(mL, 32, mR, 32);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalStock = productos.reduce((s, p) => s + Number(p.stock), 0);
  const totalValor = productos.reduce((s, p) => s + Number(p.stock) * Number(p.precio), 0);
  const sinStock   = productos.filter(p => Number(p.stock) === 0).length;

  const stats = [
    { label: "PRODUCTOS",           value: String(productos.length),        color: [0, 48, 135],   bg: [239, 246, 255] },
    { label: "UNIDADES EN STOCK",   value: String(totalStock),              color: [22, 163, 74],  bg: [240, 253, 244] },
    { label: "VALOR DE INVENTARIO", value: `Bs. ${totalValor.toFixed(2)}`,  color: [200, 16, 46],  bg: [255, 241, 242] },
    { label: "SIN STOCK",           value: String(sinStock),                color: [217, 119, 6],  bg: [255, 251, 235] },
  ];

  const cardW = (mR - mL - 9) / 4;
  stats.forEach((s, i) => {
    const x = mL + i * (cardW + 3);
    const y = 36;
    doc.setFillColor(...s.bg);
    doc.roundedRect(x, y, cardW, 17, 2, 2, "F");
    doc.setFillColor(...s.color);
    doc.rect(x, y, 1.5, 17, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...s.color);
    doc.text(s.value, x + 5, y + 9);

    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(s.label, x + 5, y + 14);
  });

  // ── Tabla ─────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: 59,
    margin: { left: mL, right: W - mR },
    head: [["ID", "DESCRIPCIÓN", "CATEGORÍA", "TALLA", "COLOR", "MARCA", "PRECIO", "STOCK"]],
    body: productos.map(p => [
      p.id_producto,
      p.descripcion,
      p.categoria || "—",
      p.talla     || "—",
      p.color     || "—",
      p.marca     || "—",
      `Bs. ${Number(p.precio).toFixed(2)}`,
      Number(p.stock),
    ]),
    headStyles: {
      fillColor:  [0, 48, 135],
      textColor:  255,
      fontStyle:  "bold",
      fontSize:   7.5,
      halign:     "left",
    },
    bodyStyles: {
      fontSize:   8,
      textColor:  [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, textColor: [148, 163, 184], fontSize: 7 },
      6: { halign: "right", fontStyle: "bold", textColor: [0, 48, 135] },
      7: { halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 7) {
        const stock = Number(data.cell.raw);
        if (stock === 0) {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.textColor = [220, 38, 38];
        } else if (stock <= 5) {
          data.cell.styles.fillColor = [254, 243, 199];
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.fillColor = [220, 252, 231];
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
  });

  // ── Footer en cada página ─────────────────────────────────────────────────
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(mL, pH - 11, mR, pH - 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Boutique Lojainy · Sistema de Gestión de Inventario", mL, pH - 6);
    doc.text(
      `${productos.length} productos · ${totalStock} uds. en stock  |  Pág. ${i} / ${totalPaginas}`,
      mR, pH - 6, { align: "right" }
    );
  }

  // ── Descargar ─────────────────────────────────────────────────────────────
  const fecha2 = new Date().toLocaleDateString("es-ES").replace(/\//g, "-");
  doc.save(`Inventario_Lojainy_${fecha2}.pdf`);
};
