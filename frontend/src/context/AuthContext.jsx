import { createContext, useState, useEffect } from 'react';
import { ability } from '../ability/ability';
import { defineAbilityFor } from '../ability/defineAbilityFor';
import { obtenerPerfil } from '../services/perfil';

export const AuthContext = createContext();

// El JWT ya trae { id_usuario, id_rol, permisos, exp }; lo leemos sin librerías extra.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  // Al recargar la página el estado en memoria se pierde, pero el token sigue
  // en localStorage: reconstruimos usuario/permisos a partir de él en vez de
  // forzar un nuevo login.
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    if (!tokenGuardado) {
      setCargandoSesion(false);
      return;
    }

    const decoded = decodeToken(tokenGuardado);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      setToken(null);
      setCargandoSesion(false);
      return;
    }

    const nuevaAbility = defineAbilityFor(decoded.permisos || []);
    ability.update(nuevaAbility.rules);

    obtenerPerfil()
      .then(perfil => {
        setUsuario({ ...perfil, permisos: decoded.permisos || [] });
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        setCargandoSesion(false);
      });
  }, []);

  const logout = () => {
    ability.update([]);
    setUsuario(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, token, setToken, logout, cargandoSesion }}>
      {children}
    </AuthContext.Provider>
  );
};
