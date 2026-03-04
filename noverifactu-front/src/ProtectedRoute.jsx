import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ usuario, adminOnly = false }) {
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && usuario.rol !== "ADMIN") {
    return <Navigate to="/perfil" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
