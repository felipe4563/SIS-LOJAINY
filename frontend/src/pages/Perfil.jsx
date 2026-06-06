import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { obtenerPerfil, actualizarPerfil, cambiarPassword } from "../services/perfil";
import {
  UserCircle, Save, Eye, EyeOff, Check, AlertTriangle, X,
  Lock, User, Mail, CreditCard, KeyRound,
} from "lucide-react";

const Campo = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </label>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const Banner = ({ tipo, mensaje, onClose }) => {
  if (!mensaje) return null;
  const esError = tipo === "error";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border animate-fade-in ${
      esError
        ? "bg-red-50 border-red-200 text-red-700"
        : "bg-emerald-50 border-emerald-200 text-emerald-700"
    }`}>
      {esError
        ? <AlertTriangle className="w-4 h-4 shrink-0" />
        : <Check className="w-4 h-4 shrink-0" />
      }
      <span className="flex-1">{mensaje}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const Perfil = () => {
  const { usuario, setUsuario } = useContext(AuthContext);

  /* ── Estado datos personales ── */
  const [form, setForm] = useState({
    nombre: "", apellido: "", usuario: "", correo: "", ci: "",
  });
  const [loadingPerfil, setLoadingPerfil]   = useState(true);
  const [savingPerfil, setSavingPerfil]     = useState(false);
  const [errorPerfil, setErrorPerfil]       = useState("");
  const [exitoPerfil, setExitoPerfil]       = useState("");

  /* ── Estado cambio de contraseña ── */
  const [pwd, setPwd] = useState({
    password_actual: "", nueva_password: "", confirmar: "",
  });
  const [savingPwd, setSavingPwd]   = useState(false);
  const [errorPwd, setErrorPwd]     = useState("");
  const [exitoPwd, setExitoPwd]     = useState("");
  const [showPwd, setShowPwd]       = useState({ actual: false, nueva: false, confirmar: false });

  /* ── Helpers banners ── */
  const mostrarErrorPerfil = (m) => { setErrorPerfil(m); setTimeout(() => setErrorPerfil(""), 4000); };
  const mostrarExitoPerfil = (m) => { setExitoPerfil(m); setTimeout(() => setExitoPerfil(""), 3000); };
  const mostrarErrorPwd    = (m) => { setErrorPwd(m);    setTimeout(() => setErrorPwd(""), 4000); };
  const mostrarExitoPwd    = (m) => { setExitoPwd(m);    setTimeout(() => setExitoPwd(""), 3000); };

  /* ── Carga inicial ── */
  useEffect(() => {
    obtenerPerfil()
      .then((data) => {
        setForm({
          nombre:   data.nombre   || "",
          apellido: data.apellido || "",
          usuario:  data.usuario  || "",
          correo:   data.correo   || "",
          ci:       data.ci       || "",
        });
      })
      .catch(() => mostrarErrorPerfil("Error al cargar datos del perfil"))
      .finally(() => setLoadingPerfil(false));
  }, []);

  /* ── Guardar datos personales ── */
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim())   return mostrarErrorPerfil("El nombre es requerido");
    if (!form.usuario.trim())  return mostrarErrorPerfil("El nombre de usuario es requerido");
    setSavingPerfil(true);
    try {
      await actualizarPerfil(form);
      mostrarExitoPerfil("Perfil actualizado correctamente");
      // Actualizar nombre en la sesión activa
      setUsuario((prev) => ({
        ...prev,
        nombre:   form.nombre,
        apellido: form.apellido,
        correo:   form.correo,
        ci:       form.ci,
      }));
    } catch (err) {
      mostrarErrorPerfil(err?.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setSavingPerfil(false);
    }
  };

  /* ── Cambiar contraseña ── */
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!pwd.password_actual)              return mostrarErrorPwd("Ingresa tu contraseña actual");
    if (!pwd.nueva_password)               return mostrarErrorPwd("Ingresa la nueva contraseña");
    if (pwd.nueva_password.length < 6)     return mostrarErrorPwd("La nueva contraseña debe tener al menos 6 caracteres");
    if (pwd.nueva_password !== pwd.confirmar) return mostrarErrorPwd("Las contraseñas no coinciden");
    setSavingPwd(true);
    try {
      await cambiarPassword({
        password_actual: pwd.password_actual,
        nueva_password:  pwd.nueva_password,
      });
      mostrarExitoPwd("Contraseña actualizada correctamente");
      setPwd({ password_actual: "", nueva_password: "", confirmar: "" });
    } catch (err) {
      mostrarErrorPwd(err?.response?.data?.message || "Error al cambiar contraseña");
    } finally {
      setSavingPwd(false);
    }
  };

  const setField = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleShow = (field) =>
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));

  const inputBase =
    "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003087]/25 focus:border-[#003087] transition-all";

  /* ── Iniciales para el avatar ── */
  const getInitials = () => {
    const n = form.nombre || usuario?.nombre || "";
    const a = form.apellido || usuario?.apellido || "";
    if (n && a) return (n[0] + a[0]).toUpperCase();
    if (n) return n[0].toUpperCase();
    return "U";
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-0 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shrink-0">
          <UserCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#003087] tracking-tight leading-tight">
            Mi Perfil
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Datos personales y contraseña
          </p>
        </div>
      </div>

      {loadingPerfil ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ══ CARD: Datos Personales ══ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-[#003087]" />
            <div className="p-5 sm:p-6">

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#003087] flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-xl font-black text-[#FFCD00]">{getInitials()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {form.nombre} {form.apellido}
                  </p>
                  <p className="text-xs text-slate-400 capitalize font-medium">
                    {usuario?.nombre_rol || "—"}
                  </p>
                </div>
              </div>

              <Banner tipo="error"  mensaje={errorPerfil} onClose={() => setErrorPerfil("")} />
              <Banner tipo="exito"  mensaje={exitoPerfil} onClose={() => setExitoPerfil("")} />

              <form onSubmit={handleGuardarPerfil} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Campo label="Nombre" icon={User}>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={setField(setForm)}
                      placeholder="Tu nombre"
                      maxLength={100}
                      className={inputBase}
                    />
                  </Campo>
                  <Campo label="Apellido" icon={User}>
                    <input
                      name="apellido"
                      value={form.apellido}
                      onChange={setField(setForm)}
                      placeholder="Tu apellido"
                      maxLength={100}
                      className={inputBase}
                    />
                  </Campo>
                </div>

                <Campo label="Usuario (login)" icon={User}>
                  <input
                    name="usuario"
                    value={form.usuario}
                    onChange={setField(setForm)}
                    placeholder="Nombre de usuario"
                    maxLength={50}
                    className={inputBase}
                  />
                </Campo>

                <Campo label="Correo" icon={Mail}>
                  <input
                    name="correo"
                    type="email"
                    value={form.correo}
                    onChange={setField(setForm)}
                    placeholder="correo@ejemplo.com"
                    maxLength={100}
                    className={inputBase}
                  />
                </Campo>

                <Campo label="Cédula" icon={CreditCard}>
                  <input
                    name="ci"
                    value={form.ci}
                    onChange={setField(setForm)}
                    placeholder="Número de cédula"
                    maxLength={20}
                    className={inputBase}
                  />
                </Campo>

                <button
                  type="submit"
                  disabled={savingPerfil}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FFCD00] hover:bg-[#e6b800] disabled:opacity-60 text-[#003087] font-bold rounded-xl shadow-sm shadow-[#FFCD00]/30 transition-all active:scale-95 text-sm mt-2"
                >
                  {savingPerfil ? (
                    <div className="w-4 h-4 border-2 border-[#003087]/30 border-t-[#003087] rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savingPerfil ? "Guardando…" : "Guardar Cambios"}
                </button>
              </form>
            </div>
          </div>

          {/* ══ CARD: Cambiar Contraseña ══ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-[#003087]" />
            <div className="p-5 sm:p-6">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#003087]" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Cambiar Contraseña</p>
                  <p className="text-xs text-slate-400">Mínimo 6 caracteres</p>
                </div>
              </div>

              <Banner tipo="error"  mensaje={errorPwd} onClose={() => setErrorPwd("")} />
              <Banner tipo="exito"  mensaje={exitoPwd} onClose={() => setExitoPwd("")} />

              <form onSubmit={handleCambiarPassword} className="space-y-4 mt-4">
                {[
                  { name: "password_actual", label: "Contraseña Actual",    field: "actual" },
                  { name: "nueva_password",  label: "Nueva Contraseña",      field: "nueva" },
                  { name: "confirmar",       label: "Confirmar Contraseña",  field: "confirmar" },
                ].map(({ name, label, field }) => (
                  <Campo key={name} label={label} icon={KeyRound}>
                    <div className="relative">
                      <input
                        name={name}
                        type={showPwd[field] ? "text" : "password"}
                        value={pwd[name]}
                        onChange={setField(setPwd)}
                        placeholder="••••••••"
                        className={`${inputBase} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow(field)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPwd[field]
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </Campo>
                ))}

                {/* Indicador de coincidencia */}
                {pwd.nueva_password && pwd.confirmar && (
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${
                    pwd.nueva_password === pwd.confirmar ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {pwd.nueva_password === pwd.confirmar
                      ? <><Check className="w-3.5 h-3.5" /> Las contraseñas coinciden</>
                      : <><X className="w-3.5 h-3.5" /> Las contraseñas no coinciden</>
                    }
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingPwd}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#003087] hover:bg-[#002266] disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm mt-2"
                >
                  {savingPwd ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {savingPwd ? "Actualizando…" : "Actualizar Contraseña"}
                </button>
              </form>
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

export default Perfil;
