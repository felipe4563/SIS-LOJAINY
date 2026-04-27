import { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';
import { ability } from '../ability/ability';
import { defineAbilityFor } from '../ability/defineAbilityFor.js';

// Componente del Logo
const Logo = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="relative group mb-4">
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden transition-transform group-hover:scale-105 duration-300 ring-4 ring-[#003087]/10">
        <img 
          src="/logo.png" 
          alt="Boutique Lojainy" 
          className="w-full h-full object-contain p-2 relative z-10"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-full bg-[#FFCD00] items-center justify-center text-[#003087] font-bold text-4xl">
          L
        </div>
      </div>
      {/* Decoración Bandera Colombiana Circular */}
      <div className="absolute -bottom-3 -right-3 flex flex-col w-10 h-10 rounded-full overflow-hidden border-4 border-white shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300 z-20">
        <div className="w-full h-1/2 bg-[#FFCD00]"></div>
        <div className="w-full h-1/4 bg-[#003087]"></div>
        <div className="w-full h-1/4 bg-[#C8102E]"></div>
      </div>
    </div>
    
    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none text-[#003087] mt-2 relative z-10">
      Boutique <span className="text-[#C8102E]">Lojainy</span>
    </h1>
    
    <div className="flex items-center gap-2 mt-2">
      <div className="flex flex-col w-3 h-3 rounded-full overflow-hidden shadow-sm">
         <div className="w-full h-1/2 bg-[#FFCD00]"></div>
         <div className="w-full h-1/4 bg-[#003087]"></div>
         <div className="w-full h-1/4 bg-[#C8102E]"></div>
      </div>
      <p className="text-slate-500 text-[11px] uppercase tracking-[0.2em] font-bold">Estilo Colombiano</p>
    </div>
  </div>
);

// Componente para ropas flotando
const FloatingClothes = () => {
  const ropas = ['👗', '👕', '🥻', '👖', '🧥', '🧦', '👠', '👜', '👚', '👔'];
  
  // Generar posiciones, tamaños y duraciones aleatorias de forma consistente (memoizado)
  const items = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      ropa: ropas[Math.floor(Math.random() * ropas.length)],
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
      fontSize: `${Math.random() * 1.5 + 1.5}rem`,
      opacity: Math.random() * 0.3 + 0.1
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <div 
          key={item.id}
          className="absolute bottom-[-10%] animate-float"
          style={{
            left: item.left,
            animationDuration: item.animationDuration,
            animationDelay: item.animationDelay,
            fontSize: item.fontSize,
            opacity: item.opacity
          }}
        >
          {item.ropa}
        </div>
      ))}
    </div>
  );
};

const Login = () => {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUsuario, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await login(identificador, password);
      const nuevaAbility = defineAbilityFor(data.usuario.permisos);
      ability.update(nuevaAbility.rules);

      setUsuario(data.usuario);
      setToken(data.token);

      navigate('/app');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden font-sans">
      
      {/* Fondo con temática colombiana y luces suaves (ya no es fondo azul oscuro) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#FFCD00] rounded-full blur-[100px] opacity-[0.15] animate-pulse-slow"></div>
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-[#003087] rounded-full blur-[100px] opacity-[0.1]"></div>
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-[#C8102E] rounded-full blur-[100px] opacity-[0.15]"></div>
      </div>

      {/* Ropas Flotando en el fondo */}
      <FloatingClothes />

      {/* Línea superior con bandera Colombiana (Global) */}
      <div className="absolute top-0 left-0 w-full h-2 flex z-40">
        <div className="w-1/2 h-full bg-[#FFCD00]"></div>
        <div className="w-1/4 h-full bg-[#003087]"></div>
        <div className="w-1/4 h-full bg-[#C8102E]"></div>
      </div>

      {/* Tarjeta de login principal */}
      <div className="relative w-full max-w-sm sm:max-w-md animate-fade-in-up z-10">
        {/* Efecto de sombra detrás de la tarjeta */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FFCD00] via-[#003087] to-[#C8102E] rounded-[2rem] blur opacity-20 z-0"></div>
        
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 border border-white">
          
          {/* Contenido principal */}
          <div className="px-6 py-10 sm:px-10 sm:py-12 relative z-20">
            
            {/* Logo y título */}
            <div className="text-center mb-10">
              <Logo />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#C8102E] rounded-r-xl flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 text-[#C8102E] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo Identificador */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Correo electrónico o número de cédula
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003087] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition-all text-slate-800 font-medium placeholder-slate-400"
                    placeholder="ci o correo"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003087] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition-all text-slate-800 font-medium placeholder-slate-400 tracking-wider"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#003087] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#C8102E] hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-[#C8102E]/30 transform active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validando...
                    </>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Adorno Inferior Tarjeta */}
          <div className="h-2 w-full flex relative z-20">
            <div className="w-1/2 h-full bg-[#FFCD00]"></div>
            <div className="w-1/4 h-full bg-[#003087]"></div>
            <div className="w-1/4 h-full bg-[#C8102E]"></div>
          </div>
        </div>
      </div>

      {/* Nota en la parte inferior */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-sm text-slate-500 font-medium bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
          Sistema de Gestión Boutique Lojainy © {new Date().getFullYear()}
        </p>
      </div>

      {/* Estilos para animaciones */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity, 0.3);
          }
          90% {
            opacity: var(--opacity, 0.3);
          }
          100% {
            transform: translateY(-20vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}} />
    </div>
  );
};

export default Login;