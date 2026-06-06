import { useEffect, useState } from "react";
import { crearUsuario, actualizarUsuario } from "../../services/usuario";
import { listarRoles } from "../../services/rol";
import {
  User, Mail, Key, Shield, X, Save,
  RefreshCw, CreditCard, AlertCircle, Eye, EyeOff, Check,
} from "lucide-react";

const UsuarioForm = ({ usuarioEdit, onClose, onSuccess }) => {
  const [roles,        setRoles]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors,       setErrors]       = useState({});
  const [errorForm,    setErrorForm]    = useState("");
  const [form,         setForm]         = useState({
    nombre: "", apellido: "", ci: "", usuario: "", correo: "", password: "", id_rol: "",
  });

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const data = await listarRoles();
        setRoles(data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarRoles();
  }, []);

  useEffect(() => {
    if (usuarioEdit) {
      setForm({
        nombre:   usuarioEdit.nombre   || "",
        apellido: usuarioEdit.apellido || "",
        ci:       usuarioEdit.ci       || "",
        usuario:  usuarioEdit.usuario  || "",
        correo:   usuarioEdit.correo   || "",
        password: "",
        id_rol:   usuarioEdit.id_rol   || "",
      });
    } else {
      setForm({ nombre: "", apellido: "", ci: "", usuario: "", correo: "", password: "", id_rol: "" });
    }
  }, [usuarioEdit]);

  const generarUsuario = (nombre, ci) => {
    if (!nombre || !ci) return "";
    return `${nombre.toLowerCase().replace(/[^a-záéíóúüñ]/g, "")}${ci.slice(-2)}`;
  };

  const generarCorreo = (nombre, apellido) => {
    if (!nombre || !apellido) return "";
    return `${apellido[0].toLowerCase()}${nombre.toLowerCase().replace(/[^a-záéíóúüñ]/g, "")}@lojainy.com`;
  };

  const validateForm = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = "El nombre es obligatorio";
    if (!form.apellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!form.ci.trim())       e.ci       = "El CI es obligatorio";
    if (!form.id_rol)          e.id_rol   = "Seleccione un rol";
    if (!usuarioEdit && !form.password.trim()) e.password = "La contraseña es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: "" }));
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (!usuarioEdit) {
        if (name === "nombre" || name === "ci")       updated.usuario = generarUsuario(updated.nombre, updated.ci);
        if (name === "nombre" || name === "apellido") updated.correo  = generarCorreo(updated.nombre, updated.apellido);
      }
      return updated;
    });
  };

  const handleGenerateCredentials = () => {
    if (!form.nombre || !form.apellido || !form.ci) {
      setErrors({
        nombre:   !form.nombre   ? "Ingrese el nombre primero"   : "",
        apellido: !form.apellido ? "Ingrese el apellido primero" : "",
        ci:       !form.ci       ? "Ingrese el CI primero"       : "",
      });
      return;
    }
    setForm(prev => ({
      ...prev,
      usuario: generarUsuario(prev.nombre, prev.ci),
      correo:  generarCorreo(prev.nombre,  prev.apellido),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (usuarioEdit) {
        await actualizarUsuario(usuarioEdit.id_usuario, form);
      } else {
        await crearUsuario(form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorForm(err.response?.data?.message || "Error al guardar el usuario");
      setTimeout(() => setErrorForm(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full border ${
      hasError
        ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
        : "border-slate-200 focus:ring-[#003087]/30 focus:border-[#003087]/50"
    } rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition placeholder-slate-400 bg-white`;

  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5 pb-24 sm:pb-5">

      {/* Error banner */}
      {errorForm && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#C8102E] text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorForm}</span>
          <button type="button" onClick={() => setErrorForm("")} className="shrink-0 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nombre */}
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nombre *</span>
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ingrese el nombre"
            className={inputCls(errors.nombre)}
          />
          {errors.nombre && (
            <p className="flex items-center gap-1 text-xs text-[#C8102E] mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.nombre}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className={labelCls}>Apellido *</label>
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Ingrese el apellido"
            className={inputCls(errors.apellido)}
          />
          {errors.apellido && (
            <p className="flex items-center gap-1 text-xs text-[#C8102E] mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.apellido}
            </p>
          )}
        </div>

        {/* CI */}
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> CI *</span>
          </label>
          <input
            name="ci"
            value={form.ci}
            onChange={handleChange}
            placeholder="Número de carnet"
            className={inputCls(errors.ci)}
          />
          {errors.ci && (
            <p className="flex items-center gap-1 text-xs text-[#C8102E] mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.ci}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              {usuarioEdit ? "Nueva Contraseña" : "Contraseña *"}
            </span>
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder={usuarioEdit ? "Dejar vacío para mantener" : "Ingrese la contraseña"}
              className={`${inputCls(errors.password)} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-[#C8102E] mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.password}
            </p>
          )}
        </div>

        {/* Usuario generado */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls} style={{ margin: 0 }}>Nombre de Usuario</label>
            {!usuarioEdit && (
              <button
                type="button"
                onClick={handleGenerateCredentials}
                className="flex items-center gap-1 text-xs text-[#003087] hover:opacity-70 font-bold px-2 py-0.5 hover:bg-[#003087]/5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Regenerar
              </button>
            )}
          </div>
          <div className="relative">
            <input
              value={form.usuario}
              readOnly
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm text-slate-600 pr-9"
            />
            {form.usuario && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600" />
              </div>
            )}
          </div>
        </div>

        {/* Correo generado */}
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Correo Electrónico</span>
          </label>
          <div className="relative">
            <input
              value={form.correo}
              readOnly
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm text-slate-600 pr-9"
            />
            {form.correo && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rol */}
      <div>
        <label className={labelCls}>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Rol *</span>
        </label>
        <select
          name="id_rol"
          value={form.id_rol}
          onChange={handleChange}
          className={inputCls(errors.id_rol)}
        >
          <option value="">Seleccione un rol</option>
          {roles.map(r => (
            <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
          ))}
        </select>
        {errors.id_rol && (
          <p className="flex items-center gap-1 text-xs text-[#C8102E] mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.id_rol}
          </p>
        )}
      </div>

      {/* Preview */}
      {(form.nombre || form.apellido || form.usuario) && (
        <div className="bg-[#003087]/5 border border-[#003087]/10 rounded-xl p-4">
          <p className="text-xs font-bold text-[#003087] mb-3 uppercase tracking-wide">Vista previa</p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#003087] flex items-center justify-center text-white font-extrabold text-sm select-none">
              {(form.nombre[0]   || "?").toUpperCase()}
              {(form.apellido[0] || "?").toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {form.nombre || "Nombre"} {form.apellido || "Apellido"}
              </p>
              <p className="text-xs text-slate-500">@{form.usuario || "usuario"}</p>
              <p className="text-xs text-slate-400">{form.correo || "correo@lojainy.com"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nota informativa al crear */}
      {!usuarioEdit && (
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            El usuario y correo se generan automáticamente desde el nombre, apellido y CI.
            Puedes regenerarlos con el botón <strong className="text-slate-600">Regenerar</strong>.
          </p>
        </div>
      )}

      {/* Botones — sticky en mobile */}
      <div className="fixed bottom-0 left-0 right-0 sm:static p-4 sm:p-0 bg-white sm:bg-transparent border-t border-slate-100 sm:border-0 sm:pt-4 sm:border-t sm:border-slate-200 flex gap-3 z-10">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-[#003087] text-white text-sm font-bold hover:bg-[#003087]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {usuarioEdit ? "Actualizar" : "Crear Usuario"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UsuarioForm;
