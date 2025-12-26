import { useEffect, useState } from "react";
import {
  listarCategorias,
  listarColores,
  listarTallas
} from "../../services/atributos";
import { crearProducto, actualizarProducto } from "../../services/producto";

const FormularioProducto = ({ producto, onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  const [form, setForm] = useState({
    id_categoria: "",
    id_color: "",
    id_talla: "",
    precio: "",
    descripcion: "",
    stock: 1
  });

  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    listarCategorias().then(setCategorias);
    listarColores().then(setColores);
    listarTallas().then(setTallas);

    if (producto) {
      setForm({
        id_categoria: producto.id_categoria,
        id_color: producto.id_color,
        id_talla: producto.id_talla,
        precio: producto.precio,
        descripcion: producto.descripcion,
        stock: producto.stock
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    imagenes.forEach(img => fd.append("imagenes", img));

    if (producto) {
      await actualizarProducto(producto.id_producto, fd);
    } else {
      await crearProducto(fd);
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 w-full max-w-lg rounded shadow"
      >
        <h3 className="text-xl font-bold mb-4">
          {producto ? "Editar Producto" : "Nuevo Producto"}
        </h3>

        <select name="id_categoria" onChange={handleChange} value={form.id_categoria} required className="w-full mb-2 border p-2">
          <option value="">Categoría</option>
          {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>

        <select name="id_color" onChange={handleChange} value={form.id_color} required className="w-full mb-2 border p-2">
          <option value="">Color</option>
          {colores.map(c => <option key={c.id_color} value={c.id_color}>{c.nombre}</option>)}
        </select>

        <select name="id_talla" onChange={handleChange} value={form.id_talla} required className="w-full mb-2 border p-2">
          <option value="">Talla</option>
          {tallas.map(t => <option key={t.id_talla} value={t.id_talla}>{t.nombre}</option>)}
        </select>

        <input
          name="descripcion"
          placeholder="Descripción"
          onChange={handleChange}
          value={form.descripcion}
          className="w-full mb-2 border p-2"
          required
        />

        <input
          name="precio"
          type="number"
          step="0.01"
          placeholder="Precio"
          onChange={handleChange}
          value={form.precio}
          className="w-full mb-2 border p-2"
          required
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          onChange={handleChange}
          value={form.stock}
          className="w-full mb-2 border p-2"
        />

        <input
          type="file"
          multiple
          onChange={(e) => setImagenes([...e.target.files])}
          className="w-full mb-4"
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioProducto;
