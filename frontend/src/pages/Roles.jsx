// src/pages/Roles.jsx
import React, { useState, useEffect, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import {
  listarRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
  obtenerRol,
  listarPermisos
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
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);

  useEffect(() => {
    if (ability.can("manage", "Rol")) {
      cargarRoles();
      cargarPermisos();
    }
  }, [ability]);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const data = await listarRoles();
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarPermisos = async () => {
    try {
      const data = await listarPermisos();
      setPermisosDisponibles(data);
    } catch (err) {
      console.error("Error al cargar permisos:", err);
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
    if (!nombre.trim()) return alert("Debe ingresar un nombre de rol");
    if (permisos.length === 0) return alert("Debe asignar al menos un permiso");

    const datos = { nombre, permisos };

    try {
      if (editingRol) {
        await actualizarRol(editingRol, datos);
      } else {
        await crearRol(datos);
      }
      setModalOpen(false);
      cargarRoles();
    } catch (err) {
      console.error(err);
      alert("Error al guardar rol");
    }
  };

  const eliminar = async (id_rol) => {
    if (!window.confirm("¿Está seguro de eliminar este rol? Esta acción no se puede deshacer.")) return;
    try {
      await eliminarRol(id_rol);
      cargarRoles();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar rol. Es posible que el rol esté asignado a usuarios.");
    }
  };

  const togglePermiso = (id_permiso) => {
    setPermisos((prev) =>
      prev.includes(id_permiso)
        ? prev.filter((p) => p !== id_permiso)
        : [...prev, id_permiso]
    );
  };

  // Agrupar permisos por módulo (ej: 'productos.create' -> grupo 'productos')
  const permisosAgrupados = permisosDisponibles.reduce((acc, p) => {
    const [modulo, accion] = p.nombre.split('.');
    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push({ ...p, accion });
    return acc;
  }, {});

  if (!ability.can("manage", "Rol")) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2">No tienes permisos para gestionar roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-0">
      {!modalOpen ? (
        <>
          {/* Header de la sección */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight">Gestión de Roles y Permisos</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Crea roles y asigna niveles de acceso para tus usuarios.</p>
            </div>
            <button
              onClick={abrirModalCrear}
              className="flex justify-center items-center gap-2 bg-[#FFCD00] hover:bg-[#e6b800] text-[#003087] font-bold px-5 py-3 sm:py-2.5 rounded-xl shadow-md shadow-[#FFCD00]/20 transition-all active:scale-95 w-full sm:w-auto"
            >
              <span>➕</span>
              <span>Nuevo Rol</span>
            </button>
          </div>

          {/* LISTA DE ROLES */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#003087]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {roles.map((rol) => (
                <div key={rol.id_rol} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Adorno superior azul */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#003087]"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#003087]/5 text-[#003087] flex items-center justify-center text-xl sm:text-2xl font-bold border border-[#003087]/10 shrink-0">
                        {rol.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 capitalize truncate">{rol.nombre}</h3>
                        <p className="text-xs text-slate-500 font-medium">ID: {rol.id_rol}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 flex items-center gap-2">
                    <button
                      onClick={() => abrirModalEditar(rol.id_rol)}
                      className="flex-1 bg-slate-50 hover:bg-[#003087]/5 text-[#003087] border border-slate-200 hover:border-[#003087]/30 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Editar Permisos
                    </button>
                    <button
                      onClick={() => eliminar(rol.id_rol)}
                      className="w-11 h-11 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 rounded-lg transition-colors"
                      title="Eliminar Rol"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="col-span-full py-10 sm:py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed mx-2 sm:mx-0">
                  <span className="block text-3xl mb-2">📋</span>
                  <p className="text-sm sm:text-base">No hay roles registrados. Crea uno nuevo para comenzar.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* VISTA FORMULARIO CREAR / EDITAR (INLINE) */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          {/* Header del formulario */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
            <button 
              onClick={() => setModalOpen(false)} 
              className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
              title="Volver a la lista"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {editingRol ? "Editar Rol" : "Crear Nuevo Rol"}
              </h3>
              <p className="text-sm text-slate-500 font-medium">Configura el nombre y los permisos de acceso.</p>
            </div>
          </div>

          {/* Cuerpo del formulario */}
          <div className="p-6">
            {/* Campo de Nombre */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Rol <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Ej: Administrador, Cajero..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-[#003087] transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Lista de Permisos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-800">Permisos del Sistema</h4>
                <span className="text-xs font-bold bg-[#003087]/10 text-[#003087] px-2.5 py-1 rounded-md">
                  {permisos.length} seleccionados
                </span>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {Object.entries(permisosAgrupados).map(([modulo, perms], index) => {
                  const todosSeleccionados = perms.every(p => permisos.includes(p.id_permiso));
                  
                  const toggleAllModulo = () => {
                    if (todosSeleccionados) {
                      setPermisos(prev => prev.filter(id => !perms.some(p => p.id_permiso === id)));
                    } else {
                      const nuevosIds = perms.map(p => p.id_permiso).filter(id => !permisos.includes(id));
                      setPermisos(prev => [...prev, ...nuevosIds]);
                    }
                  };

                  return (
                    <div 
                      key={modulo} 
                      className={`flex flex-col sm:flex-row sm:items-center p-4 gap-4 transition-colors ${index !== 0 ? 'border-t border-slate-100' : ''} hover:bg-slate-50`}
                    >
                      {/* Izquierda: Nombre del módulo y botón todos */}
                      <div className="w-full sm:w-1/3 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2 shrink-0">
                        <span className="font-bold text-slate-800 capitalize text-sm flex items-center gap-2">
                          {modulo}
                        </span>
                        <button 
                          onClick={toggleAllModulo}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${todosSeleccionados ? 'bg-[#003087] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                          {todosSeleccionados ? 'DESMARCAR' : 'MARCAR TODO'}
                        </button>
                      </div>
                      
                      {/* Derecha: Checkboxes */}
                      <div className="flex-1 flex flex-wrap gap-2 sm:gap-3">
                        {perms.map((p) => {
                          const isChecked = permisos.includes(p.id_permiso);
                          return (
                            <label
                              key={p.id_permiso}
                              onClick={(e) => {
                                e.preventDefault();
                                togglePermiso(p.id_permiso);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border select-none ${
                                isChecked 
                                ? 'bg-[#003087]/5 border-[#003087] text-[#003087]' 
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                isChecked ? 'bg-[#003087] border-[#003087] text-white' : 'bg-white border-slate-300'
                              }`}>
                                {isChecked && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className={`text-xs sm:text-sm ${isChecked ? 'font-bold' : 'font-medium'}`}>
                                {p.accion.charAt(0).toUpperCase() + p.accion.slice(1)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer del formulario */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-slate-50 shrink-0">
            <button
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarRol}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#003087] hover:bg-[#002266] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Guardar Rol</span>
            </button>
          </div>
        </div>
      )}

      {/* Estilos para animación */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default Roles;
