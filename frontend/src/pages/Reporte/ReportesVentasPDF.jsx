import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect } from "react";

const ReporteVentasPDF = ({ ventas, filtros, empresa = "Boutique Lojainy" }) => {
  const [logoBase64, setLogoBase64] = useState(null);
  
  // Cargar logo al montar el componente
  useEffect(() => {
    const cargarLogo = async () => {
      try {
        const response = await fetch('/logo.png'); // Tu logo en public/logo.png
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.log('No se pudo cargar el logo:', error);
      }
    };
    
    cargarLogo();
  }, []);

  const generarPDF = () => {
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
    
    // Colores elegantes para boutique
    const colores = {
      primario: [139, 90, 43],
      secundario: [45, 45, 45],
      acento: [212, 175, 55],
      textoOscuro: [33, 33, 33],
      textoClaro: [255, 255, 255],
      fondoClaro: [250, 248, 245],
    };
    
    // ========== ENCABEZADO ELEGANTE ==========
    doc.setFillColor(...colores.fondoClaro);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Línea dorada superior
    doc.setFillColor(...colores.acento);
    doc.rect(0, 0, pageWidth, 2, 'F');
    
    // ⭐ LOGO A LA DERECHA
    if (logoBase64) {
      try {
        doc.addImage(
          logoBase64,
          'PNG',
          pageWidth - margen - 35, // Posición X (derecha)
          6,                        // Posición Y
          32,                       // Ancho
          30                        // Alto
        );
      } catch (error) {
        console.log('Error al agregar logo al PDF');
      }
    }
    
    // Nombre de la empresa
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...colores.secundario);
    doc.text(empresa.toUpperCase(), margen, 18);
    
    // Slogan
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...colores.primario);
    doc.text("Moda Colombiana con Estilo", margen, 26);
    
    // Tipo de documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colores.secundario);
    doc.text("REPORTE DE VENTAS", margen, 38);
    
    // Líneas decorativas
    doc.setDrawColor(...colores.acento);
    doc.setLineWidth(0.8);
    doc.line(margen, 43, pageWidth - margen, 43);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margen, 44.5, pageWidth - margen, 44.5);
    
    // ========== INFORMACIÓN DEL REPORTE ==========
    let posY = 52;
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colores.acento);
    doc.setLineWidth(0.3);
    doc.roundedRect(margen, posY, contentWidth, 22, 2, 2, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colores.primario);
    doc.text("FECHA DE GENERACIÓN", margen + 5, posY + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colores.textoOscuro);
    const fechaFormato = fechaGeneracion.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`${fechaFormato} - ${fechaGeneracion.toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}`, margen + 5, posY + 12);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colores.primario);
    doc.text("PERÍODO DEL REPORTE", margen + 5, posY + 18);
    
    let filtroTexto = `${filtros.fecha_inicio} al ${filtros.fecha_fin}`;
    if (filtros.metodo_pago && filtros.metodo_pago !== "Todos") {
      filtroTexto += ` • Método: ${filtros.metodo_pago}`;
    }
    if (filtros.vendedor && filtros.vendedor !== "Todos") {
      filtroTexto += ` • Vendedor: ${filtros.vendedor}`;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colores.textoOscuro);
    doc.text(filtroTexto, margen + 55, posY + 18);
    
    // ========== TABLA DE VENTAS ==========
    const startY = posY + 30;
    
    const datosTabla = [];
    
    ventas.forEach((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const fechaFormateada = fechaVenta.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
      
      venta.productos.forEach((producto, index) => {
        const esPrimeraFila = index === 0;
        
        datosTabla.push({
          fecha: esPrimeraFila ? fechaFormateada : "",
          vendedor: esPrimeraFila ? (venta.vendedor.length > 14 ? venta.vendedor.substring(0, 14) + "..." : venta.vendedor) : "",
          producto: producto.producto || producto.nombre || "Sin nombre",
          cantidad: producto.cantidad,
          precioUnitario: Number(producto.precio).toFixed(2),
          subtotal: (producto.precio * producto.cantidad).toFixed(2),
          metodo: esPrimeraFila ? venta.metodo_pago : "",
          totalVenta: esPrimeraFila ? Number(venta.total).toFixed(2) : "",
          esPrimeraFila: esPrimeraFila
        });
      });
    });
    
    const tableBody = datosTabla.map(item => [
      item.fecha,
      item.vendedor,
      item.producto,
      item.cantidad.toString(),
      item.precioUnitario,
      item.subtotal,
      item.metodo,
      item.totalVenta
    ]);
    
    const colWidths = {
      fecha: contentWidth * 0.11,
      vendedor: contentWidth * 0.15,
      producto: contentWidth * 0.24,
      cantidad: contentWidth * 0.08,
      pUnitario: contentWidth * 0.11,
      subtotal: contentWidth * 0.11,
      metodo: contentWidth * 0.10,
      total: contentWidth * 0.10
    };
    
    autoTable(doc, {
      head: [["Fecha", "Vendedor", "Producto", "Cant.", "P.Unit.", "Subtotal", "Método", "Total"]],
      body: tableBody,
      startY: startY,
      margin: { left: margen, right: margen },
      tableWidth: contentWidth,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: colores.textoOscuro,
        font: "helvetica",
        overflow: 'ellipsize'
      },
      headStyles: {
        fillColor: colores.secundario,
        textColor: colores.textoClaro,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 3.5
      },
      columnStyles: {
        0: { cellWidth: colWidths.fecha, halign: "center" },
        1: { cellWidth: colWidths.vendedor },
        2: { cellWidth: colWidths.producto },
        3: { cellWidth: colWidths.cantidad, halign: "center" },
        4: { cellWidth: colWidths.pUnitario, halign: "right" },
        5: { cellWidth: colWidths.subtotal, halign: "right" },
        6: { cellWidth: colWidths.metodo, halign: "center", fontSize: 7 },
        7: { cellWidth: colWidths.total, halign: "right", fontStyle: "bold", textColor: colores.primario }
      },
      willDrawCell: (data) => {
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          const originalData = datosTabla[rowIndex];
          
          if (originalData) {
            if (originalData.esPrimeraFila) {
              data.cell.styles.fillColor = [252, 250, 247];
            } else {
              data.cell.styles.fillColor = [255, 255, 255];
            }
            
            if (data.cell.raw === "" && ![2, 3, 4, 5].includes(data.column.index)) {
              data.cell.styles.textColor = data.cell.styles.fillColor;
            }
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        
        doc.setDrawColor(...colores.acento);
        doc.setLineWidth(0.5);
        doc.line(margen, pageHeight - 18, pageWidth - margen, pageHeight - 18);
        
        doc.text(empresa, margen, pageHeight - 12);
        doc.text(
          `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          pageHeight - 12,
          { align: "center" }
        );
        doc.text(
          fechaGeneracion.toLocaleDateString('es-CO'),
          pageWidth - margen,
          pageHeight - 12,
          { align: "right" }
        );
        
        doc.setFillColor(...colores.acento);
        doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');
      }
    });
    
    // ========== RESUMEN FINAL ==========
    // ========== RESUMEN FINAL COMPACTO ==========
let finalY = doc.lastAutoTable.finalY + 8;

if (finalY > pageHeight - 35) {
  doc.addPage();
  finalY = 20;
}

// Panel compacto
doc.setFillColor(...colores.secundario);
doc.roundedRect(margen, finalY, contentWidth, 18, 2, 2, 'F');

// Borde dorado
doc.setDrawColor(...colores.acento);
doc.setLineWidth(0.8);
doc.roundedRect(margen, finalY, contentWidth, 18, 2, 2, 'S');

// Estadísticas
const totalGeneral = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
const cantidadVentas = ventas.length;
const cantidadProductos = ventas.reduce((acc, v) => acc + v.productos.length, 0);

// Info izquierda (en una línea)
doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.setTextColor(180, 180, 180);
doc.text(`Ventas: ${cantidadVentas}  •  Productos: ${cantidadProductos}`, margen + 8, finalY + 11);

// Total derecha
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...colores.acento);
const totalText = `TOTAL: Bs ${totalGeneral.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
doc.text(totalText, pageWidth - margen - 8, finalY + 12, { align: "right" });
    
    
    // Descargar
    const fechaArchivo = fechaGeneracion.toISOString().split('T')[0];
    doc.save(`Reporte_${empresa.replace(/\s+/g, '_')}_${fechaArchivo}.pdf`);
  };
  
  return (
    <button
      onClick={generarPDF}
      disabled={ventas.length === 0}
      className="
        inline-flex items-center justify-center gap-2
        px-5 py-2.5
        bg-gradient-to-r from-amber-700 to-amber-800
        hover:from-amber-800 hover:to-amber-900
        text-white font-medium rounded-lg
        shadow-md hover:shadow-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      Exportar Reporte
      {ventas.length > 0 && (
        <span className="bg-white/20 text-xs font-bold rounded-full px-2 py-0.5">
          {ventas.length}
        </span>
      )}
    </button>
  );
};

export default ReporteVentasPDF;