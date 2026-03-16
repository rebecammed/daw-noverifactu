import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import SubidaFactura from "./SubidaFactura";
import ListadoFacturas from "./ListadoFacturas";
import DetalleFactura from "./DetalleFactura";
import RectificarFactura from "./RectificarFactura";
import AnularFactura from "./AnularFactura";
import DatosTarifas from "./DatosTarifas";
import Register from "./Registrarse";
import Landing from "./Landing";

import AdminDashboard from "./admin/AdminDashboard";
import AdminUsuarios from "./admin/AdminUsuarios";
import AdminIntegridad from "./admin/AdminIntegridad";
import AdminBackups from "./admin/AdminBackups";
import AdminFacturas from "./admin/AdminFacturas";
import AdminConfiguracion from "./admin/AdminConfiguracion";
import ForgotPassword from "./seguridad/ForgotPassword";
import ResetPassword from "./seguridad/ResetPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import Empresa from "./perfil/Empresa";
import Tarifas from "./perfil/Tarifas";
import Clientes from "./perfil/Clientes";
import GestionSIF from "./perfil/GestionSIF";
import Activar2FA from "./seguridad/Activar2FA";
import CambiarPassword from "./seguridad/CambiarPassword";
import VerificadorFactura from "./verificadores/VerificadorFactura";
import PoliticaPrivacidad from "./seguridad/PoliticaPrivacidad";
import VerificarEmail from "./seguridad/VerificarEmail";
import VerificarQR from "./verificadores/VerificarQR";
import AdminLogs from "./admin/AdminLogs";
import Dashboard from "./perfil/Dashboard";
import AdminLogsUsuario from "./admin/AdminLogsUsuario";
import Productos from "./perfil/Productos";

import OptionalDashboardLayout from "./layouts/OptionalDashboardLayout";
const API_URL = process.env.VITE_API_URL;
function App() {
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState(false);
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado || usuarioGuardado === "undefined") {
      return null;
    }

    try {
      return JSON.parse(usuarioGuardado);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    async function cargarEstado() {
      try {
        const res = await fetch(`${API_URL}/api/status`);
        const data = await res.json();
        setMantenimiento(data.mantenimiento);
        console.log(import.meta.env.VITE_API_URL);
      } catch {
        setMantenimiento(false);
      }
    }

    cargarEstado();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/login");
  }
  return (
    <>
      {/* ===== MENÚ SUPERIOR ===== */}
      {mantenimiento && (
        <div
          style={{
            backgroundColor: "#b91c1c",
            color: "white",
            padding: "10px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          ⚠ Sistema en mantenimiento. Algunas funciones están deshabilitadas.
        </div>
      )}

      {/* ===== CONTENIDO ===== */}
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/verificar-qr"
            element={
              <OptionalDashboardLayout>
                <VerificarQR />
              </OptionalDashboardLayout>
            }
          />
          <Route
            path="/verificadores"
            element={
              <OptionalDashboardLayout>
                <VerificadorFactura />
              </OptionalDashboardLayout>
            }
          />
          <Route path="/login" element={<Login setUsuario={setUsuario} />} />
          <Route path="/register" element={<Register />} />

          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute usuario={usuario} />}>
            <Route element={<DashboardLayout usuario={usuario} />}>
              <Route
                path="/perfil"
                element={<DatosTarifas key="perfil-root" />}
              >
                <Route index element={<Dashboard />} />
                <Route path="empresa" element={<Empresa />} />
                <Route path="tarifas" element={<Tarifas />} />
                <Route
                  path="seguridad"
                  element={
                    <>
                      <Activar2FA />
                      <CambiarPassword />
                    </>
                  }
                />
                <Route path="sif" element={<GestionSIF />} />
              </Route>
              <Route path="/facturacion" element={<SubidaFactura />} />

              <Route path="/maestros">
                <Route path="clientes" element={<Clientes />} />
                <Route path="productos" element={<Productos />} />
                <Route index element={<Navigate to="clientes" replace />} />
              </Route>
              <Route path="/registro" element={<ListadoFacturas />} />
              <Route path="/registro/:id" element={<DetalleFactura />} />
              <Route
                path="/registro/:id/anulacion"
                element={<AnularFactura />}
              />
              <Route
                path="/rectificar/:facturaId"
                element={<RectificarFactura />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/integridad" element={<AdminIntegridad />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route
                path="/admin/logs/:usuarioId"
                element={<AdminLogsUsuario />}
              />
              <Route path="/admin/backups" element={<AdminBackups />} />
              <Route path="/admin/facturas" element={<AdminFacturas />} />
              <Route
                path="/admin/configuracion"
                element={<AdminConfiguracion />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
