import { useEffect, useState, useContext } from "react";
import { AbilityContext } from "../context/AbilityContext";
import { AuthContext } from "../context/AuthContext";
import { obtenerUsuarios, cambiarEstadoUsuario } from "../services/usuario";
import UsuarioForm from "../pages/Usuario/UsuarioForm.jsx";
import {
  Users, Plus, Pencil, Search, X, Filter,
  ChevronDown, ChevronUp, ArrowLeft, CheckCircle,
  AlertCircle, Shield, LayoutGrid, LayoutList,
  ToggleLeft, ToggleRight, AlertTriangle,
} from "lucide-react";

const Usuarios = () => {
  const ability = useContext(AbilityContext);
  const { usuario: usuarioActual } = useContext(AuthContext);

  const [usuarios,        setUsuarios]        = useState([]);
  const [modoFormulario,  setModoFormulario]  = useState(false);
  const [usuarioEdit,     setUsuarioEdit]     = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [loading,         setLoading]         = useState(true);
  const [filterRole,      setFilterRole]      = useState("todos");
  const [filterStatus,    setFilterStatus]    = useState("todos");
  const [showFilters,     setShowFilters]     = useState(false);
  const [viewMode,        setViewMode]        = useState("grid");
  const [exito,           setExito]           = useState("");
  const [error,           setError]           = useState("");
  const [confirmarToggle, setConfirmarToggle] = useState(null); // { id, nombre, activo }
  const [toggling,        setToggling]        = useState(false);

  const mostrarError = (msg) => { setError(msg);  setTimeout(() => setError(""),  4000); };
  const mostrarExito = (msg) => { setExito(msg);  setTimeout(() => setExito(""),  3000); };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const { data } = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      mostrarError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ability.can("manage", "Usuario")) cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSuccess = () => {
    cargarUsuarios();
    setModoFormulario(false);
    setUsuarioEdit(null);
    mostrarExito(usuarioEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
  };

  const handleCloseForm = () => { setModoFormulario(false); setUsuarioEdit(null); };

  const confirmarYToggle = async () => {
    if (!confirmarToggle) return;
    setToggling(true);
    try {
      await cambiarEstadoUsuario(confirmarToggle.id);
      setConfirmarToggle(null);
      await cargarUsuarios();
      mostrarExito(`Usuario ${confirmarToggle.activo ? "desactivado" : "activado"} correctamente`);
    } catch (err) {
      console.error(err);
      mostrarError("Error al cambiar el estado del usuario");
      setConfirmarToggle(null);
    } finally {
      setToggling(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase())   ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.usuario.toLowerCase().includes(searchTerm.toLowerCase())  ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole   = filterRole   === "todos" || u.nombre_rol === filterRole;
    const matchesStatus =
      filterStatus === "todos" ||
      (filterStatus === "activos"   && u.activo)  ||
      (filterStatus === "inactivos" && !u.activo);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const rolesUnicos = [...new Set(usuarios.map(u => u.nombre_rol))];
  const limpiarFiltros = () => { setFilterRole("todos"); setFilterStatus("todos"); setSearchTerm(""); setShowFilters(false); };
  const hayFiltrosActivos = filterRole !== "todos" || filterStatus !== "todos" || searchTerm;
  const iniciales = (u) => `${u.nombre[0] || ""}${u.apellido[0] || ""}`.toUpperCase();

  // ── Vista formulario ────────────────────────────────────────────────────
  if (modoFormulario) {
    return (
      <div className="space-y-4 pb-20 sm:pb-0 animate-fade-in">
        <button
          onClick={handleCloseForm}
          className="flex items-center gap-2 text-[#003087] hover:opacity-70 font-semibold text-sm transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-[#003087]">
              {usuarioEdit ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {usuarioEdit
                ? "Modifica la información del usuario existente"
                : "Completa todos los campos para registrar un nuevo usuario"}
            </p>
          </div>
          <UsuarioForm usuarioEdit={usuarioEdit} onClose={handleCloseForm} onSuccess={handleFormSuccess} />
        </div>
      </div>
    );
  }

  // ── Sin permisos ────────────────────────────────────────────────────────
  if (!ability.can("manage", "Usuario")) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#C8102E]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Acceso Denegado</h3>
          <p className="text-slate-500 text-sm">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  // ── Vista lista ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-5 pb-20 sm:pb-0 animate-fade-in">

      {/* Banner error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#C8102E] text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Banner éxito */}
      {exito && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{exito}</span>
          <button onClick={() => setExito("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modal confirmar toggle */}
      {confirmarToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {confirmarToggle.activo ? "Desactivar usuario" : "Activar usuario"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ¿{confirmarToggle.activo ? "Desactivar" : "Activar"} a{" "}
                  <strong>"{confirmarToggle.nombre}"</strong>?
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmarToggle(null)}
                disabled={toggling}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarYToggle}
                disabled={toggling}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
                  confirmarToggle.activo
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {toggling
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : confirmarToggle.activo
                    ? <ToggleLeft  className="w-4 h-4" />
                    : <ToggleRight className="w-4 h-4" />
                }
                {toggling
                  ? "Guardando…"
                  : confirmarToggle.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight leading-tight">
              Gestión de Usuarios
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? "s" : ""} encontrado{filteredUsuarios.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle vista */}
          <div className="bg-white rounded-xl border border-slate-200 p-1 flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#003087] text-white" : "text-slate-500 hover:text-slate-800"}`}
              title="Vista cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#003087] text-white" : "text-slate-500 hover:text-slate-800"}`}
              title="Vista lista"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { setUsuarioEdit(null); setModoFormulario(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded-xl text-sm font-bold hover:bg-[#003087]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",   value: usuarios.length,                           color: "#003087", bg: "bg-[#003087]/5",  border: "border-[#003087]/10" },
          { label: "Activos", value: usuarios.filter(u => u.activo).length,     color: "#16a34a", bg: "bg-green-50",     border: "border-green-100"    },
          { label: "Roles",   value: rolesUnicos.length,                        color: "#d97706", bg: "bg-amber-50",     border: "border-amber-100"    },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 border ${s.border}`}>
            <div className="text-xl sm:text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Buscar + filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, usuario o correo…"
              className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition placeholder-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} className="flex items-center gap-1 text-xs text-[#C8102E] hover:opacity-70 font-semibold transition-opacity">
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Rol</label>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition bg-white"
                >
                  <option value="todos">Todos los roles</option>
                  {rolesUnicos.map(rol => <option key={rol} value={rol}>{rol}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Estado</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition bg-white"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 border-4 border-[#003087] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Cargando usuarios…</p>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && filteredUsuarios.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-800 font-bold text-base">Sin usuarios</p>
          <p className="text-slate-500 text-sm mt-1 mb-5">
            {hayFiltrosActivos
              ? "Ningún usuario coincide con los filtros actuales"
              : "Aún no hay usuarios registrados"}
          </p>
          {hayFiltrosActivos ? (
            <button onClick={limpiarFiltros} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold">
              <X className="w-4 h-4" /> Limpiar filtros
            </button>
          ) : (
            <button
              onClick={() => { setUsuarioEdit(null); setModoFormulario(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003087] text-white rounded-xl text-sm font-bold hover:bg-[#003087]/90 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Crear primer usuario
            </button>
          )}
        </div>
      )}

      {/* ── Vista Grid ── */}
      {!loading && filteredUsuarios.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsuarios.map((u, idx) => (
            <div
              key={u.id_usuario}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${idx * 35}ms` }}
            >
              {/* Franja superior con color de estado */}
              <div className={`h-1.5 ${u.activo ? "bg-[#003087]" : "bg-slate-300"}`} />

              <div className="p-5">
                {/* Avatar + datos */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#003087] flex items-center justify-center text-white font-extrabold text-sm shrink-0 select-none">
                    {iniciales(u)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                      {u.nombre} {u.apellido}
                    </p>
                    <p className="text-xs text-slate-500 truncate">@{u.usuario}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{u.correo}</p>
                  </div>
                </div>

                {/* CI + rol */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-500">
                    CI: <span className="font-semibold text-slate-700">{u.ci}</span>
                  </p>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#003087]/10 text-[#003087]">
                    {u.nombre_rol}
                  </span>
                </div>

                {/* Estado + toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${u.activo ? "bg-green-500" : "bg-slate-300"}`} />
                    <span className={`text-xs font-semibold ${u.activo ? "text-green-600" : "text-slate-500"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  {u.id_usuario === usuarioActual?.id_usuario ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed" title="No puedes desactivar tu propia cuenta">
                      Tú
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmarToggle({ id: u.id_usuario, nombre: u.usuario, activo: u.activo })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        u.activo
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </div>

                {/* Editar */}
                <button
                  onClick={() => { setUsuarioEdit(u); setModoFormulario(true); }}
                  className="w-full py-2 rounded-xl bg-[#003087]/8 text-[#003087] hover:bg-[#003087] hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#003087]/10"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar usuario
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Vista Lista ── */}
      {!loading && filteredUsuarios.length > 0 && viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-bold">Usuario</th>
                  <th className="px-4 py-3 font-bold hidden md:table-cell">Información</th>
                  <th className="px-4 py-3 font-bold">Rol</th>
                  <th className="px-4 py-3 font-bold text-center">Estado</th>
                  <th className="px-4 py-3 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsuarios.map(u => (
                  <tr key={u.id_usuario} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#003087] flex items-center justify-center text-white font-extrabold text-xs shrink-0 select-none">
                          {iniciales(u)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm">@{u.usuario}</p>
                          <p className="text-xs text-slate-500 truncate">{u.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm font-semibold text-slate-700">{u.nombre} {u.apellido}</p>
                      <p className="text-xs text-slate-500">CI: {u.ci}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#003087]/10 text-[#003087]">
                        {u.nombre_rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        u.activo
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? "bg-green-500" : "bg-slate-400"}`} />
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => { setUsuarioEdit(u); setModoFormulario(true); }}
                          className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white flex items-center justify-center transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {u.id_usuario === usuarioActual?.id_usuario ? (
                          <div
                            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center cursor-not-allowed"
                            title="No puedes desactivar tu propia cuenta"
                          >
                            <ToggleRight className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmarToggle({ id: u.id_usuario, nombre: u.usuario, activo: u.activo })}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              u.activo
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white"
                                : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white"
                            }`}
                            title={u.activo ? "Desactivar" : "Activar"}
                          >
                            {u.activo
                              ? <ToggleLeft  className="w-3.5 h-3.5" />
                              : <ToggleRight className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        `
      }} />
    </div>
  );
};

export default Usuarios;
