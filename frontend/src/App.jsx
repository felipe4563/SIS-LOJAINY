import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { AbilityContext } from "./context/AbilityContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Usuarios from "./pages/Usuarios";
import Roles from "./pages/Roles";
import Ventas from "./pages/Ventas";
import Reportes from "./pages/Reportes";

// 🔐 Ruta protegida con CASL
const ProtectedRoute = ({ action, subject, children }) => {
  const { usuario } = useContext(AuthContext);
  const ability = useContext(AbilityContext);

  if (!usuario) return <Navigate to="/login" replace />;

  if (!ability.can(action, subject)) {
    return <Navigate to="/app" replace />;
  }

  return children;
};

function App() {
  const { usuario } = useContext(AuthContext);

  return (
    <Routes>
      {/* 🏪 Página pública */}
      <Route path="/" element={<Home />} />

      {/* 🔑 Login */}
      <Route
        path="/login"
        element={!usuario ? <Login /> : <Navigate to="/app" replace />}
      />

      {/* 🔒 Sistema */}
      <Route
        path="/app"
        element={usuario ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        {/* Dashboard */}
        <Route
          index
          element={
            <ProtectedRoute action="read" subject="Dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Ventas */}
        <Route
          path="ventas"
          element={
            <ProtectedRoute action="read" subject="Venta">
              <Ventas />
            </ProtectedRoute>
          }
        />

        {/* Productos */}
        <Route
          path="productos"
          element={
            <ProtectedRoute action="read" subject="Producto">
              <Productos />
            </ProtectedRoute>
          }
        />

        {/* Usuarios */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute action="manage" subject="Usuario">
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Roles */}
        <Route
          path="roles"
          element={
            <ProtectedRoute action="manage" subject="Role">
              <Roles />
            </ProtectedRoute>
          }
        />

        {/* Reportes */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute action="read" subject="Reporte">
              <Reportes />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={usuario ? "/app" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
