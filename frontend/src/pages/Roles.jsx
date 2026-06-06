import { useState, useEffect, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import {
  listarRoles, crearRol, actualizarRol, eliminarRol,
  obtenerRol, listarPermisos,
} from "../services/rol";
import {
  ShieldCheck, Shield, Plus, Pencil, Trash2, ArrowLeft,
  Save, Check, CheckSquare, Square, AlertTriangle, X,
} from "lucide-react";

const Roles = () => {
  const ability = useContext(AbilityContext);

  const [roles, setRoles]                     = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [formOpen, setFormOpen]               = useState(false);
  const [editingRol, setEditingRol]           = useState(null);
  const [nombre, setNombre]                   = useState("");
  const [permisos, setPermisos]               = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [submitting, setSubmitting]           = useState(false);
  const [confirmar, setConfirmar]             = useState(null); // { id, nombre }
  const [eliminando, setEliminando]           = useState(false);
  const [error, setError]                     = useState("");
  const [exito, setExito]                     = useState("");

  const mostrarError = (msg) => { setError(msg); setTimeout(() => setError(""), 4000); };
  const mostrarExito = (msg) => { setExito(msg); setTimeout(() => setExito(""), 3000); };

  useEffect(() => {
    if (ability.can("manage", "Rol")) {
      cargarRoles();
      cargarPermisos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      setRoles(await listarRoles());
    } catch { mostrarError("Error al cargar roles"); }
    finally { setLoading(false); }
  };

  const cargarPermisos = async () => {
    try {
      setPermisosDisponibles(await listarPermisos());
    } catch { mostrarError("Error al cargar permisos"); }
  };

  const abrirCrear = () => {
    setEditingRol(null);
    setNombre("");
    setPermisos([]);
    setFormOpen(true);
  };

  const abrirEditar = async (id_rol) => {
    try {
      const rol = await obtenerRol(id_rol);
      setEditingRol(rol.id_rol);
      setNombre(rol.nombre);
      setPermisos(rol.permisos.map((p) => p.id_permiso));
      setFormOpen(true);
    } catch { mostrarError("Error al obtener el rol"); }
  };

  const guardarRol = async () => {
    if (!nombre.trim())      return mostrarError("Debe ingresar un nombre de rol");
    if (!permisos.length)    return mostrarError("Debe asignar al menos un permiso");
    setSubmitting(true);
    try {
      if (editingRol) {
        await actualizarRol(editingRol, { nombre, permisos });
        mostrarExito("Rol actualizado correctamente");
      } else {
        await crearRol({ nombre, permisos });
        mostrarExito("Rol creado correctamente");
      }
      setFormOpen(false);
      cargarRoles();
    } catch { mostrarError("Error al guardar el rol"); }
    finally { setSubmitting(false); }
  };

  const handleEliminar = async () => {
    if (!confirmar) return;
    setEliminando(true);
    try {
      await eliminarRol(confirmar.id);
      mostrarExito(`Rol "${confirmar.nombre}" eliminado`);
      setConfirmar(null);
      cargarRoles();
    } catch {
      mostrarError("Error al eliminar. El rol puede estar asignado a usuarios.");
      setConfirmar(null);
    } finally { setEliminando(false); }
  };

  const togglePermiso = (id) =>
    setPermisos((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  // Agrupar por módulo: 'productos.create' → { productos: [...] }
  const permisosAgrupados = permisosDisponibles.reduce((acc, p) => {
    const [modulo, accion] = p.nombre.split(".");
    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push({ ...p, accion });
    return acc;
  }, {});

  /* ── Acceso denegado ───────────────────────────────────────────── */
  if (!ability.can("manage", "Rol")) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#C8102E]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Acceso Denegado</h3>
          <p className="text-slate-500 text-sm">No tienes permisos para gestionar roles.</p>
        </div>
      </div>
    );
  }

  /* ── Render principal ──────────────────────────────────────────── */
  return (
    <div className="space-y-5 pb-20 sm:pb-0 animate-fade-in">

      {/* Banners auto-dismiss */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="hover:text-red-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {exito && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span className="flex-1">{exito}</span>
          <button onClick={() => setExito("")} className="hover:text-emerald-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!formOpen ? (
        <>
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight leading-tight">
                  Roles y Permisos
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  {roles.length} {roles.length === 1 ? "rol registrado" : "roles registrados"}
                </p>
              </div>
            </div>
            <button
              onClick={abrirCrear}
              className="flex items-center justify-center gap-2 bg-[#FFCD00] hover:bg-[#e6b800] text-[#003087] font-bold px-5 py-3 sm:py-2.5 rounded-xl shadow-sm shadow-[#FFCD00]/30 transition-all active:scale-95 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Nuevo Rol
            </button>
          </div>

          {/* ── Lista ── */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No hay roles registrados.</p>
              <p className="text-slate-400 text-xs mt-1">Crea uno nuevo para comenzar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((rol, idx) => (
                <div
                  key={rol.id_rol}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${idx * 45}ms` }}
                >
                  <div className="h-1.5 bg-[#003087]" />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-[#003087]/5 border border-[#003087]/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-extrabold text-[#003087] leading-none">
                          {rol.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 capitalize truncate">{rol.nombre}</h3>
                        <span className="text-xs text-slate-400 font-medium">ID #{rol.id_rol}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(rol.id_rol)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold text-[#003087] bg-[#003087]/5 hover:bg-[#003087]/10 border border-[#003087]/15 hover:border-[#003087]/30 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar Permisos
                      </button>
                      <button
                        onClick={() => setConfirmar({ id: rol.id_rol, nombre: rol.nombre })}
                        className="w-10 h-10 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-xl text-red-500 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 transition-all"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Formulario inline ── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">

          {/* Header del form */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-3">
            <button
              onClick={() => setFormOpen(false)}
              className="w-9 h-9 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center shrink-0">
              {editingRol
                ? <Pencil className="w-3.5 h-3.5 text-white" />
                : <Plus className="w-3.5 h-3.5 text-white" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                {editingRol ? "Editar Rol" : "Nuevo Rol"}
              </h3>
              <p className="text-xs text-slate-400 hidden sm:block">Nombre y permisos de acceso</p>
            </div>
            {permisos.length > 0 && (
              <span className="shrink-0 text-xs font-bold bg-[#003087]/10 text-[#003087] px-2.5 py-1 rounded-lg">
                {permisos.length} permisos
              </span>
            )}
          </div>

          {/* Cuerpo */}
          <div className="p-5 space-y-6">

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nombre del Rol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Administrador, Cajero, Vendedor…"
                maxLength={80}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003087]/25 focus:border-[#003087] transition-all"
              />
            </div>

            {/* Permisos agrupados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Permisos del Sistema <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  {permisos.length} / {permisosDisponibles.length} seleccionados
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {Object.entries(permisosAgrupados).map(([modulo, perms]) => {
                  const todosOn  = perms.every((p) => permisos.includes(p.id_permiso));
                  const algunoOn = perms.some((p) => permisos.includes(p.id_permiso));

                  const toggleModulo = () => {
                    if (todosOn) {
                      setPermisos((prev) => prev.filter((id) => !perms.some((p) => p.id_permiso === id)));
                    } else {
                      const nuevos = perms.map((p) => p.id_permiso).filter((id) => !permisos.includes(id));
                      setPermisos((prev) => [...prev, ...nuevos]);
                    }
                  };

                  return (
                    <div
                      key={modulo}
                      className={`p-4 transition-colors ${
                        todosOn ? "bg-[#003087]/[0.03]" : algunoOn ? "bg-amber-50/40" : "bg-white"
                      }`}
                    >
                      {/* Cabecera del módulo */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700 capitalize">{modulo}</span>
                          {todosOn && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#003087] text-white">
                              COMPLETO
                            </span>
                          )}
                          {!todosOn && algunoOn && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                              PARCIAL
                            </span>
                          )}
                        </div>
                        <button
                          onClick={toggleModulo}
                          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                            todosOn
                              ? "bg-[#003087] text-white hover:bg-[#002266]"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {todosOn
                            ? <CheckSquare className="w-3 h-3" />
                            : <Square className="w-3 h-3" />
                          }
                          {todosOn ? "Desmarcar" : "Marcar todo"}
                        </button>
                      </div>

                      {/* Chips de permisos */}
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p) => {
                          const on = permisos.includes(p.id_permiso);
                          return (
                            <button
                              key={p.id_permiso}
                              onClick={() => togglePermiso(p.id_permiso)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all select-none ${
                                on
                                  ? "bg-[#003087] text-white border-[#003087] shadow-sm"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-[#003087]/40 hover:text-[#003087]"
                              }`}
                            >
                              {on
                                ? <Check className="w-3 h-3 shrink-0" />
                                : <div className="w-3 h-3 rounded border border-current shrink-0 opacity-50" />
                              }
                              {p.accion.charAt(0).toUpperCase() + p.accion.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer del form */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <button
              onClick={() => setFormOpen(false)}
              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              onClick={guardarRol}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#003087] hover:bg-[#002266] disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm w-full sm:w-auto"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {submitting ? "Guardando…" : "Guardar Rol"}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal de confirmación eliminar ── */}
      {confirmar && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[#C8102E]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-1">¿Eliminar rol?</h3>
            <p className="text-slate-500 text-sm text-center mb-5">
              El rol{" "}
              <span className="font-bold text-slate-700">"{confirmar.nombre}"</span>{" "}
              será eliminado permanentemente. Si está asignado a usuarios no podrá completarse.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                disabled={eliminando}
                className="flex-1 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C8102E] hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all text-sm"
              >
                {eliminando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {eliminando ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
      `}} />
    </div>
  );
};

export default Roles;
