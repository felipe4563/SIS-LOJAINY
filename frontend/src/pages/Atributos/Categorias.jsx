import { useEffect, useState } from "react";
import { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../services/atributos";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchCategorias = async () => {
    const data = await listarCategorias();
    setCategorias(data);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await actualizarCategoria(editId, { nombre });
      setEditId(null);
    } else {
      await crearCategoria({ nombre });
    }
    setNombre("");
    fetchCategorias();
  };

  const handleEdit = (categoria) => {
    setEditId(categoria.id_categoria);
    setNombre(categoria.nombre);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar esta categoría?")) {
      await eliminarCategoria(id);
      fetchCategorias();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre categoría"
          className="border px-2 py-1 rounded flex-1"
          required
        />
        <button type="submit" className="bg-yellow-500 text-white px-4 py-1 rounded">
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <ul className="space-y-2">
        {categorias.map(cat => (
          <li key={cat.id_categoria} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span>{cat.nombre}</span>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)} className="text-blue-500">Editar</button>
              <button onClick={() => handleDelete(cat.id_categoria)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categorias;
