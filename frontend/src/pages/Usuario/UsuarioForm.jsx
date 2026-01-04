import { useEffect, useState } from 'react';
import { crearUsuario, actualizarUsuario } from '../../services/usuario';
import { listarRoles } from '../../services/rol';
import { 
  FiUser, 
  FiMail, 
  FiKey, 
  FiShield, 
  FiX,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiCreditCard,
  FiAlertCircle,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const UsuarioForm = ({ usuarioEdit, onClose, onSuccess }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    usuario: '',
    correo: '',
    password: '',
    id_rol: ''
  });

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const data = await listarRoles();
        setRoles(data);
      } catch (error) {
        console.error('Error cargando roles:', error);
      }
    };
    cargarRoles();
  }, []);

  useEffect(() => {
    if (usuarioEdit) {
      setForm({
        nombre: usuarioEdit.nombre || '',
        apellido: usuarioEdit.apellido || '',
        ci: usuarioEdit.ci || '',
        usuario: usuarioEdit.usuario || '',
        correo: usuarioEdit.correo || '',
        password: '',
        id_rol: usuarioEdit.id_rol || ''
      });
    } else {
      setForm({
        nombre: '',
        apellido: '',
        ci: '',
        usuario: '',
        correo: '',
        password: '',
        id_rol: ''
      });
    }
  }, [usuarioEdit]);

  const generarUsuario = (nombre, ci) => {
    if (!nombre || !ci) return '';
    const nombreLimpio = nombre.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
    return `${nombreLimpio}${ci.slice(-2)}`;
  };

  const generarCorreo = (nombre, apellido) => {
    if (!nombre || !apellido) return '';
    const nombreLimpio = nombre.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
    const apellidoLimpio = apellido[0].toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
    return `${apellidoLimpio}${nombreLimpio}@lojainy.com`;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio';
    if (!form.ci.trim()) newErrors.ci = 'El CI es obligatorio';
    if (!form.id_rol) newErrors.id_rol = 'Debe seleccionar un rol';
    
    if (!usuarioEdit && !form.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      if (!usuarioEdit) {
        if (name === 'nombre' || name === 'ci') {
          updated.usuario = generarUsuario(updated.nombre, updated.ci);
        }
        
        if (name === 'nombre' || name === 'apellido') {
          updated.correo = generarCorreo(updated.nombre, updated.apellido);
        }
      }

      return updated;
    });
  };

  const handleGenerateCredentials = () => {
    if (!form.nombre || !form.apellido || !form.ci) {
      setErrors({
        nombre: !form.nombre ? 'Ingrese el nombre primero' : '',
        apellido: !form.apellido ? 'Ingrese el apellido primero' : '',
        ci: !form.ci ? 'Ingrese el CI primero' : ''
      });
      return;
    }

    const nuevoUsuario = generarUsuario(form.nombre, form.ci);
    const nuevoCorreo = generarCorreo(form.nombre, form.apellido);
    
    setForm(prev => ({
      ...prev,
      usuario: nuevoUsuario,
      correo: nuevoCorreo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
      alert('Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error) => 
    `w-full border ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} 
     rounded-xl p-3 focus:ring-2 focus:border-transparent transition-all bg-white`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* NOMBRE */}
          <div className="space-y-2">
            <label className={labelClass}>
              <FiUser className="text-gray-500" />
              Nombre *
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ingrese el nombre"
              className={inputClass(errors.nombre)}
              required
            />
            {errors.nombre && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <FiAlertCircle className="text-xs" />
                {errors.nombre}
              </p>
            )}
          </div>

          {/* APELLIDO */}
          <div className="space-y-2">
            <label className={labelClass}>
              <FiUser className="text-gray-500 opacity-0" />
              Apellido *
            </label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Ingrese el apellido"
              className={inputClass(errors.apellido)}
              required
            />
            {errors.apellido && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <FiAlertCircle className="text-xs" />
                {errors.apellido}
              </p>
            )}
          </div>

          {/* CI */}
          <div className="space-y-2">
            <label className={labelClass}>
              <FiCreditCard className="text-gray-500" />
              CI *
            </label>
            <input
              name="ci"
              value={form.ci}
              onChange={handleChange}
              placeholder="Número de carnet"
              className={inputClass(errors.ci)}
              required
            />
            {errors.ci && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <FiAlertCircle className="text-xs" />
                {errors.ci}
              </p>
            )}
          </div>

          {/* CONTRASEÑA */}
          <div className="space-y-2">
            <label className={labelClass}>
              <FiKey className="text-gray-500" />
              {usuarioEdit ? 'Nueva Contraseña' : 'Contraseña *'}
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder={usuarioEdit ? "Dejar vacío para mantener la actual" : "Ingrese la contraseña"}
                className={`${inputClass(errors.password)} pr-12`}
                required={!usuarioEdit}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <FiAlertCircle className="text-xs" />
                {errors.password}
              </p>
            )}
            {!usuarioEdit && form.password && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres recomendado
              </p>
            )}
          </div>

          {/* USUARIO GENERADO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              {!usuarioEdit && (
                <button
                  type="button"
                  onClick={handleGenerateCredentials}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <FiRefreshCw className="text-xs" />
                  Regenerar
                </button>
              )}
            </div>
            <div className="relative">
              <input
                value={form.usuario}
                readOnly
                className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 text-gray-700 pr-10"
              />
              {form.usuario && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="text-green-600 text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CORREO GENERADO */}
          <div className="space-y-2">
            <label className={labelClass}>
              <FiMail className="text-gray-500" />
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                value={form.correo}
                readOnly
                className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 text-gray-700 pr-10"
              />
              {form.correo && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="text-green-600 text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROL */}
        <div className="space-y-2">
          <label className={labelClass}>
            <FiShield className="text-gray-500" />
            Rol *
          </label>
          <select
            name="id_rol"
            value={form.id_rol}
            onChange={handleChange}
            className={inputClass(errors.id_rol)}
            required
          >
            <option value="">Seleccione un rol</option>
            {roles.map(r => (
              <option key={r.id_rol} value={r.id_rol} className="py-2">
                {r.nombre}
              </option>
            ))}
          </select>
          {errors.id_rol && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <FiAlertCircle className="text-xs" />
              {errors.id_rol}
            </p>
          )}
        </div>

        {/* PREVIEW CARD */}
        {(form.nombre || form.apellido || form.usuario) && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiUser className="text-blue-500" />
              Vista Previa
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {form.nombre[0] || '?'}{form.apellido[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {form.nombre || 'Nombre'} {form.apellido || 'Apellido'}
                </p>
                <p className="text-sm text-gray-600">{form.usuario || 'usuario'}</p>
                <p className="text-xs text-gray-500">{form.correo || 'correo@ejemplo.com'}</p>
              </div>
            </div>
          </div>
        )}

        {/* INFORMACIÓN ADICIONAL */}
        {!usuarioEdit && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiAlertCircle className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <strong className="font-semibold">Nota importante:</strong> El nombre de usuario y correo se generan automáticamente 
                  a partir del nombre, apellido y CI. Puedes regenerarlos con el botón "Regenerar".
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <FiSave className="text-lg" />
                {usuarioEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioForm;