import React, { useState, useEffect, useContext } from 'react';
import { AbilityContext } from '../context/AbilityContext';
import {
  totalVendidoMes,
  ventasPorUsuario,
  ventasPorMetodoPago,
  productosEnStock,
  topProductosVendidos,
} from '../services/reporte';

const Reportes = () => {
  const ability = useContext(AbilityContext);

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cargando, setCargando] = useState(false);

  const [ventasMes, setVentasMes] = useState(null);
  const [ventasUsuarios, setVentasUsuarios] = useState([]);
  const [ventasMetodo, setVentasMetodo] = useState([]);
  const [productosStock, setProductosStock] = useState([]);
  const [topProductos, setTopProductos] = useState([]);

  useEffect(() => {
    if (ability.can('read', 'Reporte')) cargarReportes();
  }, [ability, mes, anio]);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const [ventasMesData, ventasUsuarioData, ventasMetodoData, productosStockData, topProductosData] = await Promise.all([
        totalVendidoMes(mes, anio),
        ventasPorUsuario(),
        ventasPorMetodoPago(),
        productosEnStock(),
        topProductosVendidos()
      ]);

      setVentasMes(ventasMesData);
      setVentasUsuarios(ventasUsuarioData);
      setVentasMetodo(ventasMetodoData);
      setProductosStock(productosStockData);
      setTopProductos(topProductosData);
    } catch (err) {
      console.error(err);
      alert('Error al cargar reportes');
    } finally {
      setCargando(false);
    }
  };

  if (!ability.can('read', 'Reporte')) {
    return <p className="p-6 text-red-500">No tienes permisos para ver los reportes</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Reportes</h2>

      {/* FILTRO MES / AÑO */}
      <div className="flex gap-4 mb-4">
        <input type="number" min="1" max="12" value={mes} onChange={e => setMes(e.target.value)} className="border p-2 rounded" />
        <input type="number" min="2000" max="2100" value={anio} onChange={e => setAnio(e.target.value)} className="border p-2 rounded" />
        <button onClick={cargarReportes} className="bg-blue-500 text-white px-4 py-2 rounded">Actualizar</button>
      </div>

      {cargando && <p>Cargando reportes...</p>}

      {/* TOTAL VENDIDO */}
      {ventasMes && (
        <div className="border p-4 rounded">
          <h3 className="font-semibold text-lg mb-2">Total vendido en {mes}/{anio}</h3>
          <p>Total ventas: {ventasMes.total_ventas}</p>
          <p>Total vendido: ${ventasMes.total_vendido}</p>
        </div>
      )}

      {/* VENTAS POR USUARIO */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold text-lg mb-2">Ventas por usuario</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Cantidad de ventas</th>
              <th className="px-4 py-2">Total vendido</th>
            </tr>
          </thead>
          <tbody>
            {ventasUsuarios.map(u => (
              <tr key={u.id_usuario} className="border-b">
                <td className="px-4 py-2">{u.usuario}</td>
                <td className="px-4 py-2">{u.cantidad_ventas}</td>
                <td className="px-4 py-2">${u.total_vendido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VENTAS POR MÉTODO */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold text-lg mb-2">Ventas por método de pago</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Método</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasMetodo.map(v => (
              <tr key={v.metodo_pago} className="border-b">
                <td className="px-4 py-2">{v.metodo_pago}</td>
                <td className="px-4 py-2">{v.cantidad}</td>
                <td className="px-4 py-2">${v.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUCTOS EN STOCK */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold text-lg mb-2">Productos en stock</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Color</th>
              <th className="px-4 py-2">Talla</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {productosStock.map(p => (
              <tr key={p.id_producto} className="border-b">
                <td className="px-4 py-2">{p.descripcion}</td>
                <td className="px-4 py-2">{p.categoria}</td>
                <td className="px-4 py-2">{p.color}</td>
                <td className="px-4 py-2">{p.talla}</td>
                <td className="px-4 py-2">${p.precio}</td>
                <td className="px-4 py-2">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOP PRODUCTOS */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold text-lg mb-2">Top productos más vendidos</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Veces vendido</th>
              <th className="px-4 py-2">Total generado</th>
            </tr>
          </thead>
          <tbody>
            {topProductos.map(p => (
              <tr key={p.id_producto} className="border-b">
                <td className="px-4 py-2">{p.descripcion}</td>
                <td className="px-4 py-2">{p.veces_vendido}</td>
                <td className="px-4 py-2">${p.total_generado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Reportes;
