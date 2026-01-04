import { useEffect, useState } from "react";
import { listarColores, crearColor, actualizarColor, eliminarColor } from "../../services/atributos";

const Colores = () => {
  const [colores, setColores] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchColores = async () => {
    const data = await listarColores();
    setColores(data);
  };

  useEffect(() => {
    fetchColores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await actualizarColor(editId, { nombre });
      setEditId(null);
    } else {
      await crearColor({ nombre });
    }
    setNombre("");
    fetchColores();
  };

  const handleEdit = (color) => {
    setEditId(color.id_color);
    setNombre(color.nombre);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar este color?")) {
      await eliminarColor(id);
      fetchColores();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre color"
          className="border px-2 py-1 rounded flex-1"
          required
        />
        <button type="submit" className="bg-yellow-500 text-white px-4 py-1 rounded">
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <ul className="space-y-2">
        {colores.map(c => (
          <li key={c.id_color} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span>{c.nombre}</span>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(c)} className="text-blue-500">Editar</button>
              <button onClick={() => handleDelete(c.id_color)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Colores;
