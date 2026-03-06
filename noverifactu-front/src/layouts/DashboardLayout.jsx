import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TopNav from "../components/TopNav";
import SidebarPerfil from "../components/SidebarPerfil";
import SidebarVerificador from "../components/SidebarVerificador";
import SidebarRegistro from "../components/SidebarRegistro";
import SidebarAdmin from "../components/SidebarAdmin";
import SidebarMaestros from "../components/SidebarMaestros";
import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useSearchParams } from "react-router-dom";

function DashboardLayout({ usuario, children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fechaInicio = searchParams.get("fechaInicio") || "";
  const fechaFin = searchParams.get("fechaFin") || "";
  const busqueda = searchParams.get("q") || "";
  const orden = searchParams.get("orden") || "desc";
  const clienteSeleccionado = searchParams.get("cliente") || "";
  const [clientes, setClientes] = useState([]);
  const location = useLocation();

  useEffect(() => {
    async function cargarClientes() {
      try {
        const res = await authFetch("/api/clientes");
        const data = await res.json();
        setClientes(data.clientes || []);
      } catch {
        setClientes([]);
      }
    }

    cargarClientes();
  }, []);

  const actualizarFiltro = (key, value) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      return params;
    });
  };

  const setFiltro = (key) => (value) => actualizarFiltro(key, value);

  const renderSidebar = () => {
    const path = location.pathname;

    if (path.startsWith("/admin")) return <SidebarAdmin />;

    if (path.startsWith("/perfil")) return <SidebarPerfil />;
    if (path.startsWith("/verificadores")) return <SidebarVerificador />;
    if (path.startsWith("/maestros")) return <SidebarMaestros />;

    if (path.startsWith("/registro")) {
      if (path.includes("/registro/")) return null;
      return (
        <SidebarRegistro
          fechaInicio={fechaInicio}
          setFechaInicio={setFiltro("fechaInicio")}
          fechaFin={fechaFin}
          setFechaFin={setFiltro("fechaFin")}
          busqueda={busqueda}
          setBusqueda={setFiltro("q")}
          orden={orden}
          setOrden={setFiltro("orden")}
          clienteSeleccionado={clienteSeleccionado}
          setClienteSeleccionado={setFiltro("cliente")}
          clientes={clientes}
        />
      );
    }

    return null;
  };
  const sidebar = renderSidebar();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header usuario={usuario} />
      <TopNav />

      <Box sx={{ flex: 1, display: "flex" }}>
        {sidebar && (
          <Box
            sx={{
              width: 220,
              borderRight: "1px solid #eee",
              bgcolor: "#fafafa",
              py: 2,
              px: 0,
            }}
          >
            {sidebar}
          </Box>
        )}

        {/* Contenido */}
        <Box sx={{ flex: 1, p: 4 }}>
          {children ? (
            children
          ) : (
            <Outlet
              context={{
                fechaInicio,
                fechaFin,
                busqueda,
                orden,
                clienteSeleccionado,
                clientes,
              }}
            />
          )}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default DashboardLayout;
