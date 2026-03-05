import { Tabs, Tab, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tab = location.pathname.split("/")[1] || false;

  const leftTabs = ["facturacion", "verificador", "registro", "maestros"];

  const leftValue = leftTabs.includes(tab) ? tab : false;
  const rightValue = tab === "perfil" ? "perfil" : false;

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "white",
        display: "flex",
        justifyContent: "space-between",
        px: 2,
      }}
    >
      {/* IZQUIERDA */}
      <Tabs
        value={leftValue}
        onChange={(e, value) => navigate(`/${value}`)}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Crear factura" value="facturacion" />
        <Tab label="Verificadores" value="verificadores/qr" />
        <Tab label="Registro" value="registro" />
        <Tab label="Maestros" value="maestros" />
      </Tabs>

      {/* DERECHA */}
      <Tabs
        value={rightValue}
        onChange={(e, value) => navigate(`/${value}`)}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Perfil" value="perfil" />
      </Tabs>
    </Box>
  );
}

export default TopNav;
