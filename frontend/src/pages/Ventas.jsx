import React, { useEffect, useState, useRef, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import { AuthContext } from "../context/AuthContext";
import { listarVentas, obtenerVenta, crearVenta } from "../services/venta";
import { obtenerProducto } from "../services/producto";
import ComprobanteVenta from "../components/ComprobanteVenta";

const Ventas = () => {
  const ability = useContext(AbilityContext);
  const { usuario } = useContext(AuthContext);

  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productosEnVenta, setProductosEnVenta] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [total, setTotal] = useState(0);
  const [cliente, setCliente] = useState({ ci: "", nombre: "", apellido: "", celular: "" });
  const comprobanteRef = useRef();

  useEffect(() => {
    if (ability.can("read", "Venta")) cargarVentas();
  }, [ability]);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await listarVentas();
      setVentas(data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  const verVenta = async (id) => {
    try {
      const data = await obtenerVenta(id);
      setVentaSeleccionada(data);
    } catch (err) {
      console.error(err);
      alert("No se pudo obtener la venta");
    }
  };

  // Agregar producto por QR y cantidad inicial 1
  const agregarProductoQR = async (qrText) => {
    const partes = qrText.split("/");
    const id_producto = parseInt(partes[partes.length - 1]);
    if (!id_producto) return alert("QR inválido");

    try {
      const producto = await obtenerProducto(id_producto);

      setProductosEnVenta((prev) => {
        const existe = prev.find((p) => p.id_producto === id_producto);
        let nuevos;
        if (existe) {
          nuevos = prev.map((p) =>
            p.id_producto === id_producto
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          );
        } else {
          nuevos = [
            ...prev,
            { 
              id_producto: producto.id_producto,
              precio: producto.precio,
              descripcion: producto.descripcion,
              cantidad: 1
            }
          ];
        }

        const sumaTotal = nuevos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        setTotal(sumaTotal);

        return nuevos;
      });
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el producto, QR inválido o producto no existe");
    }
  };

  // Modificar cantidad manualmente
  const cambiarCantidad = (id_producto, cantidad) => {
    if (cantidad < 1) return;
    const nuevos = productosEnVenta.map((p) =>
      p.id_producto === id_producto ? { ...p, cantidad } : p
    );
    setProductosEnVenta(nuevos);
    setTotal(nuevos.reduce((sum, p) => sum + p.precio * p.cantidad, 0));
  };

  const confirmarVenta = async () => {
    if (!ability.can("create", "Venta")) return alert("No tienes permisos");

    if (productosEnVenta.length === 0) return alert("No hay productos en la venta");

    if (!cliente.ci || !cliente.nombre || !cliente.apellido) {
      return alert("Debe completar los datos del cliente");
    }

    const datos = {
      metodo_pago: metodoPago,
      total,
      detalles: productosEnVenta,
      cliente
    };

    try {
      const res = await crearVenta(datos);
      alert(`Venta creada ID: ${res.id_venta}`);
      await verVenta(res.id_venta);

      // Limpiar formulario
      setProductosEnVenta([]);
      setMetodoPago("efectivo");
      setTotal(0);
      setCliente({ ci: "", nombre: "", apellido: "", celular: "" });
      cargarVentas();
    } catch (err) {
      console.error(err);
      alert("Error al crear la venta");
    }
  };

  const imprimirComprobante = () => {
    if (!ventaSeleccionada) return;

    const contenido = comprobanteRef.current.innerHTML;
    const ventana = window.open("", "_blank");

    ventana.document.write(`
      <html>
        <head>
          <title>Comprobante de Venta</title>
          <meta charset="utf-8" />
        </head>
        <body>
          ${contenido}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Gestión de Ventas</h2>

      {/* AGREGAR PRODUCTOS Y CLIENTE */}
      {ability.can("create", "Venta") && (
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Agregar producto por QR</h3>
          <input
            type="text"
            placeholder="Escanea o pega el QR y presiona Enter"
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                agregarProductoQR(e.target.value);
                e.target.value = "";
              }
            }}
          />

          {/* Datos del cliente */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700">Cliente</h4>
            <input
              type="text"
              placeholder="CI"
              value={cliente.ci}
              onChange={(e) => setCliente({ ...cliente, ci: e.target.value })}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Nombre"
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={cliente.apellido}
              onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Celular"
              value={cliente.celular}
              onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
              className="w-full border rounded-lg p-2 mb-2"
            />
          </div>

          {/* Método de pago */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Método de pago:</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="border rounded-lg p-2 w-full"
            >
              <option value="efectivo">Efectivo</option>
              <option value="qr">QR</option>
            </select>
          </div>

          {/* Lista de productos en la venta */}
          <div className="max-h-60 overflow-y-auto border rounded-lg mb-2">
            <ul>
              {productosEnVenta.map((p, i) => (
                <li key={i} className="border-b py-2 px-3 flex justify-between items-center">
                  <div>
                    {p.descripcion} (Bs {Number(p.precio).toFixed(2)})
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={p.cantidad}
                      onChange={(e) => cambiarCantidad(p.id_producto, parseInt(e.target.value))}
                      className="w-16 border rounded-lg p-1 text-center"
                    />
                    <span className="font-semibold">
                      Bs {(p.precio * p.cantidad).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end mt-2 font-semibold text-lg">
            Total: Bs {Number(total).toFixed(2)}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={confirmarVenta}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Confirmar Venta
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE VENTAS */}
      {ability.can("read", "Venta") && (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Lista de ventas</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <ul className="space-y-2">
                {ventas.map((v) => (
                  <li
                    key={v.id_venta}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <span className="text-gray-700">
                      ID: {v.id_venta} | Bs {Number(v.total).toFixed(2)} | {v.nombre_usuario} | {v.metodo_pago}
                    </span>
                    <button
                      onClick={() => verVenta(v.id_venta)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg"
                    >
                      Ver detalles
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* DETALLES Y COMPROBANTE */}
      {ventaSeleccionada && (
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-700">
            Detalles Venta #{ventaSeleccionada.id_venta}
          </h4>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <ul>
              {ventaSeleccionada.detalles.map((d) => (
                <li
                  key={d.id_detalle}
                  className="border-b py-2 px-3 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium">{d.nombre_producto}</p>
                    <p className="text-sm text-gray-500">{d.categoria} - {d.color} | Cant: {d.cantidad || 1}</p>
                  </div>
                  <span className="font-semibold">Bs {(d.precio * (d.cantidad || 1)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={imprimirComprobante}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Imprimir Comprobante
            </button>
          </div>

          <div className="hidden">
            <ComprobanteVenta ref={comprobanteRef} venta={ventaSeleccionada} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;
