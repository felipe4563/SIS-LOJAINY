import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { login } from '../services/auth.js';
import { useNavigate } from 'react-router-dom';
import { ability } from '../ability/ability';
import { defineAbilityFor } from '../ability/defineAbilityFor.js';

// Componente del Logo Mejorado
const Logo = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="relative mb-4">
      <img 
        src="/logo.png" 
        alt="Boutique Lojainy Logo" 
        className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
      />
      {/* Decoración colombiana alrededor del logo */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-yellow-400"></div>
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-red-600"></div>
      <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500"></div>
    </div>
    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-blue-500 to-red-600 bg-clip-text text-transparent">
      Boutique Lojainy
    </h1>
    <p className="text-gray-600 text-sm mt-1">Moda Colombiana con Estilo</p>
  </div>
);

// Patrones colombianos decorativos
const ColombianPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Líneas decorativas en los bordes */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-600"></div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-blue-500 to-yellow-400"></div>
    
    {/* Patrones decorativos */}
    <div className="absolute top-10 left-10">
      <div className="w-8 h-8 border-2 border-yellow-400/30 rotate-45"></div>
    </div>
    <div className="absolute bottom-10 right-10">
      <div className="w-8 h-8 border-2 border-blue-500/30 rotate-45"></div>
    </div>
    
    {/* Puntos decorativos */}
    <div className="absolute top-1/4 right-20">
      <div className="w-3 h-3 bg-red-600/20 rounded-full"></div>
    </div>
    <div className="absolute bottom-1/3 left-20">
      <div className="w-4 h-4 bg-blue-500/20 rounded-full"></div>
    </div>
  </div>
);

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-yellow-50 via-white to-blue-50 relative overflow-hidden">
      {/* Fondo con motivos colombianos */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-red-600/5 rounded-full"></div>
        
        {/* Patrones de tejido colombiano */}
        <div className="absolute top-20 right-10 w-24 h-24">
          <div className="w-full h-full border-2 border-yellow-400/10 rounded-lg rotate-12"></div>
        </div>
        <div className="absolute bottom-20 left-10 w-32 h-32">
          <div className="w-full h-full border-2 border-blue-500/10 rounded-lg -rotate-12"></div>
        </div>
      </div>

      {/* Tarjeta de login principal */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg">
        {/* Tarjeta flotante con efecto 3D */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 transform transition-all duration-300 hover:shadow-3xl">
          {/* Borde decorativo superior */}
          <div className="relative h-3 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-600">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          
          {/* Contenido principal */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Logo y título */}
            <div className="text-center mb-8">
              <Logo />
              <div className="mt-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Sistema de Gestión Boutique Lojainy
                </h2>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Identificador */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Cédula o Correo Electrónico
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    required
                    className="block w-full px-4 py-3 pl-12 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="ci o usuario@lojainy.com"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Contraseña
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-3 pl-12 pr-12 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Ingrese su contraseña"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 via-blue-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validando credenciales...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        Ingresar al Sistema
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Decoración inferior */}
          <div className="relative h-3 bg-gradient-to-r from-red-600 via-blue-500 to-yellow-400">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Efecto de sombra detrás */}
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-blue-500/20 to-red-600/20 rounded-3xl blur-xl -z-10"></div>
      </div>

      {/* Nota en la parte inferior */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          🇨🇴 Orgullosamente Colombiana • Boutique Lojainy © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;