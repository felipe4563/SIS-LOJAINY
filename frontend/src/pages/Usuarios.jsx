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
  FiCheckCircle
} from 'react-icons/fi';

const Usuarios = () => {
  const ability = useContext(AbilityContext);
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

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

  const abrirCrear = () => {
    setUsuarioEdit(null);
    setModalOpen(true);
  };

  const abrirEditar = (u) => {
    setUsuarioEdit(u);
    setModalOpen(true);
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
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
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
                  Administra los usuarios del sistema
                </p>
              </div>
            </div>
            <button
              onClick={abrirCrear}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <FiPlus className="text-lg" />
              Nuevo Usuario
            </button>
          </div>

          {/* FILTROS Y BÚSQUEDA */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* BARRA DE BÚSQUEDA */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, usuario o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* FILTROS */}
              <div className="flex gap-3">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="todos">Todos los roles</option>
                  {rolesUnicos.map(rol => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
              </div>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {usuarios.filter(u => u.activo).length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Roles Diferentes</p>
                <p className="text-2xl font-bold text-gray-800">{rolesUnicos.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || filterRole !== 'todos' || filterStatus !== 'todos' 
                  ? 'No se encontraron usuarios' 
                  : 'No hay usuarios registrados'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterRole !== 'todos' || filterStatus !== 'todos'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Crea el primer usuario haciendo clic en "Nuevo Usuario"'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Usuario</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Información</th>
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
                      <td className="py-4 px-6">
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
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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
                            onClick={() => abrirEditar(u)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                          >
                            <FiEdit className="text-sm" />
                            Editar
                          </button>
                          <button
                            onClick={() => cambiarEstado(u.id_usuario)}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                              u.activo
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                            }`}
                          >
                            {u.activo ? <FiToggleLeft /> : <FiToggleRight />}
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <UsuarioForm
          usuarioEdit={usuarioEdit}
          onClose={() => setModalOpen(false)}
          onSuccess={cargarUsuarios}
        />
      )}
    </div>
  );
};

export default Usuarios;