import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AbilityContext } from "../context/AbilityContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ accion, recurso, children }) => {
  const { usuario } = useContext(AuthContext);
  const ability = useContext(AbilityContext);

  if (!usuario) return <Navigate to="/login" replace />;

  if (!ability.can(accion, recurso)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
