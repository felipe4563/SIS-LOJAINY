import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect } from "react";
import { FileDown, Loader2, CheckCircle2 } from "lucide-react";

const ReporteVentasPDF = ({ ventas, filtros, empresa = "Boutique Lojainy" }) => {
  const [logoBase64, setLogoBase64] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | generando | listo

  useEffect(() => {
    const cargarLogo = async () => {
      try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.log('No se pudo cargar el logo:', error);
      }
    };
    cargarLogo();
  }, []);

  const generarPDF = async () => {
    if (estado !== "idle") return;
    setEstado("generando");

    await new Promise(r => setTimeout(r, 60));

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const fechaGeneracion = new Date();
    const margen = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margen * 2);

    const colores = {
      primario:    [0, 48, 135],      // #003087 navy marca
      secundario:  [22, 28, 45],      // azul muy oscuro
      acento:      [212, 175, 55],    // dorado
      rojo:        [200, 16, 46],     // #C8102E
      textoOscuro: [22, 28, 45],
      textoClaro:  [255, 255, 255],
      fondoClaro:  [248, 249, 252],   // azul muy pálido
      fondoMedio:  [235, 240, 250],
    };

    // ========== ENCABEZADO ==========
    // Bloque navy superior
    doc.setFillColor(...colores.primario);
    doc.rect(0, 0, pageWidth, 48, 'F');

    // Línea dorada superior (3px)
    doc.setFillColor(...colores.acento);
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    // Línea roja fina debajo del bloque navy
    doc.setFillColor(...colores.rojo);
    doc.rect(0, 48, pageWidth, 1, 'F');

    // Logo a la derecha
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', pageWidth - margen - 30, 7, 27, 28);
      } catch (_) {}
    }

    // Nombre empresa
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...colores.textoClaro);
    doc.text(empresa.toUpperCase(), margen, 20);

    // Separador dorado fino debajo del nombre
    doc.setFillColor(...colores.acento);
    doc.rect(margen, 23, 60, 0.6, 'F');

    // Slogan
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 200, 240);
    doc.text("Moda con elegancia colombiana", margen, 30);

    // Tipo de documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...colores.acento);
    doc.text("REPORTE DE VENTAS", margen, 42);

    // ========== BLOQUE INFO ==========
    let posY = 57;

    doc.setFillColor(...colores.fondoClaro);
    doc.setDrawColor(...colores.fondoMedio);
    doc.setLineWidth(0.4);
    doc.roundedRect(margen, posY, contentWidth, 24, 2, 2, 'FD');

    // Línea izquierda navy
    doc.setFillColor(...colores.primario);
    doc.rect(margen, posY, 2.5, 24, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...colores.primario);
    doc.text("FECHA DE GENERACIÓN", margen + 7, posY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colores.textoOscuro);
    const fechaFormato = fechaGeneracion.toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(
      `${fechaFormato} — ${fechaGeneracion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
      margen + 7, posY + 13
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...colores.primario);
    doc.text("PERÍODO", margen + 7, posY + 20);

    let filtroTexto = `${filtros.fecha_inicio} al ${filtros.fecha_fin}`;
    if (filtros.metodo_pago && filtros.metodo_pago !== "Todos")
      filtroTexto += `  ·  Método: ${filtros.metodo_pago}`;
    if (filtros.vendedor && filtros.vendedor !== "Todos")
      filtroTexto += `  ·  Vendedor: ${filtros.vendedor}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colores.textoOscuro);
    doc.text(filtroTexto, margen + 35, posY + 20);

    // ========== TABLA ==========
    const startY = posY + 32;

    const datosTabla = [];
    ventas.forEach((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const fechaFormateada = fechaVenta.toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: '2-digit'
      });
      venta.productos.forEach((producto, index) => {
        const esPrimeraFila = index === 0;
        datosTabla.push({
          fecha:         esPrimeraFila ? fechaFormateada : "",
          vendedor:      esPrimeraFila ? (venta.vendedor.length > 14 ? venta.vendedor.substring(0, 14) + "…" : venta.vendedor) : "",
          producto:      producto.producto || producto.nombre || "Sin nombre",
          cantidad:      producto.cantidad,
          precioUnitario: Number(producto.precio).toFixed(2),
          subtotal:      (producto.precio * producto.cantidad).toFixed(2),
          metodo:        esPrimeraFila ? venta.metodo_pago : "",
          totalVenta:    esPrimeraFila ? Number(venta.total).toFixed(2) : "",
          esPrimeraFila,
        });
      });
    });

    const tableBody = datosTabla.map(item => [
      item.fecha, item.vendedor, item.producto,
      item.cantidad.toString(), item.precioUnitario,
      item.subtotal, item.metodo, item.totalVenta
    ]);

    const colWidths = {
      fecha:    contentWidth * 0.11,
      vendedor: contentWidth * 0.15,
      producto: contentWidth * 0.24,
      cantidad: contentWidth * 0.08,
      pUnitario: contentWidth * 0.11,
      subtotal: contentWidth * 0.11,
      metodo:   contentWidth * 0.10,
      total:    contentWidth * 0.10,
    };

    autoTable(doc, {
      head: [["Fecha", "Vendedor", "Producto", "Cant.", "P.Unit.", "Subtotal", "Método", "Total"]],
      body: tableBody,
      startY,
      margin: { left: margen, right: margen },
      tableWidth: contentWidth,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [220, 228, 240],
        lineWidth: 0.15,
        textColor: colores.textoOscuro,
        font: "helvetica",
        overflow: 'ellipsize',
      },
      headStyles: {
        fillColor: colores.primario,
        textColor: colores.textoClaro,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: colWidths.fecha,    halign: "center" },
        1: { cellWidth: colWidths.vendedor  },
        2: { cellWidth: colWidths.producto  },
        3: { cellWidth: colWidths.cantidad, halign: "center" },
        4: { cellWidth: colWidths.pUnitario, halign: "right" },
        5: { cellWidth: colWidths.subtotal, halign: "right" },
        6: { cellWidth: colWidths.metodo,   halign: "center", fontSize: 7 },
        7: { cellWidth: colWidths.total,    halign: "right", fontStyle: "bold", textColor: colores.primario },
      },
      willDrawCell: (data) => {
        if (data.section === 'body') {
          const originalData = datosTabla[data.row.index];
          if (originalData) {
            data.cell.styles.fillColor = originalData.esPrimeraFila
              ? [248, 249, 252]
              : [255, 255, 255];
            if (data.cell.raw === "" && ![2, 3, 4, 5].includes(data.column.index)) {
              data.cell.styles.textColor = data.cell.styles.fillColor;
            }
          }
        }
      },
      didDrawPage: (data) => {
        // Footer line
        doc.setDrawColor(...colores.acento);
        doc.setLineWidth(0.6);
        doc.line(margen, pageHeight - 18, pageWidth - margen, pageHeight - 18);

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 130, 150);
        doc.text(empresa, margen, pageHeight - 12);
        doc.text(
          `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2, pageHeight - 12, { align: "center" }
        );
        doc.text(
          fechaGeneracion.toLocaleDateString('es-CO'),
          pageWidth - margen, pageHeight - 12, { align: "right" }
        );

        // Barra de color navy al fondo
        doc.setFillColor(...colores.primario);
        doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');
        // Línea dorada encima
        doc.setFillColor(...colores.acento);
        doc.rect(0, pageHeight - 4, pageWidth, 0.8, 'F');
      },
    });

    // ========== RESUMEN FINAL ==========
    let finalY = doc.lastAutoTable.finalY + 10;
    if (finalY > pageHeight - 35) { doc.addPage(); finalY = 20; }

    // Panel resumen navy
    doc.setFillColor(...colores.primario);
    doc.roundedRect(margen, finalY, contentWidth, 20, 2, 2, 'F');

    // Borde dorado
    doc.setDrawColor(...colores.acento);
    doc.setLineWidth(0.8);
    doc.roundedRect(margen, finalY, contentWidth, 20, 2, 2, 'S');

    const totalGeneral     = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const cantidadVentas   = ventas.length;
    const cantidadProductos = ventas.reduce((acc, v) => acc + v.productos.length, 0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 185, 220);
    doc.text(`Ventas: ${cantidadVentas}  ·  Artículos: ${cantidadProductos}`, margen + 8, finalY + 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...colores.acento);
    const totalText = `TOTAL: Bs ${totalGeneral.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(totalText, pageWidth - margen - 8, finalY + 13, { align: "right" });

    const fechaArchivo = fechaGeneracion.toISOString().split('T')[0];
    doc.save(`Reporte_${empresa.replace(/\s+/g, '_')}_${fechaArchivo}.pdf`);

    setEstado("listo");
    setTimeout(() => setEstado("idle"), 2200);
  };

  const deshabilitado = ventas.length === 0 || estado === "generando";

  return (
    <>
      <style>{`
        @keyframes rsvSpin { to { transform: rotate(360deg); } }
        @keyframes rsvShimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes rsvPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }

        .rsv-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 0 22px;
          height: 42px;
          background: #003087;
          color: #fff;
          border: none;
          border-top: 3px solid #FFCD00;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          overflow: hidden;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          box-shadow: 0 2px 10px rgba(0,48,135,0.25);
          white-space: nowrap;
          user-select: none;
        }
        .rsv-btn:not(:disabled):hover {
          background: #00235f;
          box-shadow: 0 4px 18px rgba(0,48,135,0.4);
        }
        .rsv-btn:not(:disabled):hover .rsv-shimmer {
          animation: rsvShimmer 0.7s ease forwards;
        }
        .rsv-btn:not(:disabled):active {
          transform: translateY(1px);
          box-shadow: 0 1px 6px rgba(0,48,135,0.3);
        }
        .rsv-btn:disabled {
          opacity: 0.48;
          cursor: not-allowed;
          border-top-color: #8a9ab5;
        }

        .rsv-btn.generando {
          background: #001f60;
          animation: rsvPulse 1.4s ease-in-out infinite;
        }
        .rsv-btn.listo {
          background: #0a4a1a;
          border-top-color: #4ade80;
          animation: none;
        }

        .rsv-shimmer {
          position: absolute;
          top: 0; bottom: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,205,0,0.18), transparent);
          transform: skewX(-15deg);
          pointer-events: none;
        }

        .rsv-icon-spin {
          animation: rsvSpin 0.9s linear infinite;
        }

        .rsv-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: rgba(255, 205, 0, 0.18);
          border: 1px solid rgba(255, 205, 0, 0.4);
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          color: #FFCD00;
          letter-spacing: 0.02em;
        }

        .rsv-divider {
          width: 1px;
          height: 16px;
          background: rgba(255,255,255,0.18);
        }
      `}</style>

      <button
        onClick={generarPDF}
        disabled={deshabilitado}
        className={`rsv-btn ${estado}`}
        title={deshabilitado && ventas.length === 0 ? "Sin ventas para exportar" : "Exportar reporte en PDF"}
      >
        <span className="rsv-shimmer" />

        {estado === "idle" && <FileDown size={16} strokeWidth={2} />}
        {estado === "generando" && <Loader2 size={16} strokeWidth={2} className="rsv-icon-spin" />}
        {estado === "listo" && <CheckCircle2 size={16} strokeWidth={2.5} />}

        <span>
          {estado === "idle"      && "Exportar PDF"}
          {estado === "generando" && "Generando…"}
          {estado === "listo"     && "¡Listo!"}
        </span>

        {estado === "idle" && ventas.length > 0 && (
          <>
            <span className="rsv-divider" />
            <span className="rsv-badge">{ventas.length}</span>
          </>
        )}
      </button>
    </>
  );
};

export default ReporteVentasPDF;
