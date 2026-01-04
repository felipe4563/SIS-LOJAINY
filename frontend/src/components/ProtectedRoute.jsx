// ProtectedRoute.jsx - Versión mejorada
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AbilityContext } from "../context/AbilityContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ 
  action, 
  subject, 
  any: anyPermissions,  // Renombrar para claridad
  children 
}) => {
  const { usuario } = useContext(AuthContext);
  const ability = useContext(AbilityContext);

  // 1. Verificar autenticación
  if (!usuario) return <Navigate to="/login" replace />;

  // 2. Si se especifican permisos múltiples (any)
  if (anyPermissions && Array.isArray(anyPermissions)) {
    const tienePermiso = anyPermissions.some(p => 
      ability.can(p.action, p.subject)
    );
    if (!tienePermiso) return <Navigate to="/app" replace />;
    return children;
  }

  // 3. Si se especifica un solo permiso (action/subject)
  if (action && subject && !ability.can(action, subject)) {
    return <Navigate to="/app" replace />;
  }

  // 4. Si no se especifican permisos, solo verifica autenticación
  return children;
};

export default ProtectedRoute;