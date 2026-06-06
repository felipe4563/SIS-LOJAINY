import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { AbilityContext } from '../context/AbilityContext';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  ClipboardList,
  Package,
  Users,
  Tag,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard',        Icon: LayoutDashboard, path: '/app',                  action: 'read',   subject: 'Dashboard' },
  { name: 'Reportes',         Icon: BarChart3,       path: '/app/reportes',         action: 'read',   subject: 'Reporte' },
  { name: 'Nueva Venta',      Icon: ShoppingCart,    path: '/app/ventas',           action: 'create', subject: 'Venta' },
  { name: 'Historial Ventas', Icon: ClipboardList,   path: '/app/historial-ventas', action: 'read',   subject: 'Venta' },
  { name: 'Productos',        Icon: Package,         path: '/app/productos',        action: 'read',   subject: 'Producto' },
  { name: 'Usuarios',         Icon: Users,           path: '/app/usuarios',         action: 'manage', subject: 'Usuario' },
  {
    name: 'Atributos',
    Icon: Tag,
    path: '/app/atributos',
    any: [
      { action: 'manage', subject: 'Categoria' },
      { action: 'manage', subject: 'Talla' },
      { action: 'manage', subject: 'Color' },
      { action: 'manage', subject: 'Marca' },
    ],
  },
  { name: 'Roles', Icon: ShieldCheck, path: '/app/roles', action: 'manage', subject: 'Rol' },
];

const FlagStripe = ({ className = '' }) => (
  <div className={`flex ${className}`}>
    <div className="w-1/2 bg-[#FFCD00]" />
    <div className="w-1/4 bg-[#003087]" />
    <div className="w-1/4 bg-[#C8102E]" />
  </div>
);

const FlagDot = ({ size = 16 }) => (
  <div
    className="rounded-full overflow-hidden flex flex-col border border-white/20 shadow-sm shrink-0"
    style={{ width: size, height: size }}
  >
    <div className="flex-[2] bg-[#FFCD00]" />
    <div className="flex-1 bg-[#003087]" />
    <div className="flex-1 bg-[#C8102E]" />
  </div>
);

const Logo = ({ collapsed }) => (
  <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
    <div className="relative shrink-0">
      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden ring-2 ring-white/20">
        <img
          src="/logo.png"
          alt="Boutique Lojainy"
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-full bg-[#FFCD00] items-center justify-center text-[#003087] font-black text-base">
          L
        </div>
      </div>
      <div className="absolute -bottom-1.5 -right-1.5">
        <FlagDot size={14} />
      </div>
    </div>
    {!collapsed && (
      <div className="leading-none min-w-0">
        <p className="text-white font-black text-[15px] tracking-tight truncate">
          Boutique <span className="text-[#FFCD00]">Lojainy</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <FlagDot size={10} />
          <p className="text-white/50 text-[9px] font-bold uppercase tracking-[0.2em]">
            Estilo Colombiano
          </p>
        </div>
      </div>
    )}
  </div>
);

const NavLink = ({ item, active, collapsed, onClick }) => {
  const { name, Icon, path } = item;
  return (
    <Link
      to={path}
      onClick={onClick}
      title={collapsed ? name : undefined}
      className={`
        flex items-center gap-3 rounded-xl transition-all duration-200 relative
        ${collapsed ? 'justify-center px-0 py-2.5 w-10 mx-auto' : 'px-3 py-2.5'}
        ${active
          ? 'bg-[#FFCD00] text-[#003087] font-bold shadow-md shadow-[#FFCD00]/20'
          : 'text-white/65 hover:text-white hover:bg-white/10 font-medium'}
      `}
    >
      {active && !collapsed && (
        <div className="absolute right-0 top-2 bottom-2 w-[3px] rounded-l-full bg-[#C8102E]" />
      )}
      <Icon size={17} className="shrink-0" strokeWidth={active ? 2.5 : 2} />
      {!collapsed && <span className="text-sm truncate">{name}</span>}
    </Link>
  );
};

const UserCard = ({ usuario, collapsed, onLogout, getInitials, getRol }) => (
  <div className={`border-t border-white/10 p-3 space-y-1.5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
    {!collapsed ? (
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
        <div className="w-8 h-8 rounded-lg bg-[#FFCD00] flex items-center justify-center shrink-0">
          <span className="text-[#003087] font-black text-xs">{getInitials()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate">{usuario?.nombre || 'Usuario'}</p>
          <p className="text-white/45 text-[10px] capitalize truncate">{getRol()}</p>
        </div>
      </div>
    ) : (
      <div
        className="w-8 h-8 rounded-lg bg-[#FFCD00] flex items-center justify-center"
        title={usuario?.nombre}
      >
        <span className="text-[#003087] font-black text-xs">{getInitials()}</span>
      </div>
    )}

    <Link
      to="/app/perfil"
      title={collapsed ? 'Mi Perfil' : undefined}
      className={`
        flex items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200
        text-white/60 hover:text-white hover:bg-white/10
        ${collapsed ? 'w-10 h-9 justify-center' : 'w-full px-4 py-2'}
      `}
    >
      <UserCircle size={15} className="shrink-0" />
      {!collapsed && <span>Mi Perfil</span>}
    </Link>

    <button
      onClick={onLogout}
      title={collapsed ? 'Cerrar Sesión' : undefined}
      className={`
        flex items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200
        text-white/60 hover:text-white hover:bg-[#C8102E] bg-white/8
        ${collapsed ? 'w-10 h-9 justify-center' : 'w-full px-4 py-2.5'}
      `}
    >
      <LogOut size={15} className="shrink-0" />
      {!collapsed && <span>Cerrar Sesión</span>}
    </button>
  </div>
);

const MainLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const ability = useContext(AbilityContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuFiltrado = NAV_ITEMS.filter((item) => {
    if (item.any) return item.any.some((p) => ability.can(p.action, p.subject));
    return ability.can(item.action, item.subject);
  });

  const isActive = (path) => {
    if (path === '/app') return location.pathname === '/app' || location.pathname === '/app/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getInitials = () => {
    if (!usuario?.nombre) return usuario?.email?.charAt(0)?.toUpperCase() || 'U';
    const parts = usuario.nombre.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getRol = () => usuario?.nombre_rol || 'Usuario';

  const handleLogout = () => {
    logout();
    ability.update([]);
    setIsMobileOpen(false);
  };

  const sidebarW = isCollapsed ? 'w-[68px]' : 'w-60';

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 selection:bg-[#FFCD00]/40">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`hidden lg:flex flex-col ${sidebarW} bg-[#003087] transition-[width] duration-300 ease-in-out relative z-20 shrink-0 overflow-hidden`}>
        {/* ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.08]">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#FFCD00] rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -left-16 w-40 h-40 bg-[#C8102E] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo header */}
          <div className={`flex items-center h-[60px] px-4 border-b border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Logo collapsed={isCollapsed} />
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-white/40 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors shrink-0"
                title="Colapsar menú"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <div className="px-3 pt-3">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors mx-auto"
                title="Expandir menú"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-white/35 uppercase tracking-widest mb-3 mt-1">
                Menú Principal
              </p>
            )}
            {menuFiltrado.length > 0 ? (
              menuFiltrado.map((item) => (
                <NavLink
                  key={item.name}
                  item={item}
                  active={isActive(item.path)}
                  collapsed={isCollapsed}
                />
              ))
            ) : (
              <div className="text-center py-6 px-3">
                <p className="text-white/40 text-xs">Sin módulos disponibles</p>
              </div>
            )}
          </nav>

          <UserCard
            usuario={usuario}
            collapsed={isCollapsed}
            onLogout={handleLogout}
            getInitials={getInitials}
            getRol={getRol}
          />
        </div>
      </aside>

      {/* ── RIGHT SIDE ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Colombian flag stripe */}
        <FlagStripe className="h-1 shrink-0" />

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-1 text-[#003087] hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#003087] flex items-center justify-center">
              <span className="text-[#FFCD00] font-black text-[11px]">L</span>
            </div>
            <span className="font-black text-[#003087] text-sm">Boutique Lojainy</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#FFCD00] flex items-center justify-center">
            <span className="text-[#003087] font-black text-xs">{getInitials()}</span>
          </div>
        </header>

        {/* Mobile backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div className={`
          fixed inset-y-0 left-0 w-64 bg-[#003087] z-50 flex flex-col shadow-2xl lg:hidden
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between px-4 h-[60px] border-b border-white/10">
            <Logo collapsed={false} />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
            <p className="px-3 text-[10px] font-bold text-white/35 uppercase tracking-widest mb-3">
              Menú Principal
            </p>
            {menuFiltrado.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                active={isActive(item.path)}
                collapsed={false}
                onClick={() => setIsMobileOpen(false)}
              />
            ))}
          </nav>

          <UserCard
            usuario={usuario}
            collapsed={false}
            onLogout={handleLogout}
            getInitials={getInitials}
            getRol={getRol}
          />
        </div>

        {/* Main scroll area */}
        <main
          id="main-scroll-area"
          className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-9.5rem)]">
                <Outlet />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 bg-white border-t border-slate-200 py-3 px-6 z-10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FlagStripe className="h-3 w-6 rounded overflow-hidden" />
              <span className="font-semibold text-slate-500">Boutique Lojainy</span>
            </div>
            <span>© {new Date().getFullYear()} Lojainy</span>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,48,135,0.12); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(0,48,135,0.28); }
        .bg-white\\/8 { background-color: rgba(255,255,255,0.08); }
      ` }} />
    </div>
  );
};

export default MainLayout;
