import { useState, useEffect } from "react";
import {
  listarMarcas,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
} from "../../services/atributos";

const Marcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id de marca en edición
  const [nombre, setNombre] = useState("");

  // 🔄 Cargar marcas
  const fetchMarcas = async () => {
    try {
      setLoading(true);
      const data = await listarMarcas();
      setMarcas(data);
    } catch (err) {
      console.error("Error al listar marcas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  // 📝 Crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await actualizarMarca(editing, { nombre });
      } else {
        await crearMarca({ nombre });
      }
      setNombre("");
      setEditing(null);
      fetchMarcas();
    } catch (err) {
      console.error("Error al guardar marca:", err);
    }
  };

  // ✏️ Editar
  const handleEdit = (marca) => {
    setEditing(marca.id_marca);
    setNombre(marca.nombre);
  };

  // ❌ Eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta marca?")) return;
    try {
      await eliminarMarca(id);
      fetchMarcas();
    } catch (err) {
      console.error("Error al eliminar marca:", err);
    }
  };

  if (loading) return <p>Cargando marcas...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Marcas</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la marca"
          className="border px-2 py-1 rounded flex-1"
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-1 rounded"
        >
          {editing ? "Actualizar" : "Crear"}
        </button>
        {editing && (
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-1 rounded"
            onClick={() => {
              setEditing(null);
              setNombre("");
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista */}
      {marcas.length === 0 ? (
        <p>No hay marcas registradas</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
           
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca) => (
              <tr key={marca.id_marca}>
            
                <td className="border px-2 py-1">{marca.nombre}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(marca)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(marca.id_marca)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Marcas;
