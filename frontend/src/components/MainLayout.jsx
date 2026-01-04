import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AbilityContext } from '../context/AbilityContext';
import { Outlet, useLocation, Link } from 'react-router-dom';

// Componente del Logo
const Logo = ({ size = "medium" }) => {
  const sizes = {
    small: { 
      logo: "w-10 h-10 sm:w-12 sm:h-12", 
      text: "text-base sm:text-lg" 
    },
    medium: { 
      logo: "w-14 h-14 sm:w-16 sm:h-16", 
      text: "text-lg sm:text-xl" 
    },
    large: { 
      logo: "w-24 h-24 sm:w-28 sm:h-28", 
      text: "text-xl sm:text-2xl" 
    }
  };

  const { logo, text } = sizes[size];

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Contenedor con fondo blanco o claro */}
        <div className={`${logo} bg-white rounded-xl flex items-center justify-center shadow-xl border-2 border-yellow-300/50 overflow-hidden`}>
          <img 
            src="/logo.png" 
            alt="Boutique Lojainy Logo" 
            className="w-full h-full object-contain p-2"
          />
        </div>
        {/* Decoración colombiana */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-xs text-white">🇨🇴</span>
        </div>
      </div>
      <div>
        <h1 className={`${text} font-bold text-white leading-tight`}>
          Boutique <span className="text-yellow-300">Lojainy</span>
        </h1>
        <p className="text-yellow-200 text-xs opacity-80">Estilo Colombiano</p>
      </div>
    </div>
  );
};

// Logo solo (sin texto) para menú móvil
const LogoIcon = ({ size = "medium" }) => {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-12 h-12"
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}>
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="w-full h-full object-contain p-1"
      />
    </div>
  );
};

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const ability = useContext(AbilityContext); // 🔥 Nuevo: Obtener ability de CASL
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔥 MENÚ DEFINIDO CON CASL - CAMBIO CLAVE DE MENTALIDAD
  const menuItems = [
  {
    name: 'Dashboard',
    icon: '📊',
    path: '/app',
    action: 'read',
    subject: 'Dashboard'
  },
  {
    name: 'Reportes',
    icon: '👥',
    path: '/app/reportes',
    action: 'read',
    subject: 'Reporte'
  },
  {
    name: 'Ventas',
    icon: '💰',
    path: '/app/ventas',
    action: 'read',
    subject: 'Venta'
  },
  {
    name: 'Productos',
    icon: '👕',
    path: '/app/productos',
    action: 'read',
    subject: 'Producto'
  },
  {
    name: 'Usuarios',
    icon: '👥',
    path: '/app/usuarios',
    action: 'manage',
    subject: 'Usuario'
  },
  {
  name: 'Atributos',
  icon: '🏷️',
  path: '/app/atributos',
  any: [
    { action: 'manage', subject: 'Categoria' },
    { action: 'manage', subject: 'Talla' },
    { action: 'manage', subject: 'Color' },
    { action: 'manage', subject: 'Marca' }
  ]
  },
  /*
  {
    name: 'Roles',
    icon: '🔐',
    path: '/app/roles',
    action: 'manage',
    subject: 'Role'
  }
  */

];
  // 🔥 FILTRADO SIMPLE Y LIMPIO - CASL DECIDE TODO
  // MainLayout.jsx - Actualizar la función de filtrado
const menuFiltrado = menuItems.filter(item => {
  if (item.any && Array.isArray(item.any)) {
    // Basta que tenga alguno de los permisos
    return item.any.some(p => ability.can(p.action, p.subject));
  }
  // Caso normal: action/subject
  return ability.can(item.action, item.subject);
});


  // Verificar si la ruta está activa
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Mostrar el rol directamente desde el usuario
  const getRolDisplay = () => usuario?.nombre_rol || 'Usuario';

  // Iniciales del usuario
  const getInitials = () => {
    if (usuario?.nombre) {
      const names = usuario.nombre.split(' ');
      if (names.length > 1) {
        return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
      }
      return usuario.nombre.charAt(0).toUpperCase();
    }
    if (usuario?.email) {
      return usuario.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Título de la página según menú filtrado
  const getPageTitle = () => {
    const currentItem = menuFiltrado.find(item => isActive(item.path));
    return currentItem?.name || 'Boutique Lojainy';
  };

  // 🔥 LOGOUT ACTUALIZADO - LIMPIA ABILITY DE CASL
  const handleLogout = () => {
    logout();
    ability.update([]); // Limpia las reglas de CASL
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-72 bg-gradient-to-b from-yellow-600 via-yellow-700 to-red-700 shadow-2xl flex-col relative overflow-hidden">
        {/* Patrón decorativo colombiano */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-yellow-500/50 bg-gradient-to-r from-yellow-700/90 to-red-700/90 backdrop-blur-sm">
            <Logo size="medium" />
          </div>

          {/* Menú de Navegación - Contenedor con scroll */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {menuFiltrado.length > 0 ? (
                menuFiltrado.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-yellow-500/30 to-red-500/30 text-white shadow-lg backdrop-blur-sm border-l-4 border-yellow-400'
                        : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">{item.name}</span>
                    {isActive(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 px-2">
                  <p className="text-white/60 text-sm">No tienes permisos para acceder a ningún módulo</p>
                </div>
              )}
            </nav>
          </div>

          {/* Información del Usuario y Logout - FIJO EN LA PARTE INFERIOR */}
          <div className="mt-auto border-t border-yellow-500/50 bg-gradient-to-t from-yellow-700/80 to-transparent backdrop-blur-sm p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-red-400 rounded-full flex items-center justify-center text-yellow-900 font-semibold text-sm shadow-lg border border-yellow-300">
                  {getInitials()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-2 border-yellow-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {usuario?.nombre || usuario?.email || 'Usuario'}
                </p>
                <p className="text-yellow-300 text-xs capitalize truncate opacity-90">{getRolDisplay()}</p>
              </div>
            </div>

            <button
              onClick={handleLogout} // 🔥 Usa handleLogout actualizado
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 group"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-yellow-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent truncate">
                    {getPageTitle()}
                  </h2>
                  <div className="hidden md:flex items-center space-x-1 text-sm text-yellow-600">
                    <span className="opacity-70">•</span>
                    <span>Boutique Lojainy</span>
                  </div>
                </div>
                <p className="text-yellow-600 text-sm truncate opacity-80">
                  Sistema de gestión de moda colombiana
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-900">
                    {usuario?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-yellow-600 capitalize">{getRolDisplay()}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-red-400 rounded-full flex items-center justify-center text-yellow-900 font-semibold shadow-lg">
                  {getInitials()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-b from-yellow-50 to-white shadow-xl border-b border-yellow-100 fixed inset-x-0 top-0 h-full z-50 overflow-hidden flex flex-col">
            {/* Header del menú móvil */}
            <div className="flex-shrink-0 bg-gradient-to-r from-yellow-600 to-red-600 text-white p-4">
              <div className="flex items-center justify-between">
                <Logo size="small" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del menú con scroll */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {menuFiltrado.length > 0 ? (
                  menuFiltrado.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-yellow-100 to-red-100 text-yellow-700 border-r-4 border-yellow-500'
                          : 'text-yellow-900 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4 px-2">
                    <p className="text-yellow-700 text-sm">No tienes permisos para acceder a ningún módulo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de usuario - FIJA EN LA PARTE INFERIOR */}
            <div className="flex-shrink-0 border-t border-yellow-100 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-red-400 rounded-full flex items-center justify-center text-yellow-900 font-semibold text-sm shadow-md">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 truncate">
                    {usuario?.nombre || usuario?.email || 'Usuario'}
                  </p>
                  <p className="text-xs text-yellow-600 capitalize truncate">{getRolDisplay()}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout(); // 🔥 Usa handleLogout actualizado
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md"
              >
                <span className="text-base">🚪</span>
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-yellow-50/50 via-white to-red-50/50 p-4 md:p-6">
          <div className="max-w-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-100 p-4 md:p-6 min-h-[calc(100vh-180px)]">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-yellow-700 to-red-700 text-white py-3 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <LogoIcon size="small" />
              <span className="font-medium text-sm">Boutique Lojainy</span>
              <span className="text-xs opacity-80">• Estilo Colombiano •</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="opacity-90">{getRolDisplay()}</span>
              <span className="opacity-70">© 2025 Todos los derechos reservados</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;