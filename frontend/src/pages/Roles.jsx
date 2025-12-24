// src/pages/Roles.jsx
import React, { useState, useEffect, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import {
  listarRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
  obtenerRol,
} from "../services/rol";

const Roles = () => {
  const ability = useContext(AbilityContext);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [permisos, setPermisos] = useState([]); // array de id_permiso
  const [permisosDisponibles, setPermisosDisponibles] = useState([
    { id_permiso: 1, nombre: "create" },
    { id_permiso: 2, nombre: "read" },
    { id_permiso: 3, nombre: "update" },
    { id_permiso: 4, nombre: "delete" },
  ]); // Puedes cargar desde API si tienes tabla de permisos

  useEffect(() => {
    if (ability.can("manage", "Rol")) cargarRoles();
  }, [ability]);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const data = await listarRoles();
      setRoles(data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar roles");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setEditingRol(null);
    setNombre("");
    setPermisos([]);
    setModalOpen(true);
  };

  const abrirModalEditar = async (id_rol) => {
    try {
      const rol = await obtenerRol(id_rol);
      setEditingRol(rol.id_rol);
      setNombre(rol.nombre);
      setPermisos(rol.permisos.map((p) => p.id_permiso));
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Error al obtener rol");
    }
  };

  const guardarRol = async () => {
    if (!nombre) return alert("Debe ingresar un nombre de rol");

    const datos = { nombre, permisos };

    try {
      if (editingRol) {
        await actualizarRol(editingRol, datos);
        alert("Rol actualizado correctamente");
      } else {
        await crearRol(datos);
        alert("Rol creado correctamente");
      }
      setModalOpen(false);
      cargarRoles();
    } catch (err) {
      console.error(err);
      alert("Error al guardar rol");
    }
  };

  const eliminar = async (id_rol) => {
    if (!window.confirm("¿Está seguro de eliminar este rol?")) return;
    try {
      await eliminarRol(id_rol);
      alert("Rol eliminado correctamente");
      cargarRoles();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar rol");
    }
  };

  const togglePermiso = (id_permiso) => {
    setPermisos((prev) =>
      prev.includes(id_permiso)
        ? prev.filter((p) => p !== id_permiso)
        : [...prev, id_permiso]
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Gestión de Roles</h2>

      {ability.can("manage", "Rol") && (
        <button
          onClick={abrirModalCrear}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Nuevo Rol
        </button>
      )}

      {/* LISTA DE ROLES */}
      {loading ? (
        <p>Cargando roles...</p>
      ) : (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr key={rol.id_rol} className="border-b">
                  <td className="px-4 py-2">{rol.id_rol}</td>
                  <td className="px-4 py-2">{rol.nombre}</td>
                  <td className="px-4 py-2 space-x-2">
                    {ability.can("manage", "Rol") && (
                      <>
                        <button
                          onClick={() => abrirModalEditar(rol.id_rol)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(rol.id_rol)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingRol ? "Editar Rol" : "Nuevo Rol"}
            </h3>

            <input
              type="text"
              placeholder="Nombre del rol"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />

            <div className="mb-4">
              <p className="font-semibold mb-2">Permisos</p>
              <div className="flex flex-wrap gap-2">
                {permisosDisponibles.map((p) => (
                  <label
                    key={p.id_permiso}
                    className="flex items-center gap-1 border rounded px-2 py-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permisos.includes(p.id_permiso)}
                      onChange={() => togglePermiso(p.id_permiso)}
                    />
                    {p.nombre}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={guardarRol}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
