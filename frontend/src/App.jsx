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
import VentasLista from "./pages/VentasLista";
import Reportes from "./pages/Reportes";
import Atributos from "./pages/Atributos";
import Perfil from "./pages/Perfil";

// 🔐 Ruta protegida con CASL
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { usuario, cargandoSesion } = useContext(AuthContext);

  if (cargandoSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-[#003087] border-t-transparent animate-spin" />
      </div>
    );
  }

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
            <ProtectedRoute action="create" subject="Venta">
              <Ventas />
            </ProtectedRoute>
          }
        />

        {/* Historial Ventas */}
        <Route
          path="historial-ventas"
          element={
            <ProtectedRoute action="read" subject="Venta">
              <VentasLista />
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

        <Route
          path="roles"
          element={
            <ProtectedRoute action="manage" subject="Rol">
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
        {/* Atributos */}

        <Route
          path="atributos"
          element={
            <ProtectedRoute any={[
              { action: "manage", subject: "Categoria" },
              { action: "manage", subject: "Talla" },
              { action: "manage", subject: "Color" },
              { action: "manage", subject: "Marca" },
            ]}>
              <Atributos />
            </ProtectedRoute>
          }
        />
        {/* Mi Perfil — sin restricción de permisos, cualquier usuario autenticado */}
        <Route path="perfil" element={<Perfil />} />
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
