import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TopNav from "../components/TopNav";
import SidebarPerfil from "../components/SidebarPerfil";
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

      if (value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");

      return params;
    });
  };
  const limpiarFiltros = () => {
    setSearchParams({});
  };

  const setFiltro = (key) => (value) => actualizarFiltro(key, value);

  const renderSidebar = () => {
    const path = location.pathname;

    if (path.startsWith("/admin")) return <SidebarAdmin />;

    if (path.startsWith("/perfil")) return <SidebarPerfil />;
    if (path.startsWith("/verificadores/xml")) return null;
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
          limpiarFiltros={limpiarFiltros}
        />
      );
    }

    return null;
  };
  const sidebar = renderSidebar();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header usuario={usuario} sidebar={sidebar} />
      <TopNav />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar desktop */}
        {sidebar && (
          <Box
            sx={{
              width: { xs: 0, md: 220 },
              borderRight: { md: "1px solid #eee", xs: "none" },
              bgcolor: "#fafafa",
              py: 2,
              px: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            {sidebar}
          </Box>
        )}

        {/* Contenido */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
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
