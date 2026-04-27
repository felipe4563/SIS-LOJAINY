import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AbilityContext } from '../context/AbilityContext';
import { Outlet, useLocation, Link } from 'react-router-dom';

// Componente del Logo
const Logo = ({ size = "medium", collapsed = false }) => {
  const sizes = {
    small: { logo: "w-8 h-8", text: "text-sm" },
    medium: { logo: "w-12 h-12", text: "text-xl" },
    large: { logo: "w-16 h-16", text: "text-2xl" }
  };

  const { logo, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <div className={`${logo} bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden transition-transform group-hover:scale-105 duration-300 ring-2 ring-white/20`}>
          <img 
            src="/logo.png" 
            alt="Boutique Lojainy" 
            className="w-full h-full object-contain p-1.5"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-full h-full bg-[#FFCD00] items-center justify-center text-[#003087] font-bold text-xl">
            L
          </div>
        </div>
        {/* Decoración Bandera Colombiana Circular */}
        <div className="absolute -bottom-2 -right-2 flex flex-col w-6 h-6 rounded-full overflow-hidden border-2 border-[#003087] shadow-md transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
          <div className="w-full h-1/2 bg-[#FFCD00]"></div>
          <div className="w-full h-1/4 bg-[#003087]"></div>
          <div className="w-full h-1/4 bg-[#C8102E]"></div>
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <h1 className={`${text} font-extrabold text-white tracking-tight leading-none drop-shadow-md`}>
            Boutique <span className="text-[#FFCD00]">Lojainy</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex flex-col w-3 h-3 rounded-full overflow-hidden opacity-90 shadow-sm">
               <div className="w-full h-1/2 bg-[#FFCD00]"></div>
               <div className="w-full h-1/4 bg-[#003087]"></div>
               <div className="w-full h-1/4 bg-[#C8102E]"></div>
            </div>
            <p className="text-white/90 text-[10px] uppercase tracking-[0.2em] font-bold">Estilo Colombiano</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const ability = useContext(AbilityContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para sombra en el header al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = document.getElementById('main-scroll-area')?.scrollTop > 10;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    const scrollArea = document.getElementById('main-scroll-area');
    scrollArea?.addEventListener('scroll', handleScroll);
    return () => scrollArea?.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // 🔥 MENÚ DEFINIDO CON CASL - CAMBIO CLAVE DE MENTALIDAD
  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/app', action: 'read', subject: 'Dashboard' },
    { name: 'Reportes', icon: '📈', path: '/app/reportes', action: 'read', subject: 'Reporte' },
    { name: 'Nueva Venta', icon: '💰', path: '/app/ventas', action: 'create', subject: 'Venta' },
    { name: 'Historial Ventas', icon: '📋', path: '/app/historial-ventas', action: 'read', subject: 'Venta' },
    { name: 'Productos', icon: '👕', path: '/app/productos', action: 'read', subject: 'Producto' },
    { name: 'Usuarios', icon: '👥', path: '/app/usuarios', action: 'manage', subject: 'Usuario' },
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
    { name: 'Roles', icon: '🔐', path: '/app/roles', action: 'manage', subject: 'Rol' }
  ];

  // 🔥 FILTRADO SIMPLE Y LIMPIO - CASL DECIDE TODO
  const menuFiltrado = menuItems.filter(item => {
    if (item.any && Array.isArray(item.any)) {
      return item.any.some(p => ability.can(p.action, p.subject));
    }
    return ability.can(item.action, item.subject);
  });

  // Verificar si la ruta está activa (Evita que Dashboard se marque en otras rutas)
  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getRolDisplay = () => usuario?.nombre_rol || 'Usuario';

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

  const getPageTitle = () => {
    const currentItem = menuFiltrado.find(item => isActive(item.path));
    return currentItem?.name || 'Boutique Lojainy';
  };

  const handleLogout = () => {
    logout();
    ability.update([]);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[#FFCD00]/40">
      {/* Sidebar Desktop - Estilo Colombiano Premium */}
      <aside className="hidden lg:flex w-72 bg-[#003087] flex-col relative z-20 shadow-[4px_0_24px_rgba(0,48,135,0.15)]">
        {/* Decoración de fondo sutil */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FFCD00] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -left-24 w-48 h-48 bg-[#C8102E] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="p-6">
            <Logo size="medium" />
          </div>

          {/* Menú de Navegación */}
          <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            <p className="px-4 text-[11px] font-bold text-white/50 uppercase tracking-widest mb-4 mt-2">Menú Principal</p>
            <nav className="space-y-2">
              {menuFiltrado.length > 0 ? (
                menuFiltrado.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        active
                          ? 'bg-[#FFCD00] text-[#003087] shadow-lg shadow-[#FFCD00]/20 font-bold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                      }`}
                    >
                      {active && (
                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#C8102E]"></div>
                      )}
                      <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm tracking-wide z-10">{item.name}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-8 px-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm">No hay módulos disponibles</p>
                </div>
              )}
            </nav>
          </div>

          {/* Perfil y Logout */}
          <div className="p-4 mt-auto">
            <div className="bg-[#002266] rounded-2xl p-4 border border-white/5 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFCD00]/5 rounded-full blur-xl"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg group relative z-10"
              >
                <span className="text-base group-hover:-translate-x-1 transition-transform">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Línea superior con bandera Colombiana */}
        <div className="flex w-full h-1.5 sticky top-0 z-40 shrink-0">
          <div className="w-1/2 h-full bg-[#FFCD00]"></div>
          <div className="w-1/4 h-full bg-[#003087]"></div>
          <div className="w-1/4 h-full bg-[#C8102E]"></div>
        </div>

        {/* Botón de Menú Móvil (Solo visible en teléfonos/tablets) */}
        <div className="lg:hidden p-4 sticky top-1.5 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#003087] hover:bg-[#003087]/5 rounded-xl transition-colors flex items-center gap-2 font-extrabold"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menú</span>
          </button>
          <span className="font-extrabold text-[#003087] text-sm tracking-tight">Lojainy</span>
        </div>

        {/* Backdrop Menú Móvil */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-[#003087]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Móvil */}
        <div className={`fixed inset-y-0 left-0 w-72 bg-[#003087] z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <Logo size="medium" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-white/80 hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="px-4 text-[11px] font-bold text-white/50 uppercase tracking-widest mb-4">Menú Principal</p>
            <nav className="space-y-2">
              {menuFiltrado.length > 0 ? (
                menuFiltrado.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                        active
                          ? 'bg-[#FFCD00] text-[#003087] font-bold shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                      }`}
                    >
                      {active && (
                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#C8102E]"></div>
                      )}
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm tracking-wide">{item.name}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-8 px-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm">No tienes permisos</p>
                </div>
              )}
            </nav>
          </div>

          <div className="p-4 border-t border-white/10 bg-[#002266]">
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-red-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-md"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Área de Contenido con Scroll */}
        <main id="main-scroll-area" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          {/* Fondo de patrón sutil tipo marca de agua */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#003087 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-180px)]">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shrink-0 relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FFCD00] flex items-center justify-center shadow-sm border border-yellow-400">
                <span className="text-[10px] font-extrabold text-[#003087]">L</span>
              </div>
              <span className="font-extrabold text-[#003087] text-sm tracking-tight">Boutique Lojainy</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <div className="flex flex-col w-2 h-2 rounded-sm overflow-hidden">
                   <div className="w-full h-1/2 bg-[#FFCD00]"></div>
                   <div className="w-full h-1/4 bg-[#003087]"></div>
                   <div className="w-full h-1/4 bg-[#C8102E]"></div>
                </div>
                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Estilo Colombiano</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>© {new Date().getFullYear()} Lojainy</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Estilos Globales para Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 48, 135, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0, 48, 135, 0.3);
        }
      `}} />
    </div>
  );
};

export default MainLayout;