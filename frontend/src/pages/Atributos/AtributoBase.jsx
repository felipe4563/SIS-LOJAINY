import { useEffect, useState, useMemo } from "react";
import {
  Search, X, Pencil, Trash2, Plus, Save,
  AlertCircle, CheckCircle, AlertTriangle,
} from "lucide-react";

const AtributoBase = ({
  titulo,
  tituloSingular,
  Icon,
  idKey,
  fetchFn,
  crearFn,
  actualizarFn,
  eliminarFn,
  placeholder,
  maxLength = 100,
}) => {
  const [items,      setItems]      = useState([]);
  const [nombre,     setNombre]     = useState("");
  const [editId,     setEditId]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error,      setError]      = useState("");
  const [exito,      setExito]      = useState("");
  const [confirmar,  setConfirmar]  = useState(null); // { id, nombre }
  const [eliminando, setEliminando] = useState(false);

  const mostrarError = (msg) => { setError(msg);  setTimeout(() => setError(""),  4000); };
  const mostrarExito = (msg) => { setExito(msg);  setTimeout(() => setExito(""),  3000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await fetchFn();
      setItems(data);
    } catch {
      mostrarError(`Error al cargar ${titulo.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtered = useMemo(() =>
    items.filter(it =>
      it.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(it[idKey]).includes(searchTerm)
    ),
  [items, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) { mostrarError("El nombre es obligatorio"); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await actualizarFn(editId, { nombre: nombre.trim() });
        mostrarExito(`${tituloSingular} actualizada correctamente`);
      } else {
        await crearFn({ nombre: nombre.trim() });
        mostrarExito(`${tituloSingular} creada correctamente`);
      }
      setNombre(""); setEditId(null); setSearchTerm("");
      await cargar();
    } catch (err) {
      mostrarError(err.message || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item[idKey]);
    setNombre(item.nombre);
    setError("");
  };

  const confirmarEliminar = async () => {
    if (!confirmar) return;
    setEliminando(true);
    try {
      await eliminarFn(confirmar.id);
      setConfirmar(null);
      await cargar();
      mostrarExito(`${tituloSingular} eliminada correctamente`);
    } catch {
      mostrarError("Error al eliminar");
      setConfirmar(null);
    } finally {
      setEliminando(false);
    }
  };

  const handleCancel = () => { setNombre(""); setEditId(null); setError(""); };

  return (
    <div className="space-y-4">

      {/* Modal eliminar */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#C8102E]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Eliminar {tituloSingular.toLowerCase()}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ¿Eliminar <strong>"{confirmar.nombre}"</strong>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmar(null)}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl bg-[#C8102E] text-white text-sm font-bold hover:bg-[#C8102E]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                {eliminando ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banners */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#C8102E] text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}
      {exito && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{exito}</span>
          <button onClick={() => setExito("")} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            editId ? "bg-amber-100" : "bg-[#003087]/10"
          }`}>
            {editId
              ? <Pencil className="w-3.5 h-3.5 text-amber-700" />
              : <Plus className="w-3.5 h-3.5 text-[#003087]" />
            }
          </div>
          <p className="text-sm font-bold text-slate-700">
            {editId ? `Editando ${tituloSingular.toLowerCase()}` : `Nueva ${tituloSingular.toLowerCase()}`}
          </p>
          {editId && (
            <button
              type="button"
              onClick={handleCancel}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-3 h-3" /> Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nombre}
            onChange={e => { setNombre(e.target.value); setError(""); }}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={submitting}
            autoFocus={!!editId}
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition placeholder-slate-400 bg-white disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={submitting || !nombre.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#003087] text-white rounded-xl text-sm font-bold hover:bg-[#003087]/90 transition-colors shadow-sm disabled:opacity-60 shrink-0"
          >
            {submitting
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : editId
                ? <><Save className="w-4 h-4" /> Actualizar</>
                : <><Plus className="w-4 h-4" /> Crear</>
            }
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header lista + buscador */}
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className="w-4 h-4 text-[#003087] shrink-0" />
            <span className="font-bold text-slate-700 text-sm">{titulo}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#003087]/10 text-[#003087] font-bold shrink-0">
              {items.length}
            </span>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition placeholder-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cargando */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Estado vacío */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <Icon className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-sm">
              {searchTerm ? "Sin resultados" : `Sin ${titulo.toLowerCase()}`}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchTerm
                ? `No hay coincidencias para "${searchTerm}"`
                : `Crea la primera ${tituloSingular.toLowerCase()} con el formulario de arriba`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#003087] hover:opacity-70 font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Filas */}
        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filtered.map((item, idx) => (
              <div
                key={item[idKey]}
                className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors group animate-fade-in ${
                  editId === item[idKey]
                    ? "bg-amber-50/60"
                    : "hover:bg-slate-50/80"
                }`}
                style={{ animationDelay: `${idx * 28}ms` }}
              >
                <span className="text-xs font-bold text-slate-300 w-5 text-right shrink-0 select-none tabular-nums">
                  {idx + 1}
                </span>

                <span className={`flex-1 text-sm font-semibold truncate ${
                  editId === item[idKey] ? "text-amber-700" : "text-slate-800"
                }`}>
                  {item.nombre}
                </span>

                <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium shrink-0">
                  #{item[idKey]}
                </span>

                {item.fecha_creacion && (
                  <span className="hidden md:inline text-xs text-slate-400 shrink-0">
                    {new Date(item.fecha_creacion).toLocaleDateString("es-ES", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                )}

                <div className="flex gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      editId === item[idKey]
                        ? "bg-amber-200 text-amber-800"
                        : "bg-[#003087]/10 text-[#003087] hover:bg-[#003087] hover:text-white"
                    }`}
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmar({ id: item[idKey], nombre: item.nombre })}
                    className="w-8 h-8 rounded-lg bg-red-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white flex items-center justify-center transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
      `}} />
    </div>
  );
};

export default AtributoBase;
