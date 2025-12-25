import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReporteVentasPDF = ({ ventas, filtros }) => {
  const generarPDF = () => {
    const doc = new jsPDF();

    // 🧾 ENCABEZADO
    doc.setFontSize(16);
    doc.text("REPORTE DE VENTAS", 14, 15);

    doc.setFontSize(10);
    doc.text(`Método: ${filtros.metodo_pago || "Todos"}`, 14, 22);
    doc.text(`Vendedor: ${filtros.vendedor || "Todos"}`, 14, 28);
    doc.text(
      `Fecha: ${filtros.fecha_inicio} a ${filtros.fecha_fin}`,
      14,
      34
    );

    // 📊 TABLA
    const columnas = [
      "Fecha",
      "Vendedor",
      "Producto",
      "Método",
      "Precio",
      "Total Venta"
    ];

    const filas = ventas.map((v) => [
      new Date(v.fecha).toLocaleDateString(),
      v.vendedor,
      v.producto,
      v.metodo_pago.toUpperCase(),
      `Bs ${Number(v.precio).toFixed(2)}`,
      `Bs ${Number(v.total).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // 💰 TOTAL GENERAL
    const totalGeneral = ventas.reduce(
      (sum, v) => sum + Number(v.total),
      0
    );

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`TOTAL GENERAL: Bs ${totalGeneral.toFixed(2)}`, 14, finalY);

    // 📥 DESCARGA
    doc.save("reporte_ventas.pdf");
  };

  return (
    <button
      onClick={generarPDF}
      disabled={ventas.length === 0}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
    >
      📄 Exportar PDF
    </button>
  );
};

export default ReporteVentasPDF;
