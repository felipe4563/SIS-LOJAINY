import { useEffect, useState } from "react";
import ReporteVentasPDF from "../pages/Reporte/ReportesVentasPDF";
import { obtenerReporteVentas } from "../services/reporte";
import { obtenerUsuarios } from "../services/usuario";

const Reportes = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📅 fechas por defecto: mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filtros, setFiltros] = useState({
    metodo_pago: "",
    id_usuario: "",
    fecha_inicio: primerDiaMes,
    fecha_fin: ultimoDiaMes
  });

  // 🔁 función reutilizable
  const cargarReporte = async (params) => {
    try {
      setLoading(true);
      const { data } = await obtenerReporteVentas(params);
      setVentas(data);
    } catch (error) {
      console.error("Error al cargar reporte", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 AL ENTRAR AL COMPONENTE
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setLoading(true);
        const [reporteRes, usuariosRes] = await Promise.all([
          obtenerReporteVentas({
            metodo_pago: null,
            id_usuario: null,
            fecha_inicio: primerDiaMes,
            fecha_fin: ultimoDiaMes
          }),
          obtenerUsuarios()
        ]);

        setVentas(reporteRes.data);
        setUsuarios(usuariosRes.data);
      } catch (error) {
        console.error("Error inicial de reportes", error);
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, []);

  const buscarReporte = () => {
    cargarReporte({
      metodo_pago: filtros.metodo_pago || null,
      id_usuario: filtros.id_usuario || null,
      fecha_inicio: filtros.fecha_inicio,
      fecha_fin: filtros.fecha_fin
    });
  };

  // 💰 total general
  const totalGeneral = ventas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Reporte de Ventas</h2>

      {/* 📄 PDF */}
      <div className="flex justify-end mb-4">
        <ReporteVentasPDF
          ventas={ventas}
          filtros={{
            metodo_pago: filtros.metodo_pago,
            vendedor:
              usuarios.find(u => u.id_usuario == filtros.id_usuario)
                ?.nombre || "",
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin
          }}
        />
      </div>

      {/* 🔎 FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded shadow mb-6">
        <select
          className="border p-2 rounded"
          value={filtros.metodo_pago}
          onChange={(e) =>
            setFiltros({ ...filtros, metodo_pago: e.target.value })
          }
        >
          <option value="">Todos los pagos</option>
          <option value="efectivo">Efectivo</option>
          <option value="qr">QR</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filtros.id_usuario}
          onChange={(e) =>
            setFiltros({ ...filtros, id_usuario: e.target.value })
          }
        >
          <option value="">Todos los vendedores</option>
          {usuarios.map((u) => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombre} {u.apellido}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={filtros.fecha_inicio}
          onChange={(e) =>
            setFiltros({ ...filtros, fecha_inicio: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={filtros.fecha_fin}
          onChange={(e) =>
            setFiltros({ ...filtros, fecha_fin: e.target.value })
          }
        />

        <button
          onClick={buscarReporte}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {/* 📋 TABLA */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Vendedor</th>
              <th className="p-2 border">Producto</th>
              <th className="p-2 border">Método</th>
              <th className="p-2 border text-right">Precio</th>
              <th className="p-2 border text-right">Total Venta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Cargando...
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No hay resultados
                </td>
              </tr>
            ) : (
              ventas.map((v, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {new Date(v.fecha).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">{v.vendedor}</td>
                  <td className="p-2 border">{v.producto}</td>
                  <td className="p-2 border uppercase">{v.metodo_pago}</td>
                  <td className="p-2 border text-right">
                    Bs {Number(v.precio).toFixed(2)}
                  </td>
                  <td className="p-2 border text-right font-semibold">
                    Bs {Number(v.total).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 💰 TOTAL */}
        <div className="text-right p-4 font-bold text-lg">
          Total General: Bs {totalGeneral.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
