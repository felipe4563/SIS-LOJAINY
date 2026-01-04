import { useEffect, useState, useContext } from 'react';
import { AbilityContext } from '../context/AbilityContext';
import { obtenerUsuarios, cambiarEstadoUsuario } from '../services/usuario';
import UsuarioForm from '../pages/Usuario/UsuarioForm.jsx';
import { 
  FiUsers, 
  FiPlus, 
  FiEdit, 
  FiToggleLeft, 
  FiToggleRight,
  FiUser,
  FiMail,
  FiKey,
  FiShield,
  FiActivity,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiArrowLeft,
  FiFilter,
  FiTrash2
} from 'react-icons/fi';

const Usuarios = () => {
  const ability = useContext(AbilityContext);
  const [usuarios, setUsuarios] = useState([]);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const { data } = await obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ability.can('manage', 'Usuario')) cargarUsuarios();
  }, []);

  const handleFormSuccess = () => {
    cargarUsuarios();
    setModoFormulario(false);
    setUsuarioEdit(null);
    setMensajeExito(usuarioEdit ? '¡Usuario actualizado correctamente!' : '¡Usuario creado correctamente!');
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const handleCloseForm = () => {
    setModoFormulario(false);
    setUsuarioEdit(null);
  };

  const cambiarEstado = async (id) => {
    try {
      await cambiarEstadoUsuario(id);
      await cargarUsuarios();
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = 
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'todos' || usuario.nombre_rol === filterRole;
    const matchesStatus = filterStatus === 'todos' || 
      (filterStatus === 'activos' && usuario.activo) ||
      (filterStatus === 'inactivos' && !usuario.activo);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Obtener roles únicos para el filtro
  const rolesUnicos = [...new Set(usuarios.map(u => u.nombre_rol))];

  const limpiarFiltros = () => {
    setFilterRole('todos');
    setFilterStatus('todos');
    setSearchTerm('');
    setShowFilters(false);
  };

  // Si estamos en modo formulario, mostrar solo el formulario
  if (modoFormulario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header del formulario */}
          <div className="mb-6">
            <button
              onClick={handleCloseForm}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver a la lista de usuarios</span>
            </button>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {usuarioEdit ? "✏️ Editar Usuario" : "➕ Crear Nuevo Usuario"}
              </h2>
              <p className="text-gray-600">
                {usuarioEdit 
                  ? "Modifica la información del usuario existente" 
                  : "Completa todos los campos para registrar un nuevo usuario"}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <UsuarioForm
            usuarioEdit={usuarioEdit}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    );
  }

  if (!ability.can('manage', 'Usuario')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-3xl text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h3>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Mensaje de éxito */}
        {mensajeExito && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
            <FiCheckCircle className="text-green-600 text-xl" />
            <span className="text-green-700 font-medium">{mensajeExito}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <FiUsers className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''} encontrado{filteredUsuarios.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Vista toggle - Solo visible en desktop */}
              <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                >
                  <div className="w-5 h-5 grid grid-cols-2 gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-current rounded-sm"></div>
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                >
                  <div className="w-5 h-5 flex flex-col gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-current h-1 rounded-sm"></div>
                    ))}
                  </div>
                </button>
              </div>

              <button
                onClick={() => { 
                  setUsuarioEdit(null); 
                  setModoFormulario(true); 
                }}
                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
                <FiPlus className="text-lg" />
                <span className="hidden sm:inline">Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-lg" />
                </button>
              )}
            </div>

            {/* Botón para mostrar filtros en móvil */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <FiFilter className="w-5 h-5" />
                <span>Filtros</span>
                {showFilters ? (
                  <FiX className="w-4 h-4" />
                ) : (
                  <span className="w-4 h-4"></span>
                )}
              </button>

              {(filterRole !== 'todos' || filterStatus !== 'todos' || searchTerm) && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Filtros expandibles */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="todos">Todos los roles</option>
                    {rolesUnicos.map(rol => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="activos">Activos</option>
                    <option value="inactivos">Inactivos</option>
                  </select>
                </div>
              </div>
            )}

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-800">{usuarios.length}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold text-gray-800">
                  {usuarios.filter(u => u.activo).length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Roles</p>
                <p className="text-xl font-bold text-gray-800">{rolesUnicos.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm || filterRole !== 'todos' || filterStatus !== 'todos' 
                ? 'No se encontraron usuarios' 
                : 'No hay usuarios registrados'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterRole !== 'todos' || filterStatus !== 'todos'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Crea el primer usuario'}
            </p>
            <button
              onClick={() => { 
                setUsuarioEdit(null); 
                setModoFormulario(true); 
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              <FiPlus className="text-lg" />
              Crear primer usuario
            </button>
          </div>
        ) : (
          <>
            {/* VISTA GRID - TARJETAS */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsuarios.map(u => (
                  <div key={u.id_usuario} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Header de la tarjeta */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {u.nombre[0]}{u.apellido[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-lg truncate">{u.usuario}</h3>
                          <p className="text-indigo-100 text-sm truncate">{u.correo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-5 space-y-4">
                      {/* Información personal */}
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg mb-1">
                          {u.nombre} {u.apellido}
                        </h4>
                        <p className="text-gray-600 text-sm">CI: {u.ci}</p>
                      </div>

                      {/* Rol y Estado */}
                      <div className="space-y-3">
                        <div>
                          <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {u.nombre_rol}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${u.activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm font-medium ${u.activo ? 'text-green-600' : 'text-gray-600'}`}>
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => cambiarEstado(u.id_usuario)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                              u.activo
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                            }`}
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => { 
                            setUsuarioEdit(u); 
                            setModoFormulario(true); 
                          }}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          <FiEdit className="text-sm" />
                          <span className="text-sm">Editar</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de cambiar el estado de ${u.usuario}?`)) {
                              cambiarEstado(u.id_usuario);
                            }
                          }}
                          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                        >
                          {u.activo ? <FiToggleLeft /> : <FiToggleRight />}
                          <span className="text-sm">{u.activo ? 'Desact.' : 'Activar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* VISTA LISTA - TABLA */
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Usuario</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Información</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Rol</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Estado</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsuarios.map(u => (
                        <tr key={u.id_usuario} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {u.nombre[0]}{u.apellido[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{u.usuario}</p>
                                <p className="text-sm text-gray-500">{u.correo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <p className="font-medium text-gray-800">{u.nombre} {u.apellido}</p>
                            <p className="text-sm text-gray-500">CI: {u.ci}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              {u.nombre_rol}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => cambiarEstado(u.id_usuario)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                                  u.activo ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    u.activo ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className={`text-sm font-medium ${u.activo ? 'text-green-600' : 'text-gray-600'}`}>
                                {u.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { 
                                  setUsuarioEdit(u); 
                                  setModoFormulario(true); 
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                              >
                                <FiEdit className="text-xs" />
                                Editar
                              </button>
                              <button
                                onClick={() => cambiarEstado(u.id_usuario)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                  u.activo
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                }`}
                              >
                                {u.activo ? <FiToggleLeft /> : <FiToggleRight />}
                                {u.activo ? 'Desact.' : 'Activar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Usuarios;