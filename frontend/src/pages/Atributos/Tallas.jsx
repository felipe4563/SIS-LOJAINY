import { useEffect, useState } from "react";
import { listarTallas, crearTalla, actualizarTalla, eliminarTalla } from "../../services/atributos";

const Tallas = () => {
  const [tallas, setTallas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchTallas = async () => {
    const data = await listarTallas();
    setTallas(data);
  };

  useEffect(() => {
    fetchTallas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await actualizarTalla(editId, { nombre });
      setEditId(null);
    } else {
      await crearTalla({ nombre });
    }
    setNombre("");
    fetchTallas();
  };

  const handleEdit = (talla) => {
    setEditId(talla.id_talla);
    setNombre(talla.nombre);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar esta talla?")) {
      await eliminarTalla(id);
      fetchTallas();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre talla"
          className="border px-2 py-1 rounded flex-1"
          required
        />
        <button type="submit" className="bg-yellow-500 text-white px-4 py-1 rounded">
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <ul className="space-y-2">
        {tallas.map(t => (
          <li key={t.id_talla} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span>{t.nombre}</span>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(t)} className="text-blue-500">Editar</button>
              <button onClick={() => handleDelete(t.id_talla)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tallas;
