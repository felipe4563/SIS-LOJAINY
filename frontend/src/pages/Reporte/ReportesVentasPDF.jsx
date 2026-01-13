import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReporteVentasPDF = ({ ventas, filtros, empresa = "Mi Empresa" }) => {
  const generarPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter' // Tamaño carta estándar
    });
    
    const fechaGeneracion = new Date();
    const margen = 14;
    const pageWidth = doc.internal.pageSize.width;
    let posY = 20; // Posición inicial ajustada
    
    // ========== ENCABEZADO PROFESIONAL CON LOGO ==========
    // Fondo sutil para encabezado
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Línea decorativa
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(margen, 40, pageWidth - margen, 40);
    
    // Logo a la derecha (ajusta la ruta según tu archivo)
    const logoUrl = '/logo.png'; // También puedes usar '/logo.jpg', '/company-logo.png', etc.
    const logoData = new Image();
    
    // Configuración del logo
    const logoConfig = {
      width: 45,     // Ancho del logo en mm - AJUSTA ESTE VALOR
      height: 20,    // Alto del logo en mm - AJUSTA ESTE VALOR
      positionX: pageWidth - margen - 45, // Derecha con margen
      positionY: 15   // Posición vertical - AJUSTA ESTE VALOR
    };
    
    try {
      logoData.src = logoUrl;
      logoData.onload = () => {
        // El logo se cargará asíncronamente
      };
      
      // Agregar el logo (si no carga, no se mostrará pero no dará error)
      doc.addImage(
        logoData, 
        'PNG', 
        logoConfig.positionX, 
        logoConfig.positionY, 
        logoConfig.width, 
        logoConfig.height
      );
    } catch (error) {
      console.log('Logo no disponible, continuando sin logo');
    }
    
    // Información de la empresa a la izquierda
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(empresa.toUpperCase(), margen, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Reporte de Ventas", margen, 32);
    
    // ========== METADATOS DEL REPORTE ==========
    posY = 45;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    // Fecha de generación con formato profesional
    const fechaFormato = fechaGeneracion.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.text(
      `Reporte generado el ${fechaFormato} a las ${fechaGeneracion.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      pageWidth / 2,
      posY,
      { align: "center" }
    );
    
    // ========== PANEL DE FILTROS ==========
    posY += 12;
    
    // Fondo para filtros
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margen, posY, pageWidth - (margen * 2), 25, 3, 3, 'F');
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margen, posY, pageWidth - (margen * 2), 25, 3, 3, 'S');
    
    // Título de filtros
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("PARÁMETROS DEL REPORTE", margen + 8, posY + 8);
    
    // Contenido de filtros en dos columnas
    const filtrosArray = [];
    
    if (filtros.metodo_pago && filtros.metodo_pago !== "Todos") {
      filtrosArray.push(`Método: ${filtros.metodo_pago}`);
    }
    
    if (filtros.vendedor && filtros.vendedor !== "Todos") {
      filtrosArray.push(`Vendedor: ${filtros.vendedor}`);
    }
    
    filtrosArray.push(`Período: ${filtros.fecha_inicio} al ${filtros.fecha_fin}`);
    
    // Primera columna
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    let col1Y = posY + 16;
    filtrosArray.slice(0, 2).forEach(filtro => {
      doc.text(`• ${filtro}`, margen + 8, col1Y);
      col1Y += 5;
    });
    
    // Segunda columna (si hay más de 2 filtros)
    if (filtrosArray.length > 2) {
      let col2Y = posY + 16;
      filtrosArray.slice(2).forEach(filtro => {
        doc.text(`• ${filtro}`, margen + 85, col2Y);
        col2Y += 5;
      });
    }
    
    // ========== TABLA DE VENTAS ==========
    const startY = posY + 35;
    
    // Columnas de la tabla
    const columnas = [
      { header: "FECHA", dataKey: "fecha", width: 22 },
      { header: "VENDEDOR", dataKey: "vendedor", width: 30 },
      { header: "PRODUCTO", dataKey: "producto", width: 45 },
      { header: "CANT.", dataKey: "cantidad", width: 18 },
      { header: "P. UNIT.", dataKey: "precioUnitario", width: 22 },
      { header: "SUBTOTAL", dataKey: "subtotal", width: 22 },
      { header: "MÉTODO", dataKey: "metodo", width: 22 },
      { header: "TOTAL", dataKey: "totalVenta", width: 22 }
    ];
    
    // Preparar datos para la tabla
    const datosTabla = [];
    let numeroVenta = 1;
    
    ventas.forEach((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const fechaFormateada = fechaVenta.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      venta.productos.forEach((producto, index) => {
        const esPrimeraFila = index === 0;
        
        datosTabla.push({
          numeroVenta: esPrimeraFila ? numeroVenta : null,
          fecha: esPrimeraFila ? fechaFormateada : "",
          vendedor: esPrimeraFila ? venta.vendedor : "",
          producto: producto.producto || producto.nombre || "Producto no disponible",
          cantidad: producto.cantidad,
          precioUnitario: `Bs ${Number(producto.precio).toFixed(2)}`,
          subtotal: `Bs ${(producto.precio * producto.cantidad).toFixed(2)}`,
          metodo: esPrimeraFila ? venta.metodo_pago.toUpperCase() : "",
          totalVenta: esPrimeraFila ? `Bs ${Number(venta.total).toFixed(2)}` : "",
          esPrimeraFila: esPrimeraFila,
          ventaId: venta.id || numeroVenta
        });
      });
      
      numeroVenta++;
    });
    
    // Preparar body para autoTable
    const tableBody = datosTabla.map(item => [
      item.numeroVenta !== null ? item.numeroVenta.toString() : "",
      item.fecha,
      item.vendedor,
      item.producto,
      item.cantidad.toString(),
      item.precioUnitario,
      item.subtotal,
      item.metodo,
      item.totalVenta
    ]);
    
    // Crear un array de referencias a los datos originales
    const originalDataRefs = [...datosTabla];
    
    // Generar tabla
    autoTable(doc, {
      head: [["#", ...columnas.map(col => col.header)]],
      body: tableBody,
      startY: startY,
      margin: { left: margen, right: margen },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [40, 40, 40],
        font: "helvetica"
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.1
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12, fontStyle: "bold" },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 30 },
        3: { cellWidth: 45 },
        4: { halign: "right", cellWidth: 18 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", cellWidth: 22 },
        7: { halign: "center", cellWidth: 22 },
        8: { halign: "right", cellWidth: 22, fontStyle: "bold" }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      willDrawCell: (data) => {
        // Solo procesar celdas del body
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          
          if (originalDataRefs[rowIndex]) {
            const originalData = originalDataRefs[rowIndex];
            
            // Resaltar filas de inicio de venta con color más suave
            if (originalData.esPrimeraFila) {
              data.cell.styles.fillColor = [245, 247, 250];
              data.cell.styles.lineWidth = 0.3;
              data.cell.styles.lineColor = [200, 200, 200];
            }
            
            // Ocultar texto de celdas vacías (efecto rowspan)
            if (data.cell.raw === "" && data.column.index !== 3) {
              data.cell.styles.textColor = [245, 247, 250];
            }
          }
        }
      },
      didDrawPage: (data) => {
        // Pie de página profesional
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "italic");
        
        // Número de página centrado
        doc.text(
          `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 15,
          { align: "center" }
        );
        
        // Información de empresa izquierda
        doc.text(
          empresa,
          margen,
          doc.internal.pageSize.height - 15,
          { align: "left" }
        );
        
        // Fecha generación derecha
        doc.text(
          fechaGeneracion.toLocaleDateString(),
          pageWidth - margen,
          doc.internal.pageSize.height - 15,
          { align: "right" }
        );
      }
    });
    
    // ========== RESUMEN FINAL ==========
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Calcular estadísticas
    const totalGeneral = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const cantidadVentas = ventas.length;
    const cantidadProductos = ventas.reduce((acc, v) => acc + v.productos.length, 0);
    
    // Panel de resumen con diseño profesional
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margen, finalY, pageWidth - (margen * 2), 25, 3, 3, 'F');
    
    // Título del resumen
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("RESUMEN DEL REPORTE", margen + 10, finalY + 8);
    
    // Estadísticas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 255);
    doc.text(`• Ventas realizadas: ${cantidadVentas}`, margen + 10, finalY + 16);
    doc.text(`• Productos vendidos: ${cantidadProductos}`, margen + 10, finalY + 22);
    
    // Total general destacado
    const totalText = `TOTAL GENERAL: Bs ${totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    
    const textWidth = doc.getTextWidth(totalText);
    doc.text(
      totalText, 
      pageWidth - margen - textWidth - 10, 
      finalY + 18
    );
    
    // ========== DESCARGA ==========
    const fechaFormatoArchivo = fechaGeneracion.toISOString().split('T')[0];
    const nombreArchivo = `Reporte_Ventas_${empresa.replace(/\s+/g, '_')}_${fechaFormatoArchivo}.pdf`;
    doc.save(nombreArchivo);
  };
  
  // ========== BOTÓN PROFESIONAL ==========
  return (
    <button
      onClick={generarPDF}
      disabled={ventas.length === 0}
      className={`
        group relative
        inline-flex items-center justify-center gap-3
        px-6 py-3
        bg-gradient-to-r from-blue-700 to-blue-800
        hover:from-blue-800 hover:to-blue-900
        text-white font-semibold
        rounded-lg
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:-translate-y-1
        active:scale-98
        disabled:opacity-40 disabled:cursor-not-allowed
        disabled:hover:from-blue-700 disabled:hover:to-blue-800
        disabled:hover:shadow-lg disabled:hover:transform-none
        disabled:active:scale-100
        overflow-hidden
      `}
    >
      {/* Efecto de brillo al hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
      
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      
      <span className="relative">
        Exportar Reporte PDF
      </span>
      
      {/* Contador de ventas en el botón */}
      {ventas.length > 0 && (
        <span className="
          absolute -top-2 -right-2
          bg-red-500 text-white text-xs
          font-bold rounded-full
          w-6 h-6 flex items-center justify-center
          shadow-md
        ">
          {ventas.length}
        </span>
      )}
    </button>
  );
};

export default ReporteVentasPDF;